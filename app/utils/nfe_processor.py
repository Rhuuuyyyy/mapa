"""
NF-e XML Processor - High-performance extraction of electronic invoice data.

This module provides a clean, efficient processor for Brazilian NF-e (Nota Fiscal Eletrônica)
XML files using lxml for parsing and dataclasses for structured data representation.
"""

from lxml import etree
from dataclasses import dataclass, field
from typing import Dict, List, Optional
from decimal import Decimal, InvalidOperation
from datetime import datetime
import re
import os


@dataclass
class NFeAddress:
    """Address information from NF-e"""
    logradouro: str = ""
    numero: str = ""
    complemento: str = ""
    bairro: str = ""
    municipio: str = ""
    uf: str = ""
    cep: str = ""
    pais: str = "Brasil"


@dataclass
class NFeParty:
    """Entity information (emitter or recipient)"""
    cnpj_cpf: str = ""
    razao_social: str = ""
    nome_fantasia: str = ""
    inscricao_estadual: str = ""
    endereco: NFeAddress = field(default_factory=NFeAddress)
    telefone: str = ""
    email: str = ""


@dataclass
class NFeProduct:
    """Product/item from NF-e"""
    numero_item: str = ""
    codigo: str = ""
    descricao: str = ""
    ncm: str = ""
    cfop: str = ""
    unidade: str = ""
    quantidade: Decimal = Decimal("0")
    valor_unitario: Decimal = Decimal("0")
    valor_total: Decimal = Decimal("0")
    info_adicional: str = ""
    garantias: Dict[str, str] = field(default_factory=dict)
    registro_mapa: str = ""


@dataclass
class NFeTotals:
    """Financial totals from NF-e"""
    valor_produtos: Decimal = Decimal("0")
    valor_frete: Decimal = Decimal("0")
    valor_seguro: Decimal = Decimal("0")
    valor_desconto: Decimal = Decimal("0")
    valor_total_nota: Decimal = Decimal("0")


@dataclass
class NFeTransport:
    """Transport information"""
    modalidade_frete: str = ""
    transportadora_cnpj: str = ""
    transportadora_nome: str = ""
    transportadora_uf: str = ""


@dataclass
class NFeData:
    """Complete structured NF-e data"""
    chave_acesso: str = ""
    numero_nota: str = ""
    serie: str = ""
    data_emissao: Optional[datetime] = None
    emitente: NFeParty = field(default_factory=NFeParty)
    destinatario: NFeParty = field(default_factory=NFeParty)
    produtos: List[NFeProduct] = field(default_factory=list)
    totais: NFeTotals = field(default_factory=NFeTotals)
    transporte: NFeTransport = field(default_factory=NFeTransport)
    info_complementar: str = ""
    info_fisco: str = ""


