# 🔄 Guia de Migração - Adicionar Coluna 'period'

Este guia mostra como executar a migração do banco de dados para corrigir os erros 500.

## 🎯 O que esta migração faz?

Adiciona a coluna `period` na tabela `xml_uploads` que está faltando e causando erros 500 ao:
- Fazer upload de XML
- Gerar relatórios
- Baixar relatórios

---

## 📋 Opção 1: Via Azure Portal (RECOMENDADO - Mais Fácil)

### Passo 1: Acessar o Azure Portal
1. Vá em: https://portal.azure.com
2. Procure por **"PostgreSQL flexible servers"**
3. Clique no seu servidor PostgreSQL

### Passo 2: Abrir Query Editor
1. No menu lateral esquerdo, procure por **"Query editor (preview)"**
2. Clique nele
3. Faça login com as credenciais do banco

### Passo 3: Executar o SQL
1. Abra o arquivo `migrations/add_period_column.sql`
2. Copie todo o conteúdo
3. Cole no Query Editor do Azure Portal
4. Clique em **"Run"**

### Passo 4: Verificar resultado
Você deve ver a mensagem:
```
Column "period" added successfully to xml_uploads table
```

Ou se já existir:
```
Column "period" already exists in xml_uploads table
```

---

## 📋 Opção 2: Via psql (Linha de Comando)

Se você tem `psql` instalado localmente:

```bash
# Conectar ao banco
psql "postgres://username@server-name:password@server-name.postgres.database.azure.com:5432/database-name?sslmode=require"

# Executar o arquivo SQL
\i migrations/add_period_column.sql
```

---

## 📋 Opção 3: Via Python Script Local

Se você tem Python e a string de conexão:

```bash
# Ativar ambiente virtual (Windows)
.\venv\Scripts\activate

# Executar o script
python migrations/add_period_to_xml_uploads.py
```

Você precisará ter a variável de ambiente `DATABASE_URL` configurada.

---

## ✅ Como saber se funcionou?

Após executar a migração:

1. **Teste o upload de XML**
   - Acesse: https://mapa-app-clean-8270.azurewebsites.net
   - Faça login
   - Tente fazer upload de um XML
   - ✅ Deve funcionar sem erro 500

2. **Teste gerar relatório**
   - Vá em "Relatórios"
   - Selecione um período
   - Clique em "Gerar Relatório"
   - ✅ Deve gerar e baixar sem erro 500

3. **Verifique o histórico**
   - Vá em "Upload XML"
   - Verifique se a lista carrega
   - ✅ Deve carregar sem erro 500

---

## 🐛 Solução de Problemas

### "Erro de autenticação ao conectar no banco"
- Verifique se você está usando as credenciais corretas
- No Azure Portal, vá em PostgreSQL > Connection strings
- Use a string de conexão completa

### "Column already exists"
- ✅ Isso é bom! Significa que a migração já foi executada
- Não precisa fazer nada

### "Permission denied"
- Você precisa de permissões de ALTER TABLE
- Use uma conta de admin do banco de dados

---

## 🔐 Onde encontrar as credenciais do banco?

1. Azure Portal > PostgreSQL flexible server > seu servidor
2. Menu lateral: **"Connection strings"**
3. Copie a string de conexão
4. Substitua `{your_password}` pela senha real

---

## 📞 Precisa de ajuda?

Se encontrar problemas:
1. Verifique se o servidor PostgreSQL está rodando
2. Confirme que tem permissões de admin
3. Tente a Opção 1 (Azure Portal) - é a mais fácil

---

**Depois de executar a migração, os erros 500 vão sumir!** 🎉
