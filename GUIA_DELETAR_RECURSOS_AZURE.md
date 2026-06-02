# 🔍 GUIA PASSO A PASSO - Como Encontrar e Deletar Recursos Duplicados no Azure

---

## 📍 MÉTODO 1: Portal Azure (Mais Fácil)

### Passo 1: Acessar o Portal
1. Abra: **https://portal.azure.com**
2. Faça login com sua conta

### Passo 2: Ver Todos os Recursos
Você tem 3 opções:

#### OPÇÃO A: Busca Direta (Mais Rápido)
1. Na barra de busca no topo (onde tem a lupa 🔍)
2. Digite o nome do recurso, exemplo: `mapa-saas-db-1762970076`
3. Clique no recurso que aparecer
4. Pule para "Passo 3: Deletar"

#### OPÇÃO B: Lista de Todos os Recursos
1. No menu lateral esquerdo, clique em **"All resources"** (ou "Todos os recursos")
2. Você verá uma lista com TODOS os recursos
3. Use a caixa de busca/filtro no topo para encontrar:
   - Digite `mapa` para filtrar apenas recursos do MAPA
4. Ordene por **"Type"** (Tipo) para agrupar bancos de dados juntos

#### OPÇÃO C: Por Resource Group (Recomendado)
1. No menu lateral esquerdo, clique em **"Resource groups"** (ou "Grupos de recursos")
2. Clique no resource group do seu projeto (provavelmente algo como `mapa-rg` ou similar)
3. Você verá TODOS os recursos desse grupo

---

## 🗑️ PASSO 3: Como Deletar Cada Recurso

### Para BANCOS DE DADOS (PostgreSQL):

1. **Encontre o banco:**
   - Nome: `mapa-saas-db-1762970076` (ou outro da lista)
   - Tipo: "Azure Database for PostgreSQL server"

2. **Abra o recurso:**
   - Clique no nome do banco

3. **Delete:**
   - No topo da página, clique em **"Delete"** (ou "Excluir")
   - Vai aparecer um aviso vermelho
   - **IMPORTANTE:** Digite exatamente o nome do servidor para confirmar
   - Marque a caixa "I have read and understand..."
   - Clique em **"Delete"** novamente

4. **Repita para os outros 2 bancos:**
   - `mapa-saas-db-1762971490`
   - `mapa-saas-db-1762971848`

---

### Para APP SERVICE PLAN:

1. **Encontre o plan:**
   - Nome: `mapa-saas-plan`
   - Tipo: "App Service plan"

2. **Abra o recurso:**
   - Clique no nome

3. **Delete:**
   - No topo, clique em **"Delete"**
   - Confirme digitando o nome
   - Clique em **"Delete"**

---

### Para APP SERVICES (Apps):

1. **Encontre os apps:**
   - Nome: `mapa-saas-app-1762967228`
   - Nome: `mapa-saas-app-1762971490`
   - Tipo: "App Service"

2. **Para cada app:**
   - Clique no nome
   - Clique em **"Delete"** no topo
   - Confirme
   - Delete

---

## 📸 REFERÊNCIA VISUAL

Quando você abrir "All resources", vai ver algo assim:

```
┌─────────────────────────────────────────────────────────────┐
│ All resources                                    [Filtros ▼] │
├─────────────────────────────────────────────────────────────┤
│ Nome                          Tipo                     RG    │
├─────────────────────────────────────────────────────────────┤
│ ❌ mapa-saas-db-1762970076   PostgreSQL server      mapa-rg │ ← DELETAR
│ ❌ mapa-saas-db-1762971490   PostgreSQL server      mapa-rg │ ← DELETAR
│ ❌ mapa-saas-db-1762971848   PostgreSQL server      mapa-rg │ ← DELETAR
│ ✅ mapa-db-clean-28031       PostgreSQL server      mapa-rg │ ← MANTER
│                                                               │
│ ❌ mapa-saas-plan            App Service plan       mapa-rg │ ← DELETAR
│ ✅ mapa-plan-clean           App Service plan       mapa-rg │ ← MANTER
│                                                               │
│ ❌ mapa-saas-app-1762967228  App Service           mapa-rg │ ← DELETAR
│ ❌ mapa-saas-app-1762971490  App Service           mapa-rg │ ← DELETAR
│ ✅ mapa-app-clean-8270       App Service           mapa-rg │ ← MANTER
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 MÉTODO 2: Azure CLI (Se preferir linha de comando)

### Passo 1: Instalar Azure CLI

**Windows:**
```powershell
# Baixe e instale de: https://aka.ms/installazurecliwindows
```

**Mac:**
```bash
brew install azure-cli
```

**Linux:**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### Passo 2: Login
```bash
az login
# Vai abrir o browser para você fazer login
```

### Passo 3: Listar Resource Groups
```bash
az group list --output table
```

Anote o nome do seu resource group (provavelmente algo como `mapa-rg`).

### Passo 4: Listar TODOS os Recursos
```bash
az resource list --resource-group SEU_RESOURCE_GROUP --output table
```

Substitua `SEU_RESOURCE_GROUP` pelo nome que você anotou.

### Passo 5: Deletar Recursos

**Deletar Bancos de Dados:**
```bash
# ATENÇÃO: Confirme o resource group correto antes!

