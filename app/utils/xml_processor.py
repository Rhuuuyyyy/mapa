from lxml import etree
from typing import Dict, Any, List, Optional
import os
import re


class NFeXMLProcessor:
    """
    Processador de XML de NF-e para extração de dados relevantes.
    Suporta o formato padrão XML de NF-e da Receita Federal.
    """
    
    # Namespaces comuns em XML de NF-e
    NAMESPACES = {
        'nfe': 'http://www.portalfiscal.inf.br/nfe',
        'ds': 'http://www.w3.org/2000/09/xmldsig#'
    }
    
    def __init__(self, xml_file_path: str):
        self.xml_file_path = xml_file_path
        self.tree = None
        self.root = None
        self._load_xml()
    
    def _load_xml(self):
        """Carrega e faz o parse do arquivo XML"""
        if not os.path.exists(self.xml_file_path):
            raise FileNotFoundError(f"XML file not found: {self.xml_file_path}")
        
        try:
            self.tree = etree.parse(self.xml_file_path)
            self.root = self.tree.getroot()
        except etree.XMLSyntaxError as e:
            raise ValueError(f"Invalid XML file: {str(e)}")
    
    def _get_text(self, element, xpath: str, default: str = "") -> str:
        """Extrai texto de um elemento usando XPath"""
        try:
            result = element.xpath(xpath, namespaces=self.NAMESPACES)
            return result[0].text if result and result[0].text else default
        except:
            return default
    
    def _get_element(self, element, xpath: str):
        """Retorna um elemento usando XPath"""
        try:
            result = element.xpath(xpath, namespaces=self.NAMESPACES)
            return result[0] if result else None
        except:
            return None
    
    def extract_chave_acesso(self) -> str:
        """Extrai a chave de acesso da NF-e"""
        # Tenta encontrar no infNFe
        chave = self._get_text(self.root, './/nfe:infNFe/@Id')
        if chave:
            # Remove o prefixo "NFe" se existir
            chave = chave.replace('NFe', '')
        return chave
    
    def extract_numero_nota(self) -> str:
        """Extrai o número da nota fiscal"""
        return self._get_text(self.root, './/nfe:ide/nfe:nNF')
    
    def extract_serie(self) -> str:
        """Extrai a série da nota fiscal"""
        return self._get_text(self.root, './/nfe:ide/nfe:serie')
    
    def extract_data_emissao(self) -> str:
        """Extrai a data de emissão"""
        return self._get_text(self.root, './/nfe:ide/nfe:dhEmi')
    
    def extract_emitente(self) -> Dict[str, Any]:
        """Extrai dados do emitente"""
        emit = self._get_element(self.root, './/nfe:emit')
        if not emit:
            return {}
        
        return {
            'cnpj': self._get_text(emit, './/nfe:CNPJ'),
            'razao_social': self._get_text(emit, './/nfe:xNome'),
            'nome_fantasia': self._get_text(emit, './/nfe:xFant'),
            'endereco': {
                'logradouro': self._get_text(emit, './/nfe:enderEmit/nfe:xLgr'),
                'numero': self._get_text(emit, './/nfe:enderEmit/nfe:nro'),
                'complemento': self._get_text(emit, './/nfe:enderEmit/nfe:xCpl'),
                'bairro': self._get_text(emit, './/nfe:enderEmit/nfe:xBairro'),
                'municipio': self._get_text(emit, './/nfe:enderEmit/nfe:xMun'),
                'uf': self._get_text(emit, './/nfe:enderEmit/nfe:UF'),
                'cep': self._get_text(emit, './/nfe:enderEmit/nfe:CEP'),
            },
            'ie': self._get_text(emit, './/nfe:IE'),
            'telefone': self._get_text(emit, './/nfe:enderEmit/nfe:fone'),
        }
    
    def extract_destinatario(self) -> Dict[str, Any]:
        """Extrai dados do destinatário"""
        dest = self._get_element(self.root, './/nfe:dest')
        if not dest:
            return {}
        
        # Pode ser CNPJ ou CPF
        cnpj_cpf = self._get_text(dest, './/nfe:CNPJ') or self._get_text(dest, './/nfe:CPF')
        
        return {
            'cnpj_cpf': cnpj_cpf,
            'razao_social': self._get_text(dest, './/nfe:xNome'),
            'endereco': {
                'logradouro': self._get_text(dest, './/nfe:enderDest/nfe:xLgr'),
                'numero': self._get_text(dest, './/nfe:enderDest/nfe:nro'),
                'complemento': self._get_text(dest, './/nfe:enderDest/nfe:xCpl'),
                'bairro': self._get_text(dest, './/nfe:enderDest/nfe:xBairro'),
                'municipio': self._get_text(dest, './/nfe:enderDest/nfe:xMun'),
                'uf': self._get_text(dest, './/nfe:enderDest/nfe:UF'),
                'cep': self._get_text(dest, './/nfe:enderDest/nfe:CEP'),
            },
            'ie': self._get_text(dest, './/nfe:indIEDest'),
            'telefone': self._get_text(dest, './/nfe:enderDest/nfe:fone'),
        }
    
    def extract_produtos(self) -> List[Dict[str, Any]]:
        """Extrai dados dos produtos/itens da nota"""
        produtos = []
        items = self.root.xpath('.//nfe:det', namespaces=self.NAMESPACES)
        
        for item in items:
            produto = {
                'numero_item': self._get_text(item, './@nItem'),
                'codigo': self._get_text(item, './/nfe:prod/nfe:cProd'),
                'ean': self._get_text(item, './/nfe:prod/nfe:cEAN'),
                'descricao': self._get_text(item, './/nfe:prod/nfe:xProd'),
                'ncm': self._get_text(item, './/nfe:prod/nfe:NCM'),
                'cfop': self._get_text(item, './/nfe:prod/nfe:CFOP'),
                'unidade': self._get_text(item, './/nfe:prod/nfe:uCom'),
                'quantidade': self._get_text(item, './/nfe:prod/nfe:qCom'),
                'valor_unitario': self._get_text(item, './/nfe:prod/nfe:vUnCom'),
                'valor_total': self._get_text(item, './/nfe:prod/nfe:vProd'),
                'ean_tributavel': self._get_text(item, './/nfe:prod/nfe:cEANTrib'),
                'unidade_tributavel': self._get_text(item, './/nfe:prod/nfe:uTrib'),
                'quantidade_tributavel': self._get_text(item, './/nfe:prod/nfe:qTrib'),
                'valor_unitario_tributavel': self._get_text(item, './/nfe:prod/nfe:vUnTrib'),
            }
            produtos.append(produto)
        
        return produtos
    
    def extract_totais(self) -> Dict[str, Any]:
        """Extrai totais da nota fiscal"""
        total = self._get_element(self.root, './/nfe:total/nfe:ICMSTot')
        if not total:
            return {}
        
        return {
            'base_calculo_icms': self._get_text(total, './/nfe:vBC'),
            'valor_icms': self._get_text(total, './/nfe:vICMS'),
            'valor_icms_desonerado': self._get_text(total, './/nfe:vICMSDeson'),
            'base_calculo_icms_st': self._get_text(total, './/nfe:vBCST'),
            'valor_icms_st': self._get_text(total, './/nfe:vST'),
            'valor_produtos': self._get_text(total, './/nfe:vProd'),
            'valor_frete': self._get_text(total, './/nfe:vFrete'),
            'valor_seguro': self._get_text(total, './/nfe:vSeg'),
            'valor_desconto': self._get_text(total, './/nfe:vDesc'),
            'valor_ii': self._get_text(total, './/nfe:vII'),
            'valor_ipi': self._get_text(total, './/nfe:vIPI'),
            'valor_pis': self._get_text(total, './/nfe:vPIS'),
            'valor_cofins': self._get_text(total, './/nfe:vCOFINS'),
            'outras_despesas': self._get_text(total, './/nfe:vOutro'),
            'valor_total_nota': self._get_text(total, './/nfe:vNF'),
        }
    
    def extract_transporte(self) -> Dict[str, Any]:
        """Extrai dados de transporte"""
        transp = self._get_element(self.root, './/nfe:transp')
        if not transp:
            return {}
        
        transportadora = self._get_element(transp, './/nfe:transporta')
        
        return {
            'modalidade_frete': self._get_text(transp, './/nfe:modFrete'),
            'transportadora': {
                'cnpj_cpf': self._get_text(transportadora, './/nfe:CNPJ') or self._get_text(transportadora, './/nfe:CPF') if transportadora else '',
                'razao_social': self._get_text(transportadora, './/nfe:xNome') if transportadora else '',
                'ie': self._get_text(transportadora, './/nfe:IE') if transportadora else '',
                'endereco': self._get_text(transportadora, './/nfe:xEnder') if transportadora else '',
                'municipio': self._get_text(transportadora, './/nfe:xMun') if transportadora else '',
                'uf': self._get_text(transportadora, './/nfe:UF') if transportadora else '',
            }
        }
    
    def validate_nfe(self) -> bool:
        """Valida se o XML é uma NF-e válida"""
        try:
            # Verifica se tem a estrutura básica de NF-e
            if self.root.tag.endswith('nfeProc') or self.root.tag.endswith('NFe'):
                # Verifica se tem número de nota
                numero = self.extract_numero_nota()
                if numero:
                    return True
            return False
        except:
            return False
    
    def process_for_mapa_report(self) -> Dict[str, Any]:
        """
        Processa o XML e retorna os dados formatados para o relatório MAPA.
        Extrai todos os dados relevantes da NF-e.
        """
        if not self.validate_nfe():
            raise ValueError("XML não é uma NF-e válida")
        
        return {
            'chave_acesso': self.extract_chave_acesso(),
            'numero_nota': self.extract_numero_nota(),
            'serie': self.extract_serie(),
            'data_emissao': self.extract_data_emissao(),
            'emitente': self.extract_emitente(),
            'destinatario': self.extract_destinatario(),
            'produtos': self.extract_produtos(),
            'totais': self.extract_totais(),
            'transporte': self.extract_transporte()
        }