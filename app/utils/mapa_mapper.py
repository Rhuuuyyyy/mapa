"""
MAPA Mapper - Business logic for mapping NF-e data to MAPA report format.

This module handles the transformation and aggregation of NF-e data into the
official MAPA (Ministério da Agricultura) quarterly report format for fertilizers.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional
from decimal import Decimal
from collections import defaultdict

from app.utils.nfe_processor import NFeData, NFeProduct


@dataclass
class MAPARow:
    """
    Single row in MAPA quarterly report.

    Represents one material/product entry with all 46 columns defined
    in the official MAPA format for fertilizer raw materials.
    """
    # Column 1-5: Product identification
    material_produto: str = ""
    registro_produto: str = ""

    # Columns 8-24: Guarantees (Nutrients) - em %
    n_total: str = ""
    p2o5_total: str = ""
    p2o5_soluvel: str = ""
    k2o: str = ""
    ca: str = ""
    mg: str = ""
    s: str = ""
    b: str = ""
    cl: str = ""
    co: str = ""
    cu: str = ""
    fe: str = ""
    mn: str = ""
    mo: str = ""
    ni: str = ""
    si: str = ""
    zn: str = ""

    # Column 25-26: Unit and initial stock
    unidade: str = "Tonelada"
    estoque_inicial: str = ""

    # Columns 30-37: Purchases/Entries
    compras_nacional: Decimal = Decimal("0")
    compras_empresa_nome: str = ""
    compras_importado: Decimal = Decimal("0")
    compras_pais_origem: str = ""

    # Columns 38-41: Destination (Use in Production / Sale as Product)
    uso_na_producao: Decimal = Decimal("0")
    venda_como_produto: Decimal = Decimal("0")

    # Columns 42-43: Other entries
    outras_entradas_quantidade: Decimal = Decimal("0")
    outras_entradas_discriminacao: str = ""

    # Columns 44-45: Other exits
    outras_saidas_quantidade: Decimal = Decimal("0")
    outras_saidas_discriminacao: str = ""

    # Column 46: Final stock
    estoque_final: str = ""

    # Metadata (not in final report, for internal use)
    cfop_codes: List[str] = field(default_factory=list)
    fonte_nfes: List[str] = field(default_factory=list)  # List of NF-e numbers


class MAPAMapper:
    """
    Maps NF-e data to MAPA quarterly report structure.

    This class implements the business logic for:
    - Classifying transactions by CFOP code (purchase, import, export, etc.)
    - Aggregating quantities by product and MAPA registration
    - Determining whether material is for production or direct sale
    - Organizing data into the 46-column MAPA format

    Usage:
        mapper = MAPAMapper()
        for nfe_data in nfe_list:
            mapper.add_nfe(nfe_data)
        rows = mapper.get_mapa_rows()
    """

    # CFOP code classification
    CFOP_COMPRA_NACIONAL = ['1', '2']  # First digit 1 or 2 = national purchase
    CFOP_IMPORTACAO = ['3']             # First digit 3 = import
    CFOP_VENDA_INTERNA = ['5']         # First digit 5 = sale within state
    CFOP_VENDA_EXTERNA = ['6']         # First digit 6 = sale to other states
    CFOP_EXPORTACAO = ['7']            # First digit 7 = export

    def __init__(self):
        """Initialize mapper with empty data structures"""
        self.nfe_list: List[NFeData] = []
        self.aggregated_data: Dict[str, MAPARow] = {}

    def add_nfe(self, nfe_data: NFeData) -> None:
        """
        Add NF-e data for processing.

        Args:
            nfe_data: Structured NF-e data from NFeProcessor
        """
        self.nfe_list.append(nfe_data)

    def get_mapa_rows(self) -> List[MAPARow]:
        """
        Process all NF-es and return aggregated MAPA rows.

        Returns:
            List of MAPARow objects, one per unique product/registration
        """
        self._aggregate_by_product()
        return list(self.aggregated_data.values())

    def _generate_product_key(self, produto: NFeProduct) -> str:
        """
        Generate unique key for product aggregation.

        Uses MAPA registration if available, otherwise NCM + description.

        Args:
            produto: Product from NF-e

        Returns:
            Unique key for aggregation
        """
        if produto.registro_mapa:
            return f"REG_{produto.registro_mapa}"
        else:
            # Fallback: use NCM + normalized description
            desc_normalized = produto.descricao.upper().strip()[:50]
            return f"NCM_{produto.ncm}_{desc_normalized}"

    def _aggregate_by_product(self) -> None:
        """
        Aggregate all NF-e products by material/registration.

        Groups products with same MAPA registration or NCM+description,
        summing quantities according to transaction type (CFOP).
        """
        self.aggregated_data.clear()

        for nfe_data in self.nfe_list:
            for produto in nfe_data.produtos:
                key = self._generate_product_key(produto)

                # Create row if doesn't exist
                if key not in self.aggregated_data:
                    self.aggregated_data[key] = self._create_mapa_row(produto)

                row = self.aggregated_data[key]

                # Add NF-e to metadata
                if nfe_data.numero_nota:
                    row.fonte_nfes.append(nfe_data.numero_nota)
                if produto.cfop:
                    row.cfop_codes.append(produto.cfop)

                # Classify and accumulate quantity by CFOP
                self._classify_and_accumulate(
                    row=row,
                    produto=produto,
                    emitente=nfe_data.emitente,
                    destinatario=nfe_data.destinatario
                )

    def _create_mapa_row(self, produto: NFeProduct) -> MAPARow:
        """
        Create initial MAPA row from product data.

        Args:
            produto: Product from NF-e

        Returns:
            MAPARow with product identification and guarantees filled
        """
        row = MAPARow()

        # Product identification
        row.material_produto = self._normalize_product_name(produto.descricao)
        row.registro_produto = produto.registro_mapa

        # Guarantees (nutrients)
        garantias = produto.garantias
        row.n_total = garantias.get('N', '')
        row.p2o5_total = garantias.get('P2O5_TOTAL', '')
        row.p2o5_soluvel = garantias.get('P2O5_SOLUVEL', '')
        row.k2o = garantias.get('K2O', '')
        row.ca = garantias.get('Ca', '')
        row.mg = garantias.get('Mg', '')
        row.s = garantias.get('S', '')
        row.b = garantias.get('B', '')
        row.cl = garantias.get('Cl', '')
        row.co = garantias.get('Co', '')
        row.cu = garantias.get('Cu', '')
        row.fe = garantias.get('Fe', '')
        row.mn = garantias.get('Mn', '')
        row.mo = garantias.get('Mo', '')
        row.ni = garantias.get('Ni', '')
        row.si = garantias.get('Si', '')
        row.zn = garantias.get('Zn', '')

        # Unit - convert to Tonelada if in TON
        if produto.unidade and produto.unidade.upper() in ['TON', 'TONELADA', 'T']:
            row.unidade = "Tonelada"

        return row

    def _normalize_product_name(self, descricao: str) -> str:
        """
        Normalize product name for MAPA report.

        Args:
            descricao: Raw product description

        Returns:
            Normalized product name (uppercase, clean)
        """
        if not descricao:
            return ""

        # Convert to uppercase
        name = descricao.upper().strip()

        # Common normalizations for fertilizers
        replacements = {
            'UREIA GRANULADA GRANEL': 'UREIA - MINERAL SIMPLES',
            'UREIA GRANULADA': 'UREIA - MINERAL SIMPLES',
            'UREIA GRANEL': 'UREIA - MINERAL SIMPLES',
            'UREIA': 'UREIA - MINERAL SIMPLES',
        }

        for old, new in replacements.items():
            if old in name:
                return new

        return name

    def _classify_and_accumulate(
        self,
        row: MAPARow,
        produto: NFeProduct,
        emitente,
        destinatario
    ) -> None:
        """
        Classify transaction by CFOP and accumulate quantity.

        Args:
            row: MAPA row to update
            produto: Product from NF-e
            emitente: Invoice emitter
            destinatario: Invoice recipient
        """
        cfop = produto.cfop
        quantidade = produto.quantidade

        if not cfop:
            return

        # Determine transaction type from CFOP first digit
        cfop_first = cfop[0] if cfop else ''

        # National purchase (CFOP 1xxx, 2xxx)
        if cfop_first in self.CFOP_COMPRA_NACIONAL:
            row.compras_nacional += quantidade
            if emitente.razao_social and not row.compras_empresa_nome:
                row.compras_empresa_nome = emitente.razao_social[:50]

        # Import (CFOP 3xxx)
        elif cfop_first in self.CFOP_IMPORTACAO:
            row.compras_importado += quantidade
            # Country of origin could be extracted from additional info
            if not row.compras_pais_origem:
                row.compras_pais_origem = "A definir"

        # Sale within state (CFOP 5xxx) - sold as finished product
        elif cfop_first in self.CFOP_VENDA_INTERNA:
            row.venda_como_produto += quantidade

        # Sale to other states (CFOP 6xxx) - sold as finished product
        elif cfop_first in self.CFOP_VENDA_EXTERNA:
            row.venda_como_produto += quantidade

        # Export (CFOP 7xxx)
        elif cfop_first in self.CFOP_EXPORTACAO:
            row.venda_como_produto += quantidade

        # Unknown CFOP - add to other entries
        else:
            row.outras_entradas_quantidade += quantidade
            if not row.outras_entradas_discriminacao:
                row.outras_entradas_discriminacao = f"CFOP {cfop}"

    def get_summary_statistics(self) -> Dict[str, int]:
        """
        Get summary statistics of processed data.

        Returns:
            Dictionary with counts: total_nfes, total_products, total_rows
        """
        total_products = sum(len(nfe.produtos) for nfe in self.nfe_list)

        return {
            'total_nfes': len(self.nfe_list),
            'total_products': total_products,
            'total_rows': len(self.aggregated_data),
        }

    def validate_data(self) -> List[str]:
        """
        Validate processed data and return warnings.

        Returns:
            List of warning messages (empty if all valid)
        """
        warnings = []

        for key, row in self.aggregated_data.items():
            # Check for missing registration
            if not row.registro_produto:
                warnings.append(
                    f"Produto '{row.material_produto}' sem registro MAPA"
                )

            # Check for missing guarantees (at least one nutrient expected)
            if not any([row.n_total, row.p2o5_total, row.k2o]):
                warnings.append(
                    f"Produto '{row.material_produto}' sem garantias (N, P2O5, K2O)"
                )

            # Check for zero quantities
            total_qty = (
                row.compras_nacional +
                row.compras_importado +
                row.uso_na_producao +
                row.venda_como_produto
            )
            if total_qty == 0:
                warnings.append(
                    f"Produto '{row.material_produto}' com quantidade zero"
                )

        return warnings
