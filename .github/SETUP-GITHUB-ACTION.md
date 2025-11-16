# ⚙️ Configurar GitHub Action para Deploy Automático

## 📋 Pré-requisitos

1. Repositório no GitHub
2. Azure App Service já criado
3. Azure CLI instalado localmente (para obter o publish profile)

---

## 🔐 Passo 1: Obter o Publish Profile do Azure

Execute este comando localmente (onde você tem o Azure CLI):

```bash
az webapp deployment list-publishing-profiles \
  --resource-group mapa-saas-clean \
  --name mapa-app-clean-8270 \
  --xml > publish-profile.xml
```

Isso vai criar um arquivo `publish-profile.xml` com as credenciais.

---

## 🔑 Passo 2: Adicionar Secret no GitHub

1. **Abra o conteúdo do arquivo:**
   ```bash
   cat publish-profile.xml
   ```

2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)

3. **Vá para o GitHub:**
   - Acesse: https://github.com/Rhuuuyyyy/mapa/settings/secrets/actions
   - Clique em **"New repository secret"**
   - Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Value: Cole o conteúdo do arquivo XML
   - Clique em **"Add secret"**

4. **Delete o arquivo local** (ele contém credenciais!):
   ```bash
   rm publish-profile.xml
   ```

---

## ✅ Passo 3: Testar o Deploy Automático

Agora, toda vez que você fizer push para `main` ou `master`, o deploy será automático!

### Opção 1: Fazer merge do branch atual

```bash
git checkout main  # ou master
git merge claude/fix-azure-deploy-01Cc9PZ4YjnrjJ6NSDJtnp8o
git push origin main
```

### Opção 2: Executar manualmente

1. Vá para: https://github.com/Rhuuuyyyy/mapa/actions
2. Clique em **"Deploy to Azure App Service"**
3. Clique em **"Run workflow"**
4. Selecione o branch e clique em **"Run workflow"**

---

## 📊 Verificar o Deploy

1. **Acompanhe a execução:**
   - Vá para: https://github.com/Rhuuuyyyy/mapa/actions
   - Clique no workflow em execução
   - Acompanhe os logs em tempo real

2. **Teste a aplicação:**
   ```bash
   # Aguarde 5 minutos após o deploy completar
   curl https://mapa-app-clean-8270.azurewebsites.net/health
   ```

   Deve retornar:
   ```json
   {
     "status": "healthy",
     "app": "MAPA SaaS",
     "version": "2.0.0"
   }
   ```

---

## 🎯 Como Funciona

O GitHub Action:

1. ✅ Faz checkout do código
2. ✅ Cria um pacote ZIP
3. ✅ Faz deploy para o Azure usando o publish profile
4. ✅ O Azure **automaticamente aciona o Oryx build**:
   - Cria o virtual environment `antenv/`
   - Instala as dependências do `requirements.txt`
   - Executa o `startup.sh`

---

## 🐛 Troubleshooting

### Secret não foi adicionado corretamente?

Verifique em: https://github.com/Rhuuuyyyy/mapa/settings/secrets/actions

O secret `AZURE_WEBAPP_PUBLISH_PROFILE` deve estar listado.

### Deploy falhou?

1. Verifique os logs no GitHub Actions
2. Verifique os logs do Azure:
   ```bash
   az webapp log tail \
     --resource-group mapa-saas-clean \
     --name mapa-app-clean-8270
   ```

### Aplicação ainda mostrando erro?

- Aguarde 5 minutos após o deploy
- O Oryx precisa tempo para instalar todas as dependências na primeira vez
- Verifique os logs do Azure para ver o progresso

---

## ✨ Pronto!

Agora você tem deploy automático! 🎉

Toda vez que você fizer push para `main`/`master`, o app será automaticamente deployado no Azure.

**Dúvidas?** Me avise! 🚀