# Banco 1
az postgres server delete \
  --name mapa-saas-db-1762970076 \
  --resource-group SEU_RESOURCE_GROUP \
  --yes

# Banco 2
az postgres server delete \
  --name mapa-saas-db-1762971490 \
  --resource-group SEU_RESOURCE_GROUP \
  --yes

# Banco 3
az postgres server delete \
  --name mapa-saas-db-1762971848 \
  --resource-group SEU_RESOURCE_GROUP \
  --yes
```

**Deletar App Service Plan:**
```bash
az appservice plan delete \
  --name mapa-saas-plan \
  --resource-group SEU_RESOURCE_GROUP \
  --yes
```

**Deletar App Services:**
```bash
az webapp delete \
  --name mapa-saas-app-1762967228 \
  --resource-group SEU_RESOURCE_GROUP

az webapp delete \
  --name mapa-saas-app-1762971490 \
  --resource-group SEU_RESOURCE_GROUP
```

---

## ⚠️ ANTES DE DELETAR - CHECKLIST IMPORTANTE

### 1. Confirmar qual banco está em uso:

```bash
# Ver connection string do app em produção
az webapp config appsettings list \
  --name mapa-app-clean-8270 \
  --resource-group SEU_RESOURCE_GROUP \
  --query "[?name=='DATABASE_URL'].value" \
  --output tsv
```

**OU** no Portal:
1. Vá em `mapa-app-clean-8270` (o app em produção)
2. Settings → Configuration
3. Application settings
4. Procure `DATABASE_URL`
5. Clique em "Show value"
6. Você verá algo como:
   ```
   postgresql://user@mapa-db-clean-28031:senha@mapa-db-clean-28031.postgres...
                     ^^^^^^^^^^^^^^^^^^^^
                     ESTE é o banco em uso!
   ```

### 2. Fazer Backup (Precaução):

**No Portal:**
1. Vá no banco `mapa-db-clean-28031` (o que está EM USO)
2. No menu lateral, clique em "Backup and Restore"
3. Configure backup se não estiver configurado

**OU com CLI:**
```bash
# Criar backup manual
az postgres server-logs download \
  --name mapa-db-clean-28031 \
  --resource-group SEU_RESOURCE_GROUP
```

---

## 🎯 ORDEM RECOMENDADA DE DELEÇÃO

### Fase 1: App Services (Rápido, sem custo)
1. Delete `mapa-saas-app-1762967228`
2. Delete `mapa-saas-app-1762971490`
3. **Teste:** Acesse seu app em produção (`mapa-app-clean-8270.azurewebsites.net`)
4. Se estiver funcionando, prossiga

### Fase 2: App Service Plan (Economia: R$ 0.10/mês)
1. Delete `mapa-saas-plan`
2. **Teste:** Acesse seu app novamente
3. Se estiver funcionando, prossiga

### Fase 3: Bancos de Dados (Economia: R$ 68.83/mês) ⚠️ MAIS IMPORTANTE
**ANTES:**
- ✅ Confirme que app usa `mapa-db-clean-28031`
- ✅ Faça backup do banco em uso
- ✅ Tenha certeza que os outros 3 NÃO têm dados importantes

**Delete um por vez:**
1. Delete `mapa-saas-db-1762970076`
2. **Aguarde 5 minutos**
3. **Teste:** Acesse seu app e faça login
4. Se funcionar, delete o próximo
5. Delete `mapa-saas-db-1762971490`
6. **Teste novamente**
7. Delete `mapa-saas-db-1762971848`
8. **Teste final**

---

## 🚨 SE ALGO DER ERRADO

### Se você deletar o banco errado:

**NÃO ENTRE EM PÂNICO!**

Azure mantém backups automáticos por 7-35 dias (dependendo do tier).

**Para restaurar:**
1. Vá em "Deleted resources" no Portal
2. Ou use CLI:
```bash
az postgres server restore \
  --source-server NOME_DO_BANCO_DELETADO \
  --name NOVO_NOME \
  --resource-group SEU_RESOURCE_GROUP \
  --restore-point-in-time "2024-01-01T00:00:00Z"
```

---

## ✅ APÓS DELETAR TUDO

### Verifique que só restaram 3 recursos:

```bash
az resource list --resource-group SEU_RESOURCE_GROUP --output table
```

Você deve ver apenas:
- ✅ `mapa-db-clean-28031` (PostgreSQL)
- ✅ `mapa-plan-clean` (App Service Plan)
- ✅ `mapa-app-clean-8270` (App Service)

### Monitore custos:

1. Portal Azure → "Cost Management + Billing"
2. "Cost Analysis"
3. Aguarde 24-48h para ver a redução

**Custo esperado após deleção:**
- Antes: R$ 115.91/mês
- Depois: R$ 46.98/mês
- **Economia: R$ 68.93/mês** ✅

---

## 📞 PRECISA DE AJUDA?

Se tiver qualquer dúvida durante a deleção:
1. **PARE** antes de deletar
2. Tire screenshot do recurso
3. Me pergunte antes de prosseguir

**Melhor ser cauteloso que apagar algo importante!**
