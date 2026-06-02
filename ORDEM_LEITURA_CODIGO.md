# 📚 ORDEM DE LEITURA DO CÓDIGO - MAPA SaaS

**Objetivo:** Este guia apresenta a ordem recomendada para ler e entender o código-fonte do MAPA SaaS, focando **apenas nos arquivos essenciais** que contêm a lógica de negócio.

**Filtros aplicados:**
- ❌ Removidos: testes, migrations, scripts auxiliares, configs detalhadas, boilerplate
- ✅ Incluídos: entry points, controllers, algoritmos core, models, utilities principais

---

## 🎯 PARTE 1: FUNDAÇÃO DO BACKEND (Estrutura e Dados)

### 1️⃣ `/app/main.py` (98 linhas)
**O que é:** Entry point do backend FastAPI.

**Por que ler primeiro:**
- Mostra como o app é inicializado
- Quais routers são registrados (`/user`, `/admin`)
- Middlewares de segurança (CORS, headers)
- Lifecycle hooks (startup/shutdown)

**O que você vai entender:**
- A estrutura geral da aplicação
- Como as rotas são organizadas
- Quais middlewares protegem o app

**Tempo de leitura:** 5 minutos

---

### 2️⃣ `/app/database.py` (64 linhas)
**O que é:** Configuração do SQLAlchemy (ORM).

**Por que ler agora:**
- Define como a app conecta ao PostgreSQL
- Pool de conexões (otimizado para Azure)
- Factory de sessões (`get_db()`)

**O que você vai entender:**
- Como o banco de dados é configurado
- Por que pool_size=10 e max_overflow=20
- Como obter uma sessão do banco

**Tempo de leitura:** 3 minutos

---

### 3️⃣ `/app/models.py` (~300-400 linhas estimadas)
**O que é:** Modelos de dados (SQLAlchemy ORM) - **A ESSÊNCIA DO DOMÍNIO**.

**Por que ler agora:**
- Define TODAS as tabelas do banco
- Mostra os relacionamentos entre entidades
- É o "blueprint" da lógica de negócio

**Entidades principais:**
- `User` - Usuários do sistema
- `Company` - Empresas do usuário (CNPJs)
- `Product` - Catálogo de produtos
- `XMLUpload` - Uploads de arquivos NFe
- `Report` - Relatórios MAPA gerados

**O que você vai entender:**
- Qual é o domínio de negócio completo
- Como as entidades se relacionam
- Quais campos são obrigatórios/opcionais

**Tempo de leitura:** 15-20 minutos ⚠️ **ARQUIVO MAIS IMPORTANTE**

---

### 4️⃣ `/app/schemas.py` (~200-300 linhas estimadas)
**O que é:** Schemas Pydantic para validação de requests/responses.

**Por que ler agora:**
- Complementa `models.py`
- Define o "contrato" da API
- Validações de entrada

**O que você vai entender:**
- Quais dados são recebidos/retornados pela API
- Regras de validação (email, senha, etc.)
- Diferença entre schema de criação e resposta

**Tempo de leitura:** 10 minutos

---

### 5️⃣ `/app/auth.py` (~150-200 linhas estimadas)
**O que é:** Autenticação e autorização (JWT).

**Por que ler agora:**
- Antes de entender os endpoints, precisa saber como funcionam `get_current_user()` e `require_admin()`

**Funções principais:**
- `create_access_token()` - Gera JWT
- `get_current_user()` - Extrai user do token
- `require_admin()` - Valida permissão de admin

**O que você vai entender:**
- Como funciona o login/logout
- Como os endpoints protegem rotas
- O que está dentro do token JWT

**Tempo de leitura:** 8 minutos

---

## 🎯 PARTE 2: CONTROLLERS (Lógica de Negócio via API)

### 6️⃣ `/app/routers/user.py` (~1.200 linhas) ⚠️ **ARQUIVO MAIOR E MAIS IMPORTANTE**
**O que é:** Todos os endpoints do usuário comum.

**Por que ler agora:**
- Contém 80% da lógica de negócio
- É o "coração" da aplicação

**Endpoints principais (na ordem):**
1. **Authentication** (linhas ~20-120):
   - `POST /register` - Cadastro
   - `POST /login` - Login
   - `POST /logout` - Logout
   - `POST /change-password` - Trocar senha

2. **Companies (Empresas)** (linhas ~214-330):
   - `GET /companies` - Listar (com paginação)
   - `POST /companies` - Criar
   - `GET /companies/{id}` - Obter
   - `PUT /companies/{id}` - Atualizar
   - `DELETE /companies/{id}` - Deletar

