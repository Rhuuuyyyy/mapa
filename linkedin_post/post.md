Semanas de trabalho manual por ciclo de reporte. Esse era o custo invisível do compliance regulatório na Solo Vivo antes de eu construir o Sistema MAPA.

O MAPA — Ministério da Agricultura, Pecuária e Abastecimento — exige que distribuidoras de fertilizantes entreguem periodicamente um relatório agregando dados de todas as notas fiscais do período. O agrônomo responsável pegava cada PDF, extraía os dados manualmente e montava a planilha campo a campo. Ciclo após ciclo.

O que eu construí muda isso completamente.

O agrônomo faz upload dos arquivos — XML das NF-es ou PDF como fallback. O sistema extrai automaticamente: emitente, destinatário, produtos, quantidades, composição de nutrientes (N, P2O5, K2O, Ca, Mg, S) e o número de registro MAPA de cada fertilizante. O parser XML usa lxml com prevenção explícita de XXE; o parser de PDF usa pdfplumber com regex calibrado para o padrão das descrições de produto do setor.

Depois da extração, o sistema cruza com o catálogo da empresa, converte unidades para toneladas, classifica cada entrada como importado ou nacional pelo UF do emitente e agrega os totais por registro MAPA. O relatório sai em PDF e Excel, formatado conforme exigência do órgão.

Stack: FastAPI, PostgreSQL, pdfplumber, lxml, openpyxl, reportlab.

Esse projeto me ensinou que automação de verdade não é sobre tecnologia bonita. É sobre entender quem está perdendo semanas fazendo um trabalho que ninguém deveria fazer manualmente, e eliminar esse trabalho de vez.

Se eu reconstruísse hoje, usaria LLM com structured output — Pydantic + function calling — para a extração. Documentos fiscais brasileiros têm variação suficiente para que regras de regex quebrem silenciosamente em edge cases. Um modelo com schema fixo é mais robusto, especialmente para capturar composições de nutrientes em formatos não padronizados. Esse é exatamente o tipo de problema que define o que eu quero construir daqui pra frente.

Se você trabalha com automação de documentos regulatórios ou quer trocar ideia sobre extração estruturada de dados, fala comigo.

#DocumentAI #DataExtraction #AIEngineering #Automation #Python #FastAPI #RegTech