class NFeProcessor:
    """
    High-performance NF-e XML processor using lxml.

    Extracts all relevant data from Brazilian electronic invoices including:
    - Basic invoice information (number, date, access key)
    - Emitter and recipient details
    - Product information with nutrient guarantees extraction
    - MAPA registration numbers
    - Financial totals
    - Transport information

    Usage:
        processor = NFeProcessor('path/to/nfe.xml')
        nfe_data = processor.extract_all_data()
    """

    # XML namespaces for NF-e
    NAMESPACES = {
        'nfe': 'http://www.portalfiscal.inf.br/nfe',
        'ds': 'http://www.w3.org/2000/09/xmldsig#'
    }

    # Nutrient regex patterns for guarantee extraction
    NUTRIENT_PATTERNS = {
        'N': [
            r'N\s*TOTAL\s*(\d+(?:[.,]\d+)?)\s*%',  # N TOTAL 46%
            r'N\s*(\d+(?:[.,]\d+)?)\s*%',           # N 46%
            r'(\d+(?:[.,]\d+)?)\s*-\s*\d+',         # 15-15-15 (first number)
        ],
        'P2O5_TOTAL': [
            r'P2?O5?\s*TOTAL\s*(\d+(?:[.,]\d+)?)\s*%',  # P2O5 TOTAL 18%
            r'P2?O5?\s*(\d+(?:[.,]\d+)?)\s*%',           # P2O5 18%
            r'\d+-(\d+(?:[.,]\d+)?)-',                   # 15-15-15 (second number)
        ],
        'P2O5_SOLUVEL': [
            r'P2?O5?\s*SOL[UÚ]VEL\s*(\d+(?:[.,]\d+)?)\s*%',  # P2O5 SOLÚVEL 16%
            r'P2?O5?\s*SOL\s*(\d+(?:[.,]\d+)?)\s*%',
        ],
        'K2O': [
            r'K2?O\s*(\d+(?:[.,]\d+)?)\s*%',  # K2O 20%
            r'\d+-\d+-(\d+(?:[.,]\d+)?)',     # 15-15-15 (third number)
        ],
        'Ca': [
            r'(\d+(?:[.,]\d+)?)\s*%?\s*Ca',   # 10 Ca or 10% Ca
            r'Ca\s*(\d+(?:[.,]\d+)?)\s*%',    # Ca 10%
        ],
        'Mg': [
            r'(\d+(?:[.,]\d+)?)\s*%?\s*Mg',   # 5 Mg or 5% Mg
            r'Mg\s*(\d+(?:[.,]\d+)?)\s*%',    # Mg 5%
        ],
        'S': [
            r'S\s*(\d+(?:[.,]\d+)?)\s*%',     # S 8%
            r'(\d+(?:[.,]\d+)?)\s*%?\s*S',
        ],
        'B': [
            r'B\s*(\d+(?:[.,]\d+)?)\s*%',
            r'(\d+(?:[.,]\d+)?)\s*%?\s*B',
        ],
        'Cl': [
            r'Cl\s*(\d+(?:[.,]\d+)?)\s*%',
        ],
        'Co': [
            r'Co\s*(\d+(?:[.,]\d+)?)\s*%',
        ],
        'Cu': [
            r'Cu\s*(\d+(?:[.,]\d+)?)\s*%',
        ],
        'Fe': [
            r'Fe\s*(\d+(?:[.,]\d+)?)\s*%',
        ],
        'Mn': [
            r'Mn\s*(\d+(?:[.,]\d+)?)\s*%',
        ],
        'Mo': [
            r'Mo\s*(\d+(?:[.,]\d+)?)\s*%',
        ],
        'Ni': [
            r'Ni\s*(\d+(?:[.,]\d+)?)\s*%',
        ],
        'Si': [
            r'Si\s*(\d+(?:[.,]\d+)?)\s*%',
        ],
        'Zn': [
            r'Zn\s*(\d+(?:[.,]\d+)?)\s*%',
        ],
    }

    # MAPA registration patterns
    REGISTRO_MAPA_PATTERNS = [
        r'REGISTRO\s+(?:DO\s+)?MAPA[:\s]+([A-Z]{2}\s*\d{5,6}-\d+(?:\.\d+)?)',  # REGISTRO MAPA: PR 00551-7
        r'REG[\.:]?\s*MAPA[:\s]+([A-Z]{2}\s*\d{5,6}-\d+(?:\.\d+)?)',           # REG. MAPA: PR00551-7
        r'(?:EI|EP|EC|MP)[:\s]+([A-Z]{2}\s*\d{5,6}-\d+(?:\.\d+)?)',           # EI: PR00551-7
        r'([A-Z]{2}\s*\d{5,6}-\d+\.\d+-\d+)',                                   # PR 000328-0.000023
    ]

    def __init__(self, xml_file_path: str):
        """
        Initialize processor with XML file path.

        Args:
            xml_file_path: Path to NF-e XML file

        Raises:
            FileNotFoundError: If XML file doesn't exist
            ValueError: If XML is malformed
        """
        self.xml_file_path = xml_file_path
        self.tree = None
        self.root = None
        self._load_xml()

    def _load_xml(self) -> None:
        """Load and parse XML file"""
        if not os.path.exists(self.xml_file_path):
            raise FileNotFoundError(f"XML file not found: {self.xml_file_path}")

        try:
            self.tree = etree.parse(self.xml_file_path)
            self.root = self.tree.getroot()
        except etree.XMLSyntaxError as e:
            raise ValueError(f"Invalid XML file: {str(e)}")

    def _get_text(self, element, xpath: str, default: str = "") -> str:
        """Extract text from element using XPath"""
        try:
            result = element.xpath(xpath, namespaces=self.NAMESPACES)
            return result[0].text.strip() if result and result[0].text else default
        except (IndexError, AttributeError):
            return default

    def _get_decimal(self, element, xpath: str, default: Decimal = Decimal("0")) -> Decimal:
        """Extract decimal value from element"""
        text = self._get_text(element, xpath)
        if not text:
            return default
        try:
            # Replace comma with dot for Brazilian format
            text = text.replace(',', '.')
            return Decimal(text)
        except InvalidOperation:
            return default

    def _get_element(self, element, xpath: str):
        """Get first element matching XPath"""
        try:
            result = element.xpath(xpath, namespaces=self.NAMESPACES)
            return result[0] if result else None
        except IndexError:
            return None

    def _parse_datetime(self, date_str: str) -> Optional[datetime]:
        """Parse NF-e datetime format"""
        if not date_str:
            return None
        try:
            # NF-e format: 2025-10-01T16:10:39-03:00
            # Remove timezone for simplicity
            date_str = date_str.split('-03:00')[0].split('+')[0]
            return datetime.fromisoformat(date_str)
        except (ValueError, AttributeError):
            return None

    def extract_garantias(self, text: str) -> Dict[str, str]:
        """
        Extract nutrient guarantees from product description or additional info.

        Args:
            text: Product description or infAdProd content

        Returns:
            Dictionary with nutrient codes as keys and percentages as values
            Example: {'N': '46', 'P2O5_TOTAL': '18', 'K2O': '20'}
        """
        garantias = {}

        if not text:
            return garantias

        # Normalize text for better pattern matching
        text_upper = text.upper()

        for nutrient, patterns in self.NUTRIENT_PATTERNS.items():
            for pattern in patterns:
                match = re.search(pattern, text_upper, re.IGNORECASE)
                if match:
                    value = match.group(1).replace(',', '.')
                    garantias[nutrient] = value
                    break  # Use first matching pattern

        return garantias

    def extract_registro_mapa(self, text: str) -> str:
        """
        Extract MAPA registration number from text.

        Args:
            text: Text containing MAPA registration (infAdProd or infCpl)

        Returns:
            MAPA registration number or empty string
            Example: "PR 00551-7" or "PR 000328-0.000023"
        """
        if not text:
            return ""

        for pattern in self.REGISTRO_MAPA_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                # Normalize spacing
                registro = match.group(1).strip()
                # Ensure space after UF
                registro = re.sub(r'([A-Z]{2})(\d)', r'\1 \2', registro)
                return registro

        return ""

    def extract_all_data(self) -> NFeData:
        """
        Extract all NF-e data into structured format.

        Returns:
            NFeData object with all extracted information

        Raises:
            ValueError: If XML is not a valid NF-e
        """
        if not self.validate_nfe():
            raise ValueError("XML is not a valid NF-e")

        nfe_data = NFeData()

        # Basic info
        nfe_data.chave_acesso = self._extract_chave_acesso()
        nfe_data.numero_nota = self._get_text(self.root, './/nfe:ide/nfe:nNF')
        nfe_data.serie = self._get_text(self.root, './/nfe:ide/nfe:serie')

        date_str = self._get_text(self.root, './/nfe:ide/nfe:dhEmi')
        nfe_data.data_emissao = self._parse_datetime(date_str)

        # Parties
        nfe_data.emitente = self._extract_emitente()
        nfe_data.destinatario = self._extract_destinatario()

        # Products
        nfe_data.produtos = self._extract_produtos()

        # Totals
        nfe_data.totais = self._extract_totais()

        # Transport
        nfe_data.transporte = self._extract_transporte()

        # Additional info
        nfe_data.info_complementar = self._get_text(self.root, './/nfe:infAdic/nfe:infCpl')
        nfe_data.info_fisco = self._get_text(self.root, './/nfe:infAdic/nfe:infAdFisco')

        return nfe_data

    def _extract_chave_acesso(self) -> str:
        """Extract NF-e access key"""
        chave = self._get_text(self.root, './/nfe:infNFe/@Id')
        # Remove 'NFe' prefix if present
        return chave.replace('NFe', '') if chave else ""

    def _extract_emitente(self) -> NFeParty:
        """Extract emitter information"""
        emit = self._get_element(self.root, './/nfe:emit')
        if not emit:
            return NFeParty()

        party = NFeParty()
        party.cnpj_cpf = self._get_text(emit, './/nfe:CNPJ')
        party.razao_social = self._get_text(emit, './/nfe:xNome')
        party.nome_fantasia = self._get_text(emit, './/nfe:xFant')
        party.inscricao_estadual = self._get_text(emit, './/nfe:IE')
        party.telefone = self._get_text(emit, './/nfe:enderEmit/nfe:fone')

        # Address
        party.endereco = NFeAddress(
            logradouro=self._get_text(emit, './/nfe:enderEmit/nfe:xLgr'),
            numero=self._get_text(emit, './/nfe:enderEmit/nfe:nro'),
            complemento=self._get_text(emit, './/nfe:enderEmit/nfe:xCpl'),
            bairro=self._get_text(emit, './/nfe:enderEmit/nfe:xBairro'),
            municipio=self._get_text(emit, './/nfe:enderEmit/nfe:xMun'),
            uf=self._get_text(emit, './/nfe:enderEmit/nfe:UF'),
            cep=self._get_text(emit, './/nfe:enderEmit/nfe:CEP'),
        )

        return party

    def _extract_destinatario(self) -> NFeParty:
        """Extract recipient information"""
        dest = self._get_element(self.root, './/nfe:dest')
        if not dest:
            return NFeParty()

        party = NFeParty()
        party.cnpj_cpf = self._get_text(dest, './/nfe:CNPJ') or self._get_text(dest, './/nfe:CPF')
        party.razao_social = self._get_text(dest, './/nfe:xNome')
        party.inscricao_estadual = self._get_text(dest, './/nfe:IE')
        party.telefone = self._get_text(dest, './/nfe:enderDest/nfe:fone')
        party.email = self._get_text(dest, './/nfe:email')

        # Address
        party.endereco = NFeAddress(
            logradouro=self._get_text(dest, './/nfe:enderDest/nfe:xLgr'),
            numero=self._get_text(dest, './/nfe:enderDest/nfe:nro'),
            complemento=self._get_text(dest, './/nfe:enderDest/nfe:xCpl'),
            bairro=self._get_text(dest, './/nfe:enderDest/nfe:xBairro'),
            municipio=self._get_text(dest, './/nfe:enderDest/nfe:xMun'),
            uf=self._get_text(dest, './/nfe:enderDest/nfe:UF'),
            cep=self._get_text(dest, './/nfe:enderDest/nfe:CEP'),
        )

        return party

    def _extract_produtos(self) -> List[NFeProduct]:
        """Extract all products from NF-e"""
        produtos = []
        items = self.root.xpath('.//nfe:det', namespaces=self.NAMESPACES)

        for item in items:
            produto = NFeProduct()
            produto.numero_item = self._get_text(item, './@nItem')
            produto.codigo = self._get_text(item, './/nfe:prod/nfe:cProd')
            produto.descricao = self._get_text(item, './/nfe:prod/nfe:xProd')
            produto.ncm = self._get_text(item, './/nfe:prod/nfe:NCM')
            produto.cfop = self._get_text(item, './/nfe:prod/nfe:CFOP')
            produto.unidade = self._get_text(item, './/nfe:prod/nfe:uCom')
            produto.quantidade = self._get_decimal(item, './/nfe:prod/nfe:qCom')
            produto.valor_unitario = self._get_decimal(item, './/nfe:prod/nfe:vUnCom')
            produto.valor_total = self._get_decimal(item, './/nfe:prod/nfe:vProd')

            # Additional product info (contains guarantees and MAPA registration)
            produto.info_adicional = self._get_text(item, './/nfe:infAdProd')

            # Extract guarantees from additional info
            produto.garantias = self.extract_garantias(produto.info_adicional)

            # Extract MAPA registration from additional info and complementary info
            info_completa = produto.info_adicional + " " + self._get_text(self.root, './/nfe:infAdic/nfe:infCpl')
            produto.registro_mapa = self.extract_registro_mapa(info_completa)

            produtos.append(produto)

        return produtos

    def _extract_totais(self) -> NFeTotals:
        """Extract financial totals"""
        total_elem = self._get_element(self.root, './/nfe:total/nfe:ICMSTot')
        if not total_elem:
            return NFeTotals()

        return NFeTotals(
            valor_produtos=self._get_decimal(total_elem, './/nfe:vProd'),
            valor_frete=self._get_decimal(total_elem, './/nfe:vFrete'),
            valor_seguro=self._get_decimal(total_elem, './/nfe:vSeg'),
            valor_desconto=self._get_decimal(total_elem, './/nfe:vDesc'),
            valor_total_nota=self._get_decimal(total_elem, './/nfe:vNF'),
        )

    def _extract_transporte(self) -> NFeTransport:
        """Extract transport information"""
        transp = self._get_element(self.root, './/nfe:transp')
        if not transp:
            return NFeTransport()

        transportadora = self._get_element(transp, './/nfe:transporta')

        transport = NFeTransport()
        transport.modalidade_frete = self._get_text(transp, './/nfe:modFrete')

        if transportadora:
            transport.transportadora_cnpj = (
                self._get_text(transportadora, './/nfe:CNPJ') or
                self._get_text(transportadora, './/nfe:CPF')
            )
            transport.transportadora_nome = self._get_text(transportadora, './/nfe:xNome')
            transport.transportadora_uf = self._get_text(transportadora, './/nfe:UF')

        return transport

    def validate_nfe(self) -> bool:
        """
        Validate if XML is a valid NF-e.

        Returns:
            True if valid NF-e, False otherwise
        """
        try:
            # Check for NF-e root structure
            if not (self.root.tag.endswith('nfeProc') or self.root.tag.endswith('NFe')):
                return False

            # Check for invoice number
            numero = self._get_text(self.root, './/nfe:ide/nfe:nNF')
            return bool(numero)
        except Exception:
            return False