3. **Products (Catálogo)** (linhas ~368-510):
   - `GET /products` - Listar (com paginação)
   - `POST /products` - Criar
   - `PUT /products/{id}` - Atualizar
   - `DELETE /products/{id}` - Deletar
   - `GET /catalog` - Obter catálogo completo (usado no mapeamento)

4. **XML Upload** (linhas ~530-770):
   - `POST /upload-preview` - Preview antes de confirmar
   - `POST /upload-confirm` - Confirmar upload
   - `GET /uploads` - Listar uploads (com paginação)
   - `GET /uploads/{id}` - Obter upload
   - `DELETE /uploads/{id}` - Deletar upload

5. **Reports (MAPA)** (linhas ~1.000-1.226):
   - `POST /generate-report` - Gerar relatório MAPA
   - `GET /reports` - Listar relatórios (com paginação)
   - `GET /reports/{id}` - Obter relatório
   - `DELETE /reports/{id}` - Deletar relatório
   - `GET /reports/{id}/download` - Download PDF

**O que você vai entender:**
- Como funciona o fluxo completo da aplicação
- Como o usuário gerencia empresas e produtos
- Como funciona o upload de XMLs
- Como são gerados os relatórios MAPA

**Tempo de leitura:** 45-60 minutos ⚠️ **ARQUIVO CRÍTICO - LER COM CALMA**

**Dica:** Leia na ordem dos endpoints acima, seguindo o fluxo natural do usuário.

---

### 7️⃣ `/app/routers/admin.py` (~150 linhas)
**O que é:** Endpoints administrativos.

**Por que ler agora:**
- Complementa `user.py`
- Mostra funcionalidades de admin

**Endpoints:**
- `POST /admin/setup` - Criar primeiro admin
- `GET /admin/users` - Listar usuários
- `PUT /admin/users/{id}` - Atualizar usuário
- `DELETE /admin/users/{id}` - Deletar usuário

**O que você vai entender:**
- Como admins gerenciam usuários
- Diferenças de permissões

**Tempo de leitura:** 8 minutos

---

## 🎯 PARTE 3: PROCESSADORES (Algoritmos Core)

### 8️⃣ `/app/utils/nfe_processor.py` (~200-300 linhas estimadas)
**O que é:** Processador de arquivos XML de NFe (Nota Fiscal Eletrônica).

**Por que ler agora:**
- É o **algoritmo mais importante do sistema**
- Extrai dados dos XMLs de NFe

**Funções principais:**
- `parse_nfe_xml()` - Parse do XML
- `extract_nfe_data()` - Extrai dados estruturados
- Tratamento de diferentes versões de NFe

**O que você vai entender:**
- Como a app lê XMLs de NFe
- Quais dados são extraídos (CNPJ emissor, produtos, valores, etc.)
- Como lida com erros de parse

**Tempo de leitura:** 15 minutos ⚠️ **ALGORITMO CRÍTICO**

---

### 9️⃣ `/app/utils/mapa_processor.py` (~300-400 linhas estimadas)
**O que é:** Processador que gera o relatório MAPA.

**Por que ler agora:**
- É o segundo algoritmo mais importante
- Implementa a lógica de negócio principal: mapeamento entre NFes e catálogo

**Lógica principal:**
1. Recebe lista de XMLs processados
2. Para cada produto na NFe:
   - Busca no catálogo do usuário (por CNPJ + nome do produto)
   - Mapeia para o produto cadastrado
   - Agrupa por período
3. Gera totais e estatísticas

**O que você vai entender:**
- Como funciona o mapeamento automático
- Como são calculados os totais
- Como agrupa por período

**Tempo de leitura:** 20 minutos ⚠️ **ALGORITMO CRÍTICO**

---

### 🔟 `/app/utils/report_generator.py` (~150-200 linhas estimadas)
**O que é:** Gerador de relatórios estruturados.

**Por que ler agora:**
- Complementa `mapa_processor.py`
- Formata os dados para apresentação

**O que você vai entender:**
- Como os dados brutos viram relatórios estruturados
- Formato final do relatório

**Tempo de leitura:** 8 minutos

---

### 1️⃣1️⃣ `/app/utils/pdf_generator.py` (~100-150 linhas estimadas)
**O que é:** Gerador de PDFs dos relatórios.

**Por que ler agora:**
- Feature importante: download em PDF

**O que você vai entender:**
- Como gera PDFs (provavelmente usa ReportLab ou similar)
- Layout e formatação dos relatórios

**Tempo de leitura:** 5 minutos

---

### 1️⃣2️⃣ `/app/utils/validators.py` (~100 linhas)
**O que é:** Validações de segurança (MIME types, tamanho de arquivos).

