import pdfplumber
import PyPDF2
import re
from typing import Dict, Any, List, Optional
import os


class NFePDFProcessor:
    """
    Processador de PDF de NF-e (DANFE) para extração de dados.
    Utiliza OCR e extração de texto para capturar informações.
    """
    
    def __init__(self, pdf_file_path: str):
        self.pdf_file_path = pdf_file_path
        self.text_content = ""
        self._load_pdf()
    
    def _load_pdf(self):
        """Carrega e extrai texto do PDF"""
        if not os.path.exists(self.pdf_file_path):
            raise FileNotFoundError(f"PDF file not found: {self.pdf_file_path}")
        
        try:
            with pdfplumber.open(self.pdf_file_path) as pdf:
                text_parts = []
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        text_parts.append(text)
                self.text_content = "\n".join(text_parts)
        except Exception as e:
            raise ValueError(f"Error reading PDF: {str(e)}")
    
    def _extract_pattern(self, pattern: str, text: str = None, group: int = 1) -> str:
        """Extrai texto usando regex"""
        if text is None:
            text = self.text_content
        
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            return match.group(group).strip()
        return ""
    
    def _extract_multiline(self, start_pattern: str, end_pattern: str = None, max_lines: int = 5) -> str:
        """Extrai texto entre dois padrões"""
        lines = self.text_content.split('\n')
        capturing = False
        captured = []
        
        for line in lines:
            if re.search(start_pattern, line, re.IGNORECASE):
                capturing = True
                continue
            
            if capturing:
                if end_pattern and re.search(end_pattern, line, re.IGNORECASE):
                    break
                captured.append(line.strip())
                if len(captured) >= max_lines:
                    break
        
        return ' '.join(captured).strip()
    
    def extract_chave_acesso(self) -> str:
        """Extrai a chave de acesso (44 dígitos)"""
        # Padrão para chave de acesso: 44 dígitos consecutivos
        pattern = r'(\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4})'
        chave = self._extract_pattern(pattern)
        # Remove espaços
        chave = re.sub(r'\s+', '', chave)
        return chave if len(chave) == 44 else ""
    
    def extract_numero_nota(self) -> str:
        """Extrai o número da nota fiscal"""
        patterns = [
            r'N[º°]?\s*(\d+)',
            r'NÚMERO\s*(\d+)',
            r'NF-e\s*N[ºo°]?\s*(\d+)',
        ]
        
        for pattern in patterns:
            numero = self._extract_pattern(pattern)
            if numero:
                return numero
        return ""
    
    def extract_serie(self) -> str:
        """Extrai a série da nota fiscal"""
        patterns = [
            r'SÉRIE\s*(\d+)',
            r'S[ÉE]RIE\s*(\d+)',
        ]
        
        for pattern in patterns:
            serie = self._extract_pattern(pattern)
            if serie:
                return serie
        return ""
    
    def extract_data_emissao(self) -> str:
        """Extrai a data de emissão"""
        patterns = [
            r'EMISS[ÃA]O\s*[:\-]?\s*(\d{2}/\d{2}/\d{4})',
            r'DATA\s*EMISS[ÃA]O\s*[:\-]?\s*(\d{2}/\d{2}/\d{4})',
        ]
        
        for pattern in patterns:
            data = self._extract_pattern(pattern)
            if data:
                return data
        return ""
    
    def extract_cnpj(self, label: str = "CNPJ") -> str:
        """Extrai CNPJ"""
        pattern = rf'{label}\s*[:\-]?\s*(\d{{2}}\.?\d{{3}}\.?\d{{3}}/?\d{{4}}\-?\d{{2}})'
        cnpj = self._extract_pattern(pattern)
        return re.sub(r'[^\d]', '', cnpj)  # Remove formatação
    
    def extract_emitente(self) -> Dict[str, Any]:
        """Extrai dados do emitente"""
        # Geralmente o emitente vem logo no início do DANFE
        emitente_section = self.text_content[:1000]  # Primeiros 1000 caracteres
        
        return {
            'cnpj': self.extract_cnpj("CNPJ"),
            'razao_social': self._extract_multiline("RAZ[ÃA]O SOCIAL", "NOME FANTASIA", 1),
            'nome_fantasia': self._extract_multiline("NOME FANTASIA", "ENDERE[ÇC]O", 1),
            'endereco': self._extract_multiline("ENDERE[ÇC]O", "BAIRRO", 1),
            'municipio': self._extract_pattern(r'MUNIC[ÍI]PIO\s*[:\-]?\s*([A-Z\s]+)'),
            'uf': self._extract_pattern(r'UF\s*[:\-]?\s*([A-Z]{2})'),
            'telefone': self._extract_pattern(r'FONE\s*[:\-]?\s*([\d\-\(\)\s]+)'),
            'ie': self._extract_pattern(r'INSCRI[ÇC][ÃA]O ESTADUAL\s*[:\-]?\s*(\d+)'),
        }
    
    def extract_destinatario(self) -> Dict[str, Any]:
        """Extrai dados do destinatário"""
        # Procura pela seção do destinatário
        dest_start = re.search(r'DESTINAT[ÁA]RIO', self.text_content, re.IGNORECASE)
        if not dest_start:
            return {}
        
        dest_section = self.text_content[dest_start.start():dest_start.start() + 1000]
        
        return {
            'cnpj_cpf': self._extract_pattern(r'CNPJ/CPF\s*[:\-]?\s*([\d\.\-/]+)', dest_section),
            'razao_social': self._extract_multiline("NOME/RAZ[ÃA]O SOCIAL", "ENDERE[ÇC]O", 1),
            'endereco': self._extract_multiline("ENDERE[ÇC]O.*DESTINAT", "BAIRRO", 2),
            'municipio': self._extract_pattern(r'MUNIC[ÍI]PIO\s*[:\-]?\s*([A-Z\s]+)', dest_section),
            'uf': self._extract_pattern(r'UF\s*[:\-]?\s*([A-Z]{2})', dest_section),
        }
    
    def extract_produtos(self) -> List[Dict[str, Any]]:
        """
        Extrai produtos do PDF.
        NOTA: Extração de produtos de PDF é complexa e pode não ser 100% precisa.
        """
        produtos = []
        
        # Procura pela seção de produtos
        prod_start = re.search(r'DADOS DOS PRODUTOS|PRODUTOS|DESCRI[ÇC][ÃA]O', self.text_content, re.IGNORECASE)
        if not prod_start:
            return produtos
        
        # Extrai linhas de produtos (isso varia muito por layout)
        # Esta é uma implementação básica que precisa ser ajustada conforme o layout específico
        prod_section = self.text_content[prod_start.start():]
        lines = prod_section.split('\n')[:50]  # Primeiras 50 linhas após "PRODUTOS"
        
        for line in lines:
            # Tenta identificar linhas que parecem ser produtos
            # Geralmente têm código, descrição, quantidade, valor
            if re.search(r'\d+\s+[A-Z].+\d+[,\.]\d{2}', line):
                # Parse básico - ajuste conforme necessário
                produtos.append({
                    'descricao': line.strip(),
                    'observacao': 'Extraído de PDF - verificar manualmente'
                })
        
        return produtos
    
    def extract_totais(self) -> Dict[str, Any]:
        """Extrai valores totais"""
        totais = {}
        
        # Padrões comuns para valores monetários
        valor_pattern = r'([\d\.]+,\d{2})'
        
        # Valor total da nota
        total_nota = self._extract_pattern(r'VALOR TOTAL DA NOTA\s*[:\-]?\s*' + valor_pattern)
        if total_nota:
            totais['valor_total_nota'] = total_nota
        
        # Valor dos produtos
        valor_produtos = self._extract_pattern(r'VALOR TOTAL DOS PRODUTOS\s*[:\-]?\s*' + valor_pattern)
        if valor_produtos:
            totais['valor_produtos'] = valor_produtos
        
        # Valor do frete
        valor_frete = self._extract_pattern(r'VALOR DO FRETE\s*[:\-]?\s*' + valor_pattern)
        if valor_frete:
            totais['valor_frete'] = valor_frete
        
        # Base de cálculo ICMS
        bc_icms = self._extract_pattern(r'BASE DE C[ÁA]LCULO.*ICMS\s*[:\-]?\s*' + valor_pattern)
        if bc_icms:
            totais['base_calculo_icms'] = bc_icms
        
        # Valor ICMS
        valor_icms = self._extract_pattern(r'VALOR.*ICMS\s*[:\-]?\s*' + valor_pattern)
        if valor_icms:
            totais['valor_icms'] = valor_icms
        
        return totais
    
    def validate_nfe(self) -> bool:
        """Valida se o PDF é uma DANFE válida"""
        # Verifica se contém palavras-chave de DANFE
        keywords = ['DANFE', 'DOCUMENTO AUXILIAR', 'NF-E', 'NOTA FISCAL ELETR']
        
        for keyword in keywords:
            if keyword in self.text_content.upper():
                # Verifica se tem chave de acesso
                chave = self.extract_chave_acesso()
                if chave and len(chave) == 44:
                    return True
        
        return False
    
    def process_for_mapa_report(self) -> Dict[str, Any]:
        """
        Processa o PDF e retorna os dados formatados para o relatório MAPA.
        """
        if not self.validate_nfe():
            raise ValueError("PDF não é uma DANFE válida ou não pode ser processado")
        
        return {
            'chave_acesso': self.extract_chave_acesso(),
            'numero_nota': self.extract_numero_nota(),
            'serie': self.extract_serie(),
            'data_emissao': self.extract_data_emissao(),
            'emitente': self.extract_emitente(),
            'destinatario': self.extract_destinatario(),
            'produtos': self.extract_produtos(),
            'totais': self.extract_totais(),
            'observacao': 'Dados extraídos de PDF - recomenda-se verificação manual'
        }