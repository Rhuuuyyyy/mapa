"""
Gerador de PDF para relatórios MAPA.
Cria relatórios formatados para envio ao MAPA.
"""

from decimal import Decimal
from datetime import datetime
from typing import List, Dict
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph,
    Spacer, PageBreak, Image
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


class MAPAReportPDFGenerator:
    """
    Gerador de PDF para relatórios trimestrais MAPA.
    """

    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()

    def _create_custom_styles(self):
        """Cria estilos customizados para o PDF"""
        # Título principal
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#047857'),  # Emerald 700
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))

        # Subtítulo
        self.styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#059669'),  # Emerald 600
            spaceAfter=12,
            fontName='Helvetica-Bold'
        ))

        # Informações gerais
        self.styles.add(ParagraphStyle(
            name='InfoText',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.black,
            spaceAfter=6
        ))

    def generate_report(
        self,
        period: str,
        rows: List[Dict],
        user_info: Dict = None,
        total_nfes: int = 0
    ) -> BytesIO:
        """
        Gera PDF do relatório MAPA.

        Args:
            period: Período do relatório (ex: "Q1-2025")
            rows: Lista de rows do relatório
            user_info: Informações do usuário (opcional)
            total_nfes: Total de NF-es processadas

        Returns:
            BytesIO contendo o PDF gerado
        """
        buffer = BytesIO()

        # Usar landscape para caber mais colunas
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(A4),
            rightMargin=1.5*cm,
            leftMargin=1.5*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )

        # Container para elementos do PDF
        elements = []

        # Header
        elements.extend(self._create_header(period, user_info, total_nfes))

        # Tabela de dados
        elements.append(self._create_data_table(rows))

        # Footer
        elements.extend(self._create_footer())

        # Construir PDF
        doc.build(elements)
        buffer.seek(0)

        return buffer

    def _create_header(self, period: str, user_info: Dict, total_nfes: int) -> List:
        """Cria o cabeçalho do relatório"""
        elements = []

        # Título
        title = Paragraph(
            "RELATÓRIO TRIMESTRAL - MAPA",
            self.styles['CustomTitle']
        )
        elements.append(title)

        # Período
        period_text = self._format_period(period)
        period_para = Paragraph(
            f"<b>Período:</b> {period_text}",
            self.styles['CustomSubtitle']
        )
        elements.append(period_para)

        # Informações gerais
        info_lines = []

        if user_info:
            if user_info.get('company_name'):
                info_lines.append(f"<b>Empresa:</b> {user_info['company_name']}")
            if user_info.get('full_name'):
                info_lines.append(f"<b>Responsável:</b> {user_info['full_name']}")

        info_lines.append(f"<b>Total de NF-es:</b> {total_nfes}")
        info_lines.append(f"<b>Data de Geração:</b> {datetime.now().strftime('%d/%m/%Y %H:%M')}")

        for line in info_lines:
            elements.append(Paragraph(line, self.styles['InfoText']))

        elements.append(Spacer(1, 0.5*cm))

        return elements

    def _create_data_table(self, rows: List[Dict]) -> Table:
        """Cria a tabela com os dados do relatório"""
        # Cabeçalhos
        headers = [
            'Registro MAPA',
            'Produto',
            'Unidade',
            'Qtd. Importação',
            'Qtd. Nacional'
        ]

        # Dados da tabela
        table_data = [headers]

        for row in rows:
            table_data.append([
                row['mapa_registration'],
                row['product_name'][:50] if row['product_name'] else '-',  # Limitar tamanho
                row['unit'],
                row['quantity_import'],
                row['quantity_domestic']
            ])

        # Criar tabela
        col_widths = [4*cm, 8*cm, 2.5*cm, 3*cm, 3*cm]
        table = Table(table_data, colWidths=col_widths)

        # Estilo da tabela
        table.setStyle(TableStyle([
            # Cabeçalho
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#059669')),  # Emerald 600
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),

            # Corpo da tabela
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),  # Registro MAPA
            ('ALIGN', (1, 1), (1, -1), 'LEFT'),  # Produto
            ('ALIGN', (2, 1), (2, -1), 'CENTER'),  # Unidade
            ('ALIGN', (3, 1), (-1, -1), 'RIGHT'),  # Quantidades
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),

            # Bordas
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#047857')),  # Emerald 700

            # Zebrar linhas
            *[('BACKGROUND', (0, i), (-1, i), colors.HexColor('#F0FDF4'))  # Emerald 50
              for i in range(2, len(table_data), 2)]
        ]))

        return table

    def _create_footer(self) -> List:
        """Cria o rodapé do relatório"""
        elements = []

        elements.append(Spacer(1, 1*cm))

        # Linha divisória
        elements.append(Paragraph(
            "_" * 120,
            self.styles['Normal']
        ))

        # Texto do rodapé
        footer_style = ParagraphStyle(
            name='Footer',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_CENTER
        )

        footer_text = f"Relatório gerado automaticamente pelo sistema MAPA SaaS - {datetime.now().year}"
        elements.append(Paragraph(footer_text, footer_style))

        return elements

    def _format_period(self, period: str) -> str:
        """
        Formata o período para exibição.
        Ex: "Q1-2025" -> "1º Trimestre de 2025"
        """
        try:
            quarter, year = period.split('-')
            quarter_num = quarter.replace('Q', '')
            return f"{quarter_num}º Trimestre de {year}"
        except:
            return period