**Por que ler agora:**
- Mostra camada de proteção

**O que você vai entender:**
- Como valida uploads
- Limites de segurança

**Tempo de leitura:** 5 minutos

---

## 🎯 PARTE 4: FRONTEND (Opcional, mas recomendado)

Se você quer entender a experiência do usuário:

### 1️⃣3️⃣ `/frontend/src/main.jsx` (20 linhas)
**O que é:** Entry point do React.

**Tempo de leitura:** 2 minutos

---

### 1️⃣4️⃣ `/frontend/src/App.jsx` (~80 linhas)
**O que é:** Routing principal (React Router).

**O que você vai entender:**
- Quais páginas existem
- Como funciona a navegação

**Tempo de leitura:** 5 minutos

---

### 1️⃣5️⃣ `/frontend/src/contexts/AuthContext.jsx` (~150 linhas)
**O que é:** Contexto de autenticação React.

**O que você vai entender:**
- Como o frontend gerencia login/logout
- Como armazena o token JWT

**Tempo de leitura:** 8 minutos

---

### 1️⃣6️⃣ `/frontend/src/services/api.js` (~100 linhas)
**O que é:** Cliente Axios para chamadas à API.

**O que você vai entender:**
- Como o frontend se comunica com o backend
- Interceptors de autenticação

**Tempo de leitura:** 5 minutos

---

### 1️⃣7️⃣ `/frontend/src/pages/UploadXML.jsx` (~200-300 linhas estimadas)
**O que é:** Página de upload de XMLs.

**Por que ler:**
- É a **feature principal** do sistema
- Mostra o fluxo: preview → confirm

**Tempo de leitura:** 15 minutos

---

### 1️⃣8️⃣ `/frontend/src/pages/Reports.jsx` (~200-300 linhas estimadas)
**O que é:** Página de relatórios MAPA.

**Por que ler:**
- Segunda feature mais importante
- Mostra listagem e download de relatórios

**Tempo de leitura:** 15 minutos

---

## 📊 RESUMO - TEMPO TOTAL ESTIMADO

### Leitura Mínima (apenas backend essencial):
- **Arquivos:** 1-12
- **Tempo:** 2-3 horas
- **Conhecimento:** 80% da aplicação

### Leitura Completa (backend + frontend):
- **Arquivos:** 1-18
- **Tempo:** 3-4 horas
- **Conhecimento:** 95% da aplicação

---

## 🎯 ORDEM DE LEITURA FINAL (RESUMO)

### CAMINHO CRÍTICO (80% do entendimento):
```
1. main.py           → Entry point
2. database.py       → Setup do banco
3. models.py         → DOMÍNIO (tabelas) ⭐⭐⭐
4. schemas.py        → Validações
5. auth.py           → Autenticação
6. routers/user.py   → LÓGICA DE NEGÓCIO ⭐⭐⭐⭐⭐
7. utils/nfe_processor.py    → Parse de XMLs ⭐⭐⭐
8. utils/mapa_processor.py   → Geração de MAPA ⭐⭐⭐
```

### Complementares:
```
9. routers/admin.py
10. utils/report_generator.py
11. utils/pdf_generator.py
12. utils/validators.py
```

### Frontend (opcional):
```
13. frontend/src/main.jsx
14. frontend/src/App.jsx
15. frontend/src/contexts/AuthContext.jsx
16. frontend/src/services/api.js
17. frontend/src/pages/UploadXML.jsx
18. frontend/src/pages/Reports.jsx
```

---

## 💡 DICAS PARA LEITURA

### 1. Use esta estratégia:
- **1ª passada:** Leia rápido, apenas assinaturas de funções e comentários
- **2ª passada:** Leia a implementação com calma
- **3ª passada:** Execute mentalmente com dados reais

### 2. Faça perguntas enquanto lê:
- "Por que esta função existe?"
- "Quando ela é chamada?"
- "O que acontece se der erro?"

### 3. Desenhe fluxos:
- Fluxo de upload de XML
- Fluxo de geração de relatório
- Fluxo de autenticação

### 4. Pule detalhes inicialmente:
- Validações complexas de CPF/CNPJ
- Tratamento de erros específicos
- Otimizações de performance

---

## 🎓 PRÓXIMOS PASSOS APÓS LER

1. **Execute a aplicação localmente** e teste cada feature
2. **Debug com breakpoints** nos pontos críticos
3. **Leia os testes** (se existirem) para entender casos de uso
4. **Modifique algo pequeno** para validar entendimento

---

**Boa leitura! 📖**
