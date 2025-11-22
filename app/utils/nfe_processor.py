"""
Processador de NF-e (XML e PDF).
Extrai dados de emitente, destinatário, produtos, nutrientes, etc.
"""

import re
from decimal import Decimal
from typing import Dict, List, Optional
from lxml import etree
import pdfplumber


class NFeData:
    """Estrutura de dados de uma NF-e processada"""

    def __init__(self):
        self.chave_acesso: Optional[str] = None
        self.numero_nota: Optional[str] = None
        self.serie: Optional[str] = None
        self.data_emissao: Optional[str] = None

        # Emitente
        self.emitente_cnpj: Optional[str] = None
        self.emitente_razao_social: Optional[str] = None
        self.emitente_nome_fantasia: Optional[str] = None
        self.emitente_uf: Optional[str] = None

        # Destinatário
        self.destinatario_cnpj: Optional[str] = None
        self.destinatario_razao_social: Optional[str] = None

        # Produtos
        self.produtos: List[Dict] = []

    def to_dict(self) -> dict:
        """Converte para dicionário"""
        return {
            "chave_acesso": self.chave_acesso,
            "numero_nota": self.numero_nota,
            "serie": self.serie,
            "data_emissao": self.data_emissao,
            "emitente": {
                "cnpj": self.emitente_cnpj,
                "razao_social": self.emitente_razao_social,
                "nome_fantasia": self.emitente_nome_fantasia,
                "uf": self.emitente_uf
            },
            "destinatario": {
                "cnpj": self.destinatario_cnpj,
                "razao_social": self.destinatario_razao_social
            },
            "produtos": self.produtos
        }


