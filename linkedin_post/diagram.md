# Fluxo do Sistema MAPA

```
+------------------+
|    Agrônomo      |
+------------------+
         |
         | upload de NF-es (XML ou PDF)
         v
+------------------+
| Sistema de       |
| Extração         |
|                  |
| XML (primario)   |  lxml + XPath namespace-aware
|   - emitente     |  prevenção de XXE (resolve_entities=False)
|   - destinatário |
|   - produtos     |
|   - nutrientes   |  regex: N, P2O5, K2O, Ca, Mg, S
|   - reg. MAPA    |  3 padrões de fallback
|                  |
| PDF (fallback)   |  pdfplumber + regex
|   - chave acesso |
|   - número/série |
+------------------+
         |
         | dados estruturados (NFeData)
         v
+------------------+
| Processamento e  |
| Estruturação     |
|                  |
| - matching com   |  índices em memória: O(1) por
|   catálogo       |  empresa e (empresa, produto)
| - conversão de   |  KG, TON, TN → toneladas (Decimal)
|   unidades       |
| - classificação  |  UF emitente = "EX" → importado
|   imp./nacional  |       demais → nacional
| - agregação por  |  defaultdict somando Decimal
|   reg. MAPA      |
+------------------+
         |
         | linhas agregadas por registro MAPA
         v
+------------------+
| Geração do       |
| Relatório        |
|                  |
| Excel (openpyxl) |
| PDF (reportlab)  |
+------------------+
         |
         v
+------------------+
| Saída Regulatória|
| MAPA             |
|                  |
| Colunas:         |
| Registro MAPA    |
| Produto          |
| Unidade          |
| Qtd. Importada   |
| Qtd. Nacional    |
+------------------+
```
