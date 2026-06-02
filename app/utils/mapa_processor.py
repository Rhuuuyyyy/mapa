"""
Processador MAPA - Matching de empresas/produtos com catálogo.
Valida e agrega dados para relatório trimestral.
"""

from decimal import Decimal
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from collections import defaultdict

from app import models
from app.utils.nfe_processor import NFeProcessor


class MAPAProcessor:
    """
    Processa uploads e faz matching com catálogo do usuário.
    """

    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        self.nfe_processor = NFeProcessor()

        # Carregar catálogo do usuário em memória (performance)
        self._load_catalog()

    def _load_catalog(self):
        """
        Carrega catálogo de empresas e produtos do usuário.
        Cria índices para busca rápida.
        """
        companies = self.db.query(models.Company).filter(
            models.Company.user_id == self.user_id
        ).all()

        # Índice: company_name -> Company
        self.company_index = {
            company.company_name.strip(): company
            for company in companies
        }

        # Índice: (company_id, product_name) -> Product
        self.product_index = {}
        for company in companies:
            for product in company.products:
                key = (company.id, product.product_name.strip())
                self.product_index[key] = product

    def process_uploads(self, uploads: List[models.XMLUpload]) -> dict:
        """
        Processa lista de uploads e gera dados agregados.

        Returns:
            dict com:
                - success: bool
                - message: str
                - total_nfes: int
                - rows: List[dict] (se sucesso)
                - error: str (se erro)
                - unregistered_entries: List[dict] (se erro)
        """
        aggregated_data = defaultdict(lambda: {
            "quantity_import": Decimal("0"),
            "quantity_domestic": Decimal("0"),
            "product_name": None,
            "product_reference": None,
            "source_nfes": []
        })

        unregistered_entries = []
        processed_nfes = 0

        for upload in uploads:
            # Processar arquivo
            nfe_data = self.nfe_processor.process_file(upload.file_path)

            if not nfe_data:
                continue

            processed_nfes += 1

            # Buscar empresa no catálogo
            company_name = (nfe_data.emitente_razao_social or "").strip()
            company = self.company_index.get(company_name)

            if not company:
                # Empresa não cadastrada - adicionar TODOS os produtos desta NF-e aos erros
                for produto in nfe_data.produtos:
                    unregistered_entries.append({
                        "error_type": "company",
                        "company_name": company_name,
                        "product_name": (produto.get("descricao") or "").strip(),
                        "nfe_number": nfe_data.numero_nota,
                        "quantity": str(produto.get("quantidade", 0)),
                        "unit": produto.get("unidade", "")
                    })
                continue

            # Processar produtos desta NF-e
            for produto in nfe_data.produtos:
                product_name = (produto.get("descricao") or "").strip()

                # Buscar produto no catálogo
                product_entry = self.product_index.get((company.id, product_name))

                if not product_entry:
                    # Produto não cadastrado
                    unregistered_entries.append({
                        "error_type": "product",
                        "company_name": company_name,
                        "product_name": product_name,
                        "nfe_number": nfe_data.numero_nota,
                        "quantity": str(produto.get("quantidade", 0)),
                        "unit": produto.get("unidade", "")
                    })
                    continue

                # Montar registro MAPA completo
                mapa_registration = f"{company.mapa_registration}-{product_entry.mapa_registration}"

                # Converter quantidade para toneladas
                quantity = produto.get("quantidade", Decimal("0"))
                unit = produto.get("unidade", "").upper().strip()
                quantity_tonnes = self._convert_to_tonnes(quantity, unit)

                # Classificar Import vs Domestic
                is_import = (nfe_data.emitente_uf == "EX")

                # Agregar
                if is_import:
                    aggregated_data[mapa_registration]["quantity_import"] += quantity_tonnes
                else:
                    aggregated_data[mapa_registration]["quantity_domestic"] += quantity_tonnes

                aggregated_data[mapa_registration]["product_name"] = product_entry.product_name
                aggregated_data[mapa_registration]["product_reference"] = product_entry.product_reference
                aggregated_data[mapa_registration]["source_nfes"].append(nfe_data.numero_nota)

        # Verificar se há erros
        if unregistered_entries:
            company_errors = len([e for e in unregistered_entries if e["error_type"] == "company"])
            product_errors = len([e for e in unregistered_entries if e["error_type"] == "product"])

            return {
                "success": False,
                "error": f"Encontrados erros: {company_errors} empresa(s) não cadastrada(s), {product_errors} produto(s) não cadastrado(s).",
                "unregistered_entries": unregistered_entries
            }

        # Sucesso - formatar rows
        rows = []
        for mapa_reg, data in aggregated_data.items():
            # Formatar quantidades: 2 casas decimais, remover trailing zeros
            qty_import = data["quantity_import"].quantize(Decimal("0.01"))
            qty_domestic = data["quantity_domestic"].quantize(Decimal("0.01"))

            # Converter para string removendo zeros desnecessários
            qty_import_str = str(qty_import).rstrip('0').rstrip('.')
            qty_domestic_str = str(qty_domestic).rstrip('0').rstrip('.')

            # Debug: log dos valores formatados
            print(f"DEBUG: Formatting quantities for {mapa_reg}")
            print(f"  Import: {data['quantity_import']} → {qty_import} → '{qty_import_str}'")
            print(f"  Domestic: {data['quantity_domestic']} → {qty_domestic} → '{qty_domestic_str}'")

            rows.append({
                "mapa_registration": mapa_reg,
                "product_name": data["product_name"],
                "product_reference": data["product_reference"],
                "unit": "Tonelada",
                "quantity_import": qty_import_str if qty_import else "0",
                "quantity_domestic": qty_domestic_str if qty_domestic else "0",
                "source_nfes": list(set(data["source_nfes"]))  # Remove duplicatas
            })

        return {
            "success": True,
            "message": "Relatório processado com sucesso",
            "total_nfes": processed_nfes,
            "rows": rows
        }

    def _convert_to_tonnes(self, quantity: Decimal, unit: str) -> Decimal:
        """
        Converte quantidade para toneladas.

        Unidades suportadas:
            - TON, TONELADA, TONELADAS, TN, T, TONS -> 1:1
            - KG, QUILOGRAMA, QUILOGRAMAS, KGS, KILO, KILOS -> 1000:1
        """
        # Normalizar: remover pontos, vírgulas e espaços extras
        unit_normalized = unit.upper().strip().replace('.', '').replace(',', '').replace(' ', '')

        # Debug: log da conversão
        print(f"DEBUG: Converting {quantity} {unit} (normalized: {unit_normalized})")

        # Já em toneladas - expandido para cobrir mais variações
        tonnes_units = [
            "TON", "TONELADA", "TONELADAS", "TN", "T", "TONS",
            "TONELADA(S)", "TON(S)", "TONNE", "TONNES", "MT"
        ]
        if unit_normalized in tonnes_units:
            print(f"  → Already in tonnes: {quantity}")
            return quantity

        # Quilogramas -> Toneladas
        kg_units = [
            "KG", "QUILOGRAMA", "QUILOGRAMAS", "KGS", "KILO", "KILOS",
            "QUILOGRAMA(S)", "KG(S)", "KILOGRAMAS", "KILOGRAMA"
        ]
        if unit_normalized in kg_units:
            result = quantity / Decimal("1000")
            print(f"  → KG to tonnes: {quantity} / 1000 = {result}")
            return result

        # Unidade desconhecida - LOG WARNING e assumir KG (padrão seguro)
        print(f"  ⚠️  WARNING: Unknown unit '{unit}' (normalized: '{unit_normalized}'). Assuming KG.")
        result = quantity / Decimal("1000")
        print(f"  → Default KG to tonnes: {quantity} / 1000 = {result}")
        return result
