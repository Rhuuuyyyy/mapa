# CHANGELOG - Correções Críticas v2.0.1

**Data:** 18 de Novembro de 2025
**Versão:** 2.0.1
**Tipo:** Bug fixes e funcionalidades críticas

---

## PROBLEMAS CORRIGIDOS

### 1. BUG CRÍTICO: Download de Relatório Quebrado

**Problema:**
- Usuário clicava em "Baixar PDF" mas recebia arquivo JSON corrompido
- Arquivo não podia ser aberto
- Sistema tinha gerador de Excel completo mas não estava sendo usado

**Solução:**
- Corrigido endpoint `/reports/{report_period}/download`
- Agora gera arquivo Excel (`.xlsx`) usando `MAPAReportGenerator`
- Formato oficial do Ministério da Agricultura
- Arquivo pode ser aberto normalmente no Excel/LibreOffice

**Arquivo modificado:**
- `app/routers/user.py` (linhas 908-987)

**Teste:**
1. Faça upload de NF-es
2. Gere relatório
3. Clique em "Baixar"
4. Arquivo `relatorio_mapa_Q1-2025.xlsx` será baixado
5. Abra no Excel - deve funcionar perfeitamente

---

### 2. FUNCIONALIDADE: Validação de Duplicatas de NF-e

**Problema:**
- Usuário podia processar a mesma NF-e múltiplas vezes
- Dados duplicados no relatório
- Sem controle de duplicidade

**Solução:**
- Adicionado campo `nfe_key` ao modelo `XMLUpload`
- Extração automática da chave de acesso (44 dígitos) da NF-e
- Validação no momento do upload
- Retorna erro HTTP 409 (Conflict) se NF-e já foi processada
- Mensagem clara: "NF-e com chave XXX já foi processada em DD/MM/YYYY HH:MM"

**Arquivos modificados:**
- `app/models.py` (linhas 100-128)
- `app/routers/user.py` (linhas 481-500)

**Teste:**
1. Faça upload de uma NF-e
2. Tente fazer upload da mesma NF-e novamente
3. Sistema deve retornar erro 409 com mensagem informativa
4. Primeiro upload deve permanecer intacto

---

### 3. FUNCIONALIDADE: Deleção de Uploads

**Problema:**
- Se usuário fizesse upload errado, não conseguia remover
- Sem endpoint DELETE
- Dados ficavam "presos" no sistema

**Solução:**
- Novo endpoint: `DELETE /api/user/uploads/{upload_id}`
- Remove arquivo físico do disco
- Remove registro do banco de dados
- Cascade delete remove reports associados
- Retorna 204 No Content em caso de sucesso

**Arquivo modificado:**
- `app/routers/user.py` (linhas 564-600)

**Teste:**
1. Liste uploads: `GET /api/user/uploads`
2. Copie ID de um upload
3. Delete: `DELETE /api/user/uploads/{id}`
4. Verifique que arquivo foi removido do disco
5. Liste uploads novamente - deve ter desaparecido

---

### 4. FUNCIONALIDADE: Edição de Período de Upload

**Problema:**
- Se usuário marcasse período errado (ex: Q1 em vez de Q2)
- Precisava deletar e refazer upload
- Sem opção de corrigir

**Solução:**
- Novo endpoint: `PATCH /api/user/uploads/{upload_id}`
- Permite alterar período (ex: Q1-2025 para Q2-2025)
- Validação de formato (regex: Q[1-4]-YYYY)
- Retorna erro 400 se formato inválido

**Arquivo modificado:**
- `app/routers/user.py` (linhas 603-645)

**Teste:**
1. Liste uploads: `GET /api/user/uploads`
2. Copie ID de um upload
3. Atualize período: `PATCH /api/user/uploads/{id}?period=Q2-2025`
4. Verifique resposta: deve retornar período atualizado
5. Gere relatório para o novo período - deve incluir esse upload

---

### 5. FUNCIONALIDADE BÔNUS: Listagem de Uploads

**Adicionado:**
- Novo endpoint: `GET /api/user/uploads`
- Lista todos uploads do usuário
- Ordenado por data (mais recente primeiro)
- Retorna: id, filename, upload_date, period, nfe_key, status, error_message

**Arquivo modificado:**
- `app/routers/user.py` (linhas 541-561)

**Teste:**
1. Acesse: `GET /api/user/uploads`
2. Deve retornar array com todos uploads
3. Cada item tem todas informações necessárias

---

## MUDANÇAS NO BANCO DE DADOS

### Nova Coluna: `nfe_key`

**Tabela:** `xml_uploads`
**Tipo:** `VARCHAR(44)` (nullable)
**Índices:**
- `ix_xml_uploads_nfe_key` (índice simples)
- `ix_user_nfe_key` (índice composto user_id + nfe_key)

**Propósito:**
- Armazenar chave de acesso da NF-e (44 dígitos)
- Validar duplicatas por usuário
- Performance: índice permite busca O(log n)

---

## COMO APLICAR AS MUDANÇAS

### Passo 1: Atualizar Código

```bash
# Se estiver em branch, fazer pull
git pull origin claude/create-document-014uca9d7cvb7kDWnhwzJUTV

# Ou copiar arquivos modificados:
# - app/models.py
# - app/routers/user.py
```

### Passo 2: Rodar Migração do Banco

**Opção A: Script Python (Recomendado)**
```bash
python migrations/run_migration.py
```

