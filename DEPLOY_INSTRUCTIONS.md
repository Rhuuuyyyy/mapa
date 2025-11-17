# 🚀 Instruções de Deploy - MAPA SaaS

## ⚠️ IMPORTANTE - Migração do Banco de Dados

Após fazer deploy do código mais recente, você **PRECISA** executar a migração do banco de dados para adicionar o campo `period` à tabela `xml_uploads`.

## Opção 1: Executar via SSH no Azure

1. Conecte-se ao Azure App Service via SSH:
   ```bash
   az webapp ssh --name mapa-app-clean-8270 --resource-group <seu-resource-group>
   ```

2. Execute a migração:
   ```bash
   cd /home/site/wwwroot
   python migrations/add_period_to_xml_uploads.py
   ```

## Opção 2: Executar via Azure Portal

1. Vá para o Azure Portal
2. Navegue até seu App Service (mapa-app-clean-8270)
3. Vá em **Development Tools** > **SSH** > **Go**
4. Execute:
   ```bash
   python migrations/add_period_to_xml_uploads.py
   ```

## Opção 3: Executar localmente (se tiver acesso direto ao banco)

1. Configure a variável de ambiente DATABASE_URL:
   ```bash
   export DATABASE_URL="sua_connection_string_do_azure"
   ```

2. Execute a migração:
   ```bash
   python migrations/add_period_to_xml_uploads.py
   ```

## Verificar se a migração funcionou

Execute no PostgreSQL:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'xml_uploads';
```

Você deve ver a coluna `period` listada.

## O que esta migração faz?

- Adiciona a coluna `period` (VARCHAR(20)) à tabela `xml_uploads`
- Esta coluna armazena o período trimestral (ex: "Q1-2025", "Q4-2024")
- É usada para filtrar XMLs ao gerar relatórios
- XMLs já existentes terão `period = NULL` (ok, podem ser re-processados)

## Próximos uploads

Novos uploads de XML automaticamente terão o campo `period` preenchido baseado na data de emissão da NF-e.

## Problemas?

Se a migração falhar, verifique:
1. ✅ Conexão com o banco de dados
2. ✅ Permissões de ALTER TABLE
3. ✅ String de conexão correta em DATABASE_URL

## Rollback (reverter)

Se precisar reverter a migração:
```bash
python migrations/add_period_to_xml_uploads.py downgrade
```

---

**Data:** 2025-01-17
**Versão:** 1.0.0
