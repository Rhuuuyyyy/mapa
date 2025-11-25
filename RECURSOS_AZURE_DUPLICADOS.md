# 🚨 RECURSOS DUPLICADOS NO AZURE - DESPERDIÇANDO R$ 70/MÊS

**Data:** 22 de Novembro de 2025
**Custo Total Atual:** R$ 116/mês
**Custo Necessário:** R$ 46/mês
**DESPERDÍCIO:** R$ 70/mês (60% do custo!)

---

## 📊 ANÁLISE DOS RECURSOS

### 🔴 BANCOS DE DADOS - 4 DUPLICADOS! (R$ 91.85/mês)

| Nome | Custo/mês | Status | Ação |
|------|-----------|--------|------|
| `mapa-saas-db-1762970076` | R$ 23.07 | ❌ TESTE ANTIGO | **DELETAR** |
| `mapa-db-clean-28031` | R$ 23.02 | ✅ EM USO | **MANTER** |
| `mapa-saas-db-1762971490` | R$ 22.88 | ❌ TESTE ANTIGO | **DELETAR** |
| `mapa-saas-db-1762971848` | R$ 22.88 | ❌ TESTE ANTIGO | **DELETAR** |

**PROBLEMA:**
- Você tem **4 bancos PostgreSQL** ativos
- Apenas **1 está sendo usado** pelo app (`mapa-db-clean-28031`)
- Os outros 3 são restos de testes/deployments antigos
- **Cada banco custa R$ 23/mês** mesmo SEM uso!

**ECONOMIA IMEDIATA:** R$ 68.83/mês (deletando 3 bancos)

---

### 🟡 APP SERVICE PLANS - 2 ATIVOS (R$ 24.06/mês)

| Nome | Custo/mês | Status | Ação |
|------|-----------|--------|------|
| `mapa-plan-clean` | R$ 23.96 | ✅ EM USO | **MANTER** |
| `mapa-saas-plan` | R$ 0.10 | ❌ ANTIGO | **DELETAR** |

**PROBLEMA:**
- App Service Plan é o "servidor" onde o app roda
- Você tem 2 plans, mas só precisa de 1
- O `mapa-saas-plan` custa pouco mas não é usado

**ECONOMIA:** R$ 0.10/mês (simbólico, mas limpa recursos)

---

### 🟢 APP SERVICES - 3 APPS (R$ 0/mês)

| Nome | Custo/mês | Status | Ação |
|------|-----------|--------|------|
| `mapa-saas-app-1762967228` | R$ 0 | ❌ TESTE ANTIGO | **DELETAR** |
| `mapa-saas-app-1762971490` | R$ 0 | ❌ TESTE ANTIGO | **DELETAR** |
| `mapa-app-clean-8270` | R$ 0 | ✅ EM USO | **MANTER** |

**PROBLEMA:**
- Apps em si não custam nada (custos vêm do Plan)
- Mas ter apps inativos polui o portal e pode confundir

**ECONOMIA:** R$ 0/mês (mas recomendo deletar para organização)

---

## 🎯 RECURSOS QUE VOCÊ PRECISA MANTER

### ✅ MANTER (Custo: R$ 46/mês)

1. **Banco de Dados:**
   - `mapa-db-clean-28031` (R$ 23.02/mês)
   - Conectado ao app em produção
   - **Ação:** Nenhuma - MANTER

2. **App Service Plan:**
   - `mapa-plan-clean` (R$ 23.96/mês)
   - Servidor onde o app roda
   - **Ação:** Nenhuma - MANTER

3. **App Service:**
   - `mapa-app-clean-8270` (R$ 0/mês)
   - Aplicação em produção
   - **Ação:** Nenhuma - MANTER

---

## ❌ RECURSOS PARA DELETAR IMEDIATAMENTE

### 🗑️ DELETAR (Economia: R$ 70/mês)

#### Bancos de Dados (3 duplicados):
1. ❌ `mapa-saas-db-1762970076` → Economiza R$ 23.07/mês
2. ❌ `mapa-saas-db-1762971490` → Economiza R$ 22.88/mês
3. ❌ `mapa-saas-db-1762971848` → Economiza R$ 22.88/mês

#### App Service Plan (1 duplicado):
4. ❌ `mapa-saas-plan` → Economiza R$ 0.10/mês

#### App Services (2 inativos):
5. ❌ `mapa-saas-app-1762967228` → Sem custo, mas limpa recursos
6. ❌ `mapa-saas-app-1762971490` → Sem custo, mas limpa recursos

---

## 📋 PASSO A PASSO PARA DELETAR

### ⚠️ IMPORTANTE: Backup Primeiro!

Antes de deletar, confirme que nada importante está nesses bancos:

```bash
# 1. Conectar em cada banco e verificar se tem dados
# Se estiverem vazios ou com dados de teste, pode deletar

# 2. Verificar connection strings do app em produção
# Certifique-se que usa: mapa-db-clean-28031
```

### 🔧 Como Deletar no Portal Azure

#### OPÇÃO 1: Portal Web (Recomendado)