class NFeProcessor:
    """
    Processador de arquivos NF-e (XML e PDF).
    """

    # Namespaces NFe
    NAMESPACES = {
        'nfe': 'http://www.portalfiscal.inf.br/nfe'
    }

    # Padrões regex para nutrientes
    NUTRIENT_PATTERNS = {
        'N': [r'N\s*TOTAL\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*%', r'NITROGENIO\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*%'],
        'P2O5_TOTAL': [r'P2?O5?\s*TOTAL\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*%'],
        'P2O5_SOLUVEL': [r'P2?O5?\s*SOL[UÚ]VEL\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*%'],
        'K2O': [r'K2?O\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*%'],
        'Ca': [r'Ca\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*%', r'CALCIO\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*%'],
        'Mg': [r'Mg\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*%', r'MAGNESIO\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*%'],
        'S': [r'S\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*%', r'ENXOFRE\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*%'],
    }

    # Padrões para registro MAPA
    MAPA_PATTERNS = [
        r'REGISTRO\s*MAPA[:\-]?\s*([A-Z]{2}[\-\s]?\d{5,6}[\-\s]?\d{1,7}\.?\d{0,6})',
        r'REG\.?\s*MAPA[:\-]?\s*([A-Z]{2}[\-\s]?\d{5,6}[\-\s]?\d{1,7}\.?\d{0,6})',
        r'([A-Z]{2}[\-\s]?\d{5,6}[\-\s]?\d{1,7}\.?\d{0,6})',
    ]

    def __init__(self):
        pass

    def process_file(self, file_path: str) -> Optional[NFeData]:
        """
        Processa arquivo (XML ou PDF) e retorna NFeData.
        """
        file_path_lower = file_path.lower()

        if file_path_lower.endswith('.xml'):
            return self.process_xml(file_path)
        elif file_path_lower.endswith('.pdf'):
            return self.process_pdf(file_path)
        else:
            raise ValueError(f"Tipo de arquivo não suportado: {file_path}")

    def process_xml(self, file_path: str) -> Optional[NFeData]:
        """
        Processa XML de NF-e.
        SEGURANÇA: Parser configurado para prevenir XXE (XML External Entity) attacks.
        """
        try:
            # Parser seguro que desabilita entidades externas (prevenção XXE)
            parser = etree.XMLParser(
                resolve_entities=False,  # Não resolver entidades externas
                no_network=True,         # Não fazer requisições de rede
                dtd_validation=False,    # Não validar DTD
                load_dtd=False           # Não carregar DTD externo
            )
            tree = etree.parse(file_path, parser)
            root = tree.getroot()

            nfe_data = NFeData()

            # Namespace-aware XPath
            ns = self.NAMESPACES

            # Chave de acesso
            inf_nfe = root.find('.//nfe:infNFe', ns)
            if inf_nfe is not None:
                nfe_data.chave_acesso = inf_nfe.get('Id', '').replace('NFe', '')

            # Identificação
            ide = root.find('.//nfe:ide', ns)
            if ide is not None:
                nfe_data.numero_nota = self._get_text(ide, 'nfe:nNF', ns)
                nfe_data.serie = self._get_text(ide, 'nfe:serie', ns)

                # Data de emissão (formato: YYYY-MM-DD ou YYYY-MM-DDTHH:MM:SS)
                dhemi = self._get_text(ide, 'nfe:dhEmi', ns)
                if dhemi:
                    nfe_data.data_emissao = dhemi.split('T')[0]

            # Emitente
            emit = root.find('.//nfe:emit', ns)
            if emit is not None:
                nfe_data.emitente_cnpj = self._get_text(emit, 'nfe:CNPJ', ns)
                nfe_data.emitente_razao_social = self._get_text(emit, 'nfe:xNome', ns)
                nfe_data.emitente_nome_fantasia = self._get_text(emit, 'nfe:xFant', ns)

                ender_emit = emit.find('nfe:enderEmit', ns)
                if ender_emit is not None:
                    nfe_data.emitente_uf = self._get_text(ender_emit, 'nfe:UF', ns)

            # Destinatário
            dest = root.find('.//nfe:dest', ns)
            if dest is not None:
                nfe_data.destinatario_cnpj = self._get_text(dest, 'nfe:CNPJ', ns)
                nfe_data.destinatario_razao_social = self._get_text(dest, 'nfe:xNome', ns)

            # Produtos
            produtos_xml = root.findall('.//nfe:det', ns)
            for prod_xml in produtos_xml:
                produto = self._extract_product_from_xml(prod_xml, ns)
                if produto:
                    nfe_data.produtos.append(produto)

            return nfe_data

        except Exception as e:
            print(f"Error processing XML {file_path}: {e}")
            return None

    def process_pdf(self, file_path: str) -> Optional[NFeData]:
        """
        Processa PDF de DANFE (extração básica).
        """
        try:
            nfe_data = NFeData()

            with pdfplumber.open(file_path) as pdf:
                text = ""
                for page in pdf.pages:
                    text += page.extract_text() or ""

            # Extrair chave de acesso (44 dígitos)
            chave_match = re.search(r'\d{4}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4}', text)
            if chave_match:
                nfe_data.chave_acesso = chave_match.group().replace(' ', '')

            # Extrair número e série
            num_match = re.search(r'N[ºo°]\.?\s*(\d+)', text, re.IGNORECASE)
            if num_match:
                nfe_data.numero_nota = num_match.group(1)

            serie_match = re.search(r'S[ÉEe]RIE\s*[:\-]?\s*(\d+)', text, re.IGNORECASE)
            if serie_match:
                nfe_data.serie = serie_match.group(1)

            # Extração de produtos de PDF é mais complexa e menos confiável
            # Por simplicidade, retorna dados básicos
            # Em produção, seria melhor processar tabelas do PDF

            return nfe_data

        except Exception as e:
            print(f"Error processing PDF {file_path}: {e}")
            return None

    def _get_text(self, parent, xpath: str, namespaces: dict) -> Optional[str]:
        """Helper para extrair texto de elemento XML"""
        elem = parent.find(xpath, namespaces)
        if elem is not None and elem.text:
            return elem.text.strip()
        return None

    def _extract_product_from_xml(self, det_xml, namespaces: dict) -> Optional[dict]:
        """
        Extrai dados de produto do XML.
        """
        ns = namespaces
        prod = det_xml.find('nfe:prod', ns)

        if prod is None:
            return None

        produto = {
            "numero_item": det_xml.get('nItem'),
            "codigo": self._get_text(prod, 'nfe:cProd', ns),
            "descricao": self._get_text(prod, 'nfe:xProd', ns),
            "ncm": self._get_text(prod, 'nfe:NCM', ns),
            "cfop": self._get_text(prod, 'nfe:CFOP', ns),
            "unidade": self._get_text(prod, 'nfe:uCom', ns),
            "quantidade": self._get_decimal(prod, 'nfe:qCom', ns),
            "valor_unitario": self._get_decimal(prod, 'nfe:vUnCom', ns),
            "valor_total": self._get_decimal(prod, 'nfe:vProd', ns),
            "info_adicional": self._get_text(prod, 'nfe:infAdProd', ns) or "",
        }

        # Extrair garantias nutricionais da info adicional
        if produto["info_adicional"]:
            produto["nutrientes"] = self._extract_nutrients(produto["info_adicional"])
            produto["registro_mapa"] = self._extract_mapa_registration(produto["info_adicional"])
        else:
            produto["nutrientes"] = {}
            produto["registro_mapa"] = None

        return produto

    def _get_decimal(self, parent, xpath: str, namespaces: dict) -> Optional[Decimal]:
        """Helper para extrair valor decimal de elemento XML"""
        text = self._get_text(parent, xpath, namespaces)
        if text:
            try:
                # Substituir vírgula por ponto
                text = text.replace(',', '.')
                return Decimal(text)
            except:
                return None
        return None

    def _extract_nutrients(self, text: str) -> dict:
        """
        Extrai nutrientes do texto usando regex.
        """
        nutrients = {}
        text_upper = text.upper()

        for nutrient, patterns in self.NUTRIENT_PATTERNS.items():
            for pattern in patterns:
                match = re.search(pattern, text_upper)
                if match:
                    try:
                        value = match.group(1).replace(',', '.')
                        nutrients[nutrient] = Decimal(value)
                        break
                    except:
                        continue

        return nutrients

    def _extract_mapa_registration(self, text: str) -> Optional[str]:
        """
        Extrai registro MAPA do texto.
        Formato esperado: XX-12345-6.000001 ou variações
        """
        text_upper = text.upper()

        for pattern in self.MAPA_PATTERNS:
            match = re.search(pattern, text_upper)
            if match:
                # Normalizar formato (remover espaços extras)
                registro = match.group(1).strip()
                registro = re.sub(r'\s+', '-', registro)
                return registro

        return None
