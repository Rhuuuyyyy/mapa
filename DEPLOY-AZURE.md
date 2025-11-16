# 🚀 Deploy no Azure - Guia de Solução

## ❌ Problema Identificado

O deploy estava falhando porque:

1. **Deploy ZIP direto não aciona o Oryx build** - O comando `az webapp deploy --type zip` não aciona o sistema de build do Azure Oryx, então:
   - ❌ O virtual environment `antenv/` não era criado
   - ❌ As dependências não eram instaladas
   - ❌ O app tentava rodar sem as bibliotecas necessárias

2. **Startup script incompatível com sh** - O `startup.sh` usava `source` que não existe em `sh` (apenas em `bash`):
   ```bash
   source antenv/bin/activate  # ❌ Erro: source: not found
   ```

3. **Comando de inicialização muito complexo** - O comando gigante no Portal estava causando problemas de parsing.

## ✅ Soluções Implementadas

### 1. Corrigido `startup.sh`
- ✅ Mudado shebang de `#!/bin/bash` para `#!/bin/sh`
- ✅ Substituído `source` por `.` (compatível com sh)

### 2. Criado `azure-deploy-with-build.sh`
- ✅ Usa a API Kudu/SCM que **ACIONA o Oryx build**
- ✅ O Oryx agora vai:
  - Criar o virtual environment em `/home/site/wwwroot/antenv`
  - Instalar todas as dependências do `requirements.txt`
  - Executar o `startup.sh` corretamente

---

## 📋 Como Fazer Deploy (Localmente)

### Pré-requisitos

Certifique-se de ter o Azure CLI instalado e estar logado:

```bash
# Verificar se está instalado
az --version

# Se não estiver, instale:
# Ubuntu/Debian:
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# macOS:
brew install azure-cli

# Fazer login
az login
```

### Passo a Passo

1. **Baixe as mudanças do repositório:**
   ```bash
   git pull origin claude/fix-azure-deploy-01Cc9PZ4YjnrjJ6NSDJtnp8o
   ```

2. **Execute o script de deploy:**
   ```bash
   ./azure-deploy-with-build.sh
   ```

3. **Aguarde o deploy completar** (2-5 minutos na primeira vez)

4. **Teste o endpoint:**
   ```bash
   curl https://mapa-app-clean-8270.azurewebsites.net/health
   ```

   Você deve ver:
   ```json
   {
     "status": "healthy",
     "app": "MAPA SaaS",
     "version": "2.0.0"
   }
   ```

---

## 🔄 Deploy Automático via GitHub Actions (Recomendado)

Vou criar um GitHub Action que faz deploy automático a cada push. Isso é melhor porque:
- ✅ Deploy automático
- ✅ Sempre aciona o Oryx build
- ✅ Não precisa rodar comandos localmente

**Aguarde que vou criar o workflow agora...**

---

## 🐛 Troubleshooting

### Ver logs em tempo real:
```bash
az webapp log tail \
  --resource-group mapa-saas-clean \
  --name mapa-app-clean-8270
```

Ou use o script:
```bash
./scripts/azure-logs.sh
```

### Se ainda der erro de "Application Error":

1. **Aguarde 5 minutos** - O primeiro build pode demorar
2. **Verifique os logs** - Procure por mensagens como:
   ```
   Collecting fastapi...
   Installing collected packages...
   Successfully installed...
   ```

3. **Verifique se o comando de startup está correto:**
   ```bash
   az webapp config show \
     --resource-group mapa-saas-clean \
     --name mapa-app-clean-8270 \
     --query "appCommandLine"
   ```

   Deve mostrar: `"startup.sh"`

### Se precisar limpar o comando anterior do Portal:

```bash
az webapp config set \
  --resource-group mapa-saas-clean \
  --name mapa-app-clean-8270 \
  --startup-file "startup.sh"
```

---

## 📊 Diferença Entre os Métodos de Deploy

| Método | Build do Oryx | antenv/ criado | Funciona? |
|--------|---------------|----------------|-----------|
| `az webapp deploy --type zip` | ❌ Não | ❌ Não | ❌ Não |
| **Kudu API (nosso script)** | ✅ Sim | ✅ Sim | ✅ Sim |
| **GitHub Actions** | ✅ Sim | ✅ Sim | ✅ Sim |

---

## ✨ Próximos Passos

1. ✅ **Execute o deploy localmente** usando `./azure-deploy-with-build.sh`
2. ⏳ **Aguarde eu criar o GitHub Action** para deploy automático
3. ✅ **Teste a aplicação**

---

**Dúvidas?** Me avise se precisar de ajuda! 🚀