1. **Acesse:** https://portal.azure.com
2. **Navegue:** "Recursos" ou "Resource Groups"
3. **Para cada recurso a deletar:**
   - Clique no recurso
   - Botão "Delete" no topo
   - Digite o nome para confirmar
   - Clique "Delete"

#### OPÇÃO 2: Azure CLI (Mais rápido)

```bash
# 1. Login
az login

# 2. Listar resource group
az group list --output table

# 3. Deletar bancos de dados (CUIDADO: IRREVERSÍVEL!)
az postgres server delete --name mapa-saas-db-1762970076 --resource-group SEU_RESOURCE_GROUP --yes
az postgres server delete --name mapa-saas-db-1762971490 --resource-group SEU_RESOURCE_GROUP --yes
az postgres server delete --name mapa-saas-db-1762971848 --resource-group SEU_RESOURCE_GROUP --yes

# 4. Deletar app services antigos
az webapp delete --name mapa-saas-app-1762967228 --resource-group SEU_RESOURCE_GROUP
az webapp delete --name mapa-saas-app-1762971490 --resource-group SEU_RESOURCE_GROUP

# 5. Deletar app service plan antigo
az appservice plan delete --name mapa-saas-plan --resource-group SEU_RESOURCE_GROUP --yes
```

---

## 💰 ECONOMIA TOTAL

### Antes das Otimizações:
```
Bancos duplicados:     R$ 68.83/mês
Plan duplicado:        R$  0.10/mês
App Service Plan:      R$ 23.96/mês
Banco em uso:          R$ 23.02/mês
─────────────────────────────────
TOTAL:                 R$ 115.91/mês
```

### Depois de Deletar Duplicados:
```
App Service Plan:      R$ 23.96/mês
Banco em uso:          R$ 23.02/mês
─────────────────────────────────
TOTAL:                 R$ 46.98/mês
```

### Depois de Deletar + Otimizações de Código:
```
App Service Plan:      R$ 23.96/mês  (pode reduzir tier depois)
Banco em uso:          R$ 10-15/mês  (com otimizações)
─────────────────────────────────
TOTAL:                 R$ 33-38/mês
```

---

## 🎯 ECONOMIA FINAL

| Ação | Economia Mensal | Economia Anual |
|------|----------------|----------------|
| **1. Deletar recursos duplicados** | R$ 68.93 | R$ 827.16 |
| **2. Otimizações de código (já feitas)** | R$ 12-15 | R$ 144-180 |
| **3. Reduzir tier do DB (após monitorar)** | R$ 5-8 | R$ 60-96 |
| **TOTAL** | **R$ 85-91** | **R$ 1.031-1.103** |

De **R$ 116/mês → R$ 25-30/mês** (economia de **74-80%**)

---

## ⚠️ CHECKLIST ANTES DE DELETAR

Marque cada item antes de deletar:

- [ ] **Backup completo do banco em produção** (`mapa-db-clean-28031`)
- [ ] **Confirmar que app usa mapa-db-clean-28031** (ver connection string)
- [ ] **Verificar que outros 3 bancos NÃO têm dados importantes**
- [ ] **Anotar nomes dos recursos para deletar**
- [ ] **Criar snapshot/backup dos bancos antes de deletar** (precaução)
- [ ] **Deletar um por vez e testar app entre cada deleção**

---

## 🔍 COMO IDENTIFICAR O BANCO EM USO

### Verificar Connection String do App:

1. **Portal Azure:**
   - Vá em `mapa-app-clean-8270`
   - Configuration → Application Settings
   - Procure `DATABASE_URL`
   - Verifique qual banco está na URL

2. **Azure CLI:**
```bash
az webapp config appsettings list \
  --name mapa-app-clean-8270 \
  --resource-group SEU_RESOURCE_GROUP \
  --query "[?name=='DATABASE_URL'].value" \
  --output tsv
```

A connection string vai mostrar algo como:
```
postgresql://user@mapa-db-clean-28031:password@mapa-db-clean-28031.postgres.database.azure.com:5432/dbname
                  ^^^^^^^^^^^^^^^^^^^^
                  Este é o banco em uso!
```

---

## 🚨 ATENÇÃO: Por que isso aconteceu?

Esses recursos duplicados provavelmente vieram de:

1. **Testes de deployment** - Criou novos recursos para testar
2. **Falhas de deploy** - Deployment falhou, criou novo recurso
3. **Múltiplas tentativas** - Tentou várias vezes e não limpou
4. **Falta de cleanup** - Não deletou recursos antigos após migrar

**DICA:** Sempre delete recursos de teste após finalizar!

---

## 📞 SUPORTE

Se tiver dúvida sobre qual recurso está em uso:
1. Pare o app production
2. Teste conectividade de cada banco
3. O que conectar = banco em uso
4. Delete os outros

**OU**

Pergunte à equipe que fez o deploy original qual é o banco correto.

---

**AÇÃO RECOMENDADA:** Delete os 3 bancos duplicados HOJE para economizar R$ 68.83/mês!