**Opção B: SQL Direto**
```bash
# Azure Database for PostgreSQL
psql -h mapa-db-clean-XXXX.postgres.database.azure.com \
     -U mapaadmin \
     -d mapa_db \
     -f migrations/add_nfe_key_to_uploads.sql
```

**Opção C: Via Azure Portal**
1. Vá para Azure Portal > PostgreSQL
2. Query Editor
3. Cole conteúdo de `migrations/add_nfe_key_to_uploads.sql`
4. Execute

### Passo 3: Reiniciar Aplicação

**Local:**
```bash
# Parar aplicação (Ctrl+C)
# Reiniciar
gunicorn app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

**Azure:**
- Aplicação reinicia automaticamente após deploy
- Ou: Azure Portal > App Service > Restart

### Passo 4: Verificar

```bash
# Health check
curl https://mapa-app-clean-8270.azurewebsites.net/health

# Listar uploads
curl -H "Authorization: Bearer {seu_token}" \
     https://mapa-app-clean-8270.azurewebsites.net/api/user/uploads

# Testar download de relatório
# 1. Acesse aplicação
# 2. Gere relatório
# 3. Clique em "Baixar"
# 4. Verifique que arquivo .xlsx é baixado corretamente
```

---

## TESTES RECOMENDADOS

### Teste 1: Download de Relatório Excel

**Passos:**
1. Login na aplicação
2. Upload de 3-5 NF-es de teste
3. Marque período (ex: Q1-2025)
4. Clique em "Gerar Relatório"
5. Clique em "Baixar Excel"

**Resultado Esperado:**
- Arquivo `relatorio_mapa_Q1-2025.xlsx` baixado
- Arquivo abre normalmente no Excel
- Header com "MINISTÉRIO DA AGRICULTURA"
- Dados das NF-es agregados corretamente
- Colunas: Material, Registro MAPA, Nacional, Importado, Total, NF-es Origem

### Teste 2: Validação de Duplicatas

**Passos:**
1. Faça upload de uma NF-e (guarde o arquivo)
2. Aguarde processamento
3. Tente fazer upload do MESMO arquivo novamente

**Resultado Esperado:**
- Erro HTTP 409 Conflict
- Mensagem: "NF-e com chave {chave} já foi processada em {data}"
- Primeiro upload permanece no sistema

### Teste 3: Deleção de Upload

**Passos:**
1. Liste uploads
2. Escolha um upload para deletar
3. DELETE /api/user/uploads/{id}
4. Liste uploads novamente

**Resultado Esperado:**
- HTTP 204 No Content
- Upload desaparece da listagem
- Arquivo físico removido do disco

### Teste 4: Edição de Período

**Passos:**
1. Liste uploads
2. Escolha upload com período Q1-2025
3. PATCH /api/user/uploads/{id}?period=Q2-2025
4. Verifique resposta

**Resultado Esperado:**
- HTTP 200 OK
- Resposta contém período atualizado: "Q2-2025"
- Próximo relatório Q2 deve incluir esse upload

### Teste 5: Formato Inválido de Período

**Passos:**
1. Tente editar período com formato errado
2. PATCH /api/user/uploads/{id}?period=2025-Q1 (ordem errada)

**Resultado Esperado:**
- HTTP 400 Bad Request
- Mensagem: "Formato de período inválido. Use Q1-2025, Q2-2025, Q3-2025 ou Q4-2025"

---

## IMPACTO NOS USUÁRIOS

### Positivo:
- ✅ Download de relatório funciona (antes estava quebrado)
- ✅ Não pode mais processar NF-e duplicada acidentalmente
- ✅ Pode corrigir erro de período sem refazer upload
- ✅ Pode deletar upload errado facilmente
- ✅ Melhor controle sobre dados

### Atenção:
- ⚠️ Migração de banco necessária (adicionar coluna)
- ⚠️ Uploads antigos não terão nfe_key preenchido (nullable)
- ⚠️ Validação de duplicatas só funciona para novos uploads (após migração)

---

## COMPATIBILIDADE

### Backward Compatibility:
- ✅ Coluna `nfe_key` é nullable - uploads antigos continuam funcionando
- ✅ Novos endpoints não afetam funcionalidade existente
- ✅ Frontend existente continua funcionando
- ✅ API versionada (/api/v1/) preparada para futuras mudanças

### Breaking Changes:
- ❌ Nenhuma breaking change
- ✅ 100% compatível com versão anterior

---

## PRÓXIMOS PASSOS (FUTURO)

Após testar e validar essas correções, podemos implementar:

1. **Paginação** (GET /uploads?page=1&per_page=50)
2. **Busca e Filtros** (GET /uploads?period=Q1-2025&status=processed)
3. **Auditoria Completa** (logs de todas ações)
4. **Dashboard Analytics** (gráficos de volume)
5. **Email Notifications** (upload processado, erro, etc)

Ver documento `ANALISE_MELHORIAS_E_GAPS.md` para lista completa.

---

## SUPORTE

**Dúvidas ou Problemas:**
- GitHub Issues
- Email: suporte@mapasaas.com.br
- Documentação: README.md

**Em caso de erro após migração:**
1. Verifique logs: `docker logs` ou Azure Portal > App Service > Log stream
2. Verifique se migração rodou: `SELECT column_name FROM information_schema.columns WHERE table_name='xml_uploads';`
3. Verifique se coluna `nfe_key` existe
4. Se necessário, rollback: `ALTER TABLE xml_uploads DROP COLUMN nfe_key;`

---

**FIM DO CHANGELOG**

*Versão 2.0.1 - 18/Nov/2025*
