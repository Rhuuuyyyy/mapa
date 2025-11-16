# 🔐 Como Configurar o GitHub Action (Passo a Passo)

## ⚠️ O erro foi provavelmente: Secret não configurado

O GitHub Action precisa de credenciais do Azure para fazer deploy. Vou te guiar passo a passo.

---

## 📋 Passo a Passo Completo

### 1️⃣ Obter Credenciais do Azure

No seu computador **onde você tem Azure CLI instalado**, execute:

```bash
az webapp deployment list-publishing-profiles \
  --resource-group mapa-saas-clean \
  --name mapa-app-clean-8270 \
  --xml
```

**Resultado esperado:** Um XML longo que começa com `<publishData>`. Exemplo:

```xml
<publishData>
  <publishProfile profileName="mapa-app-clean-8270 - Web Deploy"
    publishMethod="MSDeploy"
    publishUrl="mapa-app-clean-8270.scm.azurewebsites.net:443"
    msdeploySite="mapa-app-clean-8270"
    userName="$mapa-app-clean-8270"
    userPWD="..."
    ...
  />
  ...
</publishData>
```

**COPIE TODO ESSE XML!** (Ctrl+A, Ctrl+C no terminal)

---

### 2️⃣ Adicionar Secret no GitHub

1. **Acesse:** https://github.com/Rhuuuyyyy/mapa/settings/secrets/actions

2. **Clique em:** `New repository secret` (botão verde no canto superior direito)

3. **Preencha:**
   - **Name:** `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Value:** Cole TODO o XML que você copiou no passo 1

4. **Clique em:** `Add secret` (botão verde)

5. **Verifique:** O secret `AZURE_WEBAPP_PUBLISH_PROFILE` deve aparecer na lista

---

### 3️⃣ Testar o GitHub Action

Agora você tem **2 opções** para testar:

#### Opção A: Executar Manualmente (Recomendado para testar)

1. Acesse: https://github.com/Rhuuuyyyy/mapa/actions/workflows/azure-deploy.yml

2. Clique no botão **"Run workflow"** (lado direito)

3. Selecione o branch: `claude/fix-azure-deploy-01Cc9PZ4YjnrjJ6NSDJtnp8o`

4. Clique em **"Run workflow"** (botão verde)

5. Aguarde alguns minutos e veja o progresso

#### Opção B: Fazer Merge para Main (Deploy Automático)

```bash
git checkout main
git merge claude/fix-azure-deploy-01Cc9PZ4YjnrjJ6NSDJtnp8o
git push origin main
```

O deploy vai acontecer automaticamente.

---

## ✅ Como Saber se Funcionou

### 1. Verifique o GitHub Actions

- Acesse: https://github.com/Rhuuuyyyy/mapa/actions
- O workflow deve mostrar ✅ verde
- Clique no workflow para ver os logs

### 2. Teste a Aplicação

Aguarde **5 minutos** após o deploy completar (primeira instalação demora), depois teste:

```bash
curl https://mapa-app-clean-8270.azurewebsites.net/health
```

**Resultado esperado:**
```json
{
  "status": "healthy",
  "app": "MAPA SaaS",
  "version": "2.0.0"
}
```

---

## 🐛 Troubleshooting

### Se o workflow ainda falhar:

**1. Verifique se o secret foi adicionado:**
- https://github.com/Rhuuuyyyy/mapa/settings/secrets/actions
- Deve ter: `AZURE_WEBAPP_PUBLISH_PROFILE`

**2. Verifique as permissões do GitHub Actions:**
- https://github.com/Rhuuuyyyy/mapa/settings/actions
- Em "Workflow permissions", selecione: "Read and write permissions"
- Clique em "Save"

**3. Verifique os logs do workflow:**
- https://github.com/Rhuuuyyyy/mapa/actions
- Clique no workflow que falhou
- Expanda cada step para ver o erro

**4. Agora o workflow mostra erros claros:**
- Se o secret estiver faltando, vai mostrar exatamente o que fazer
- Se houver outro erro, me mostre a mensagem

---

## 🚀 Alternativa: Deploy Manual (SEM GitHub Actions)

Se você quiser fazer deploy AGORA sem configurar GitHub Actions:

```bash
./deploy-manual.sh
```

Esse script pede as credenciais interativamente e faz deploy direto via curl.

---

## 📊 Resumo

| Método | Precisa Configurar | Automático | Dificuldade |
|--------|-------------------|------------|-------------|
| **GitHub Actions** | ✅ Sim (1 vez) | ✅ Sim | ⭐⭐ Médio |
| **deploy-manual.sh** | ❌ Não | ❌ Não | ⭐ Fácil |
| **azure-deploy-with-build.sh** | ❌ Não | ❌ Não | ⭐ Fácil |

---

## ❓ Dúvidas?

**Não tem Azure CLI instalado no PC?**
- Use o `./deploy-manual.sh` - ele não precisa do Azure CLI

**Não quer configurar GitHub Actions agora?**
- Use o `./deploy-manual.sh` para fazer deploy manualmente

**Quer deploy automático a cada push?**
- Configure o GitHub Actions seguindo este guia

---

**Me avise quando configurar o secret e testar novamente!** 🚀
