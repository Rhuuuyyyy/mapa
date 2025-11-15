# 🚀 Azure Deployment Guide - MAPA SaaS

## Pré-requisitos

1. **Azure CLI instalado e autenticado**
   ```bash
   az login
   ```

2. **Variáveis de ambiente configuradas no Azure App Service**
   - `DATABASE_URL` - String de conexão PostgreSQL
   - `SECRET_KEY` - Chave secreta para JWT (gere com: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
   - `ALLOWED_ORIGINS` - Origens permitidas para CORS (ex: `https://seu-dominio.com`)
   - `DEBUG` - `false` para produção

## 🎯 Método Recomendado: Script Automático

### Passo 1: Configurar Variáveis

Edite as variáveis no início do arquivo `deploy-azure.sh`:

```bash
RESOURCE_GROUP="mapa-saas-rg"
WEB_APP="mapa-saas-app-1762971490"
```

Ou defina como variáveis de ambiente:

```bash
export RESOURCE_GROUP="mapa-saas-rg"
export WEB_APP="mapa-saas-app-1762971490"
```

### Passo 2: Executar Deploy

```bash
./deploy-azure.sh
```

O script irá:
1. ✅ Limpar arquivos temporários
2. ✅ Criar pacote ZIP otimizado
3. ✅ Configurar Python 3.11 no Azure
4. ✅ Configurar comando de startup customizado
5. ✅ Fazer deploy da aplicação
6. ✅ Reiniciar o App Service

### Passo 3: Monitorar Logs

```bash
az webapp log tail --resource-group mapa-saas-rg --name mapa-saas-app-1762971490
```

Aguarde ver estas mensagens de sucesso:
```
🚀 Starting MAPA SaaS on Azure...
📦 Installing dependencies...
✅ Dependencies installed
⏳ Waiting for database...
✓ Database ready
📊 Setting up database...
✅ Starting application on port 8000...
```

## 🔧 Método Manual (Alternativo)

### 1. Criar Pacote ZIP

```bash
# Limpar arquivos temporários
make clean

# Criar ZIP manualmente
zip -r deploy.zip . \
  -x "*.git/*" \
  -x "*venv/*" \
  -x "*.env*" \
  -x "*uploads/*" \
  -x "*reports/*" \
  -x "*__pycache__/*"
```

### 2. Configurar Azure App Service

```bash
# Definir Python 3.11
az webapp config set \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --linux-fx-version "PYTHON|3.11"

# Definir comando de startup
az webapp config set \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --startup-file "startup-azure.sh"
```

### 3. Fazer Deploy

```bash
az webapp deploy \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --src-path deploy.zip \
  --type zip
```

### 4. Reiniciar App

```bash
az webapp restart \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490
```

## 🔍 Troubleshooting

### ❌ Erro: "uvicorn: not found"

**Causa:** Dependências não foram instaladas.

**Solução:**
1. Verifique se `requirements.txt` está no ZIP
2. Verifique se o comando de startup está configurado: `startup-azure.sh`
3. Verifique os logs de build: `https://seu-app.scm.azurewebsites.net/api/deployments`

### ❌ Erro: "Could not find build manifest"

**Causa:** Normal na primeira vez, mas indica que o build Oryx falhou.

**Solução:**
1. Use o `deploy-azure.sh` que configura o startup customizado
2. Verifique se Python 3.11 está configurado:
   ```bash
   az webapp config show --resource-group mapa-saas-rg --name mapa-saas-app-1762971490 --query linuxFxVersion
   ```

### ❌ Erro: "Database connection failed"

**Causa:** Variável `DATABASE_URL` não configurada ou PostgreSQL inacessível.

**Solução:**
```bash
# Verificar variáveis de ambiente
az webapp config appsettings list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490

# Configurar DATABASE_URL
az webapp config appsettings set \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --settings DATABASE_URL="postgresql://user:pass@host/db"
```

### ❌ App demora para iniciar ou fica "Starting"

**Causa:** Instalação de dependências na primeira execução.

**Solução:**
1. Aguarde 3-5 minutos
2. Monitore os logs: `az webapp log tail ...`
3. A partir do segundo start será muito mais rápido (dependências cacheadas)

### 🔍 Acessar Container via SSH

```bash
az webapp ssh --resource-group mapa-saas-rg --name mapa-saas-app-1762971490
```

Dentro do container, verifique:
```bash
# Verificar estrutura de arquivos
ls -la /home/site/wwwroot

# Verificar se virtual env existe
ls -la /home/site/wwwroot/antenv

# Verificar processos
ps aux | grep gunicorn

# Testar manualmente
cd /home/site/wwwroot
source antenv/bin/activate
python -c "import uvicorn; print('OK')"
```

## 📊 Variáveis de Ambiente Necessárias

Configure todas estas no Azure Portal ou via CLI:

```bash
az webapp config appsettings set \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --settings \
    DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require" \
    SECRET_KEY="sua-chave-secreta-aqui" \
    ALLOWED_ORIGINS="https://seu-dominio.com,https://www.seu-dominio.com" \
    DEBUG="false" \
    ALGORITHM="HS256" \
    ACCESS_TOKEN_EXPIRE_MINUTES="30"
```

## 🎯 Checklist de Deploy

- [ ] Azure CLI autenticado (`az login`)
- [ ] Variáveis de ambiente configuradas no Azure
- [ ] PostgreSQL database criado e acessível
- [ ] `RESOURCE_GROUP` e `WEB_APP` corretos em `deploy-azure.sh`
- [ ] Código commitado no Git
- [ ] Executar `./deploy-azure.sh`
- [ ] Aguardar 3-5 minutos para primeira inicialização
- [ ] Verificar logs: `az webapp log tail ...`
- [ ] Acessar app: `https://seu-app.azurewebsites.net`
- [ ] Criar primeiro usuário admin: SSH + `python create_admin.py`

## 📝 Notas Importantes

1. **Primeira inicialização:** Demora 3-5 minutos (instalação de dependências)
2. **Inicializações seguintes:** ~30 segundos (dependências cacheadas)
3. **Uploads e Reports:** Criados automaticamente em `/home/site/wwwroot/`
4. **Logs:** Disponíveis em tempo real via `az webapp log tail`
5. **Atualizações:** Basta executar `./deploy-azure.sh` novamente

## 🔗 Links Úteis

- **App URL:** `https://seu-app.azurewebsites.net`
- **Kudu (SCM):** `https://seu-app.scm.azurewebsites.net`
- **Deployments:** `https://seu-app.scm.azurewebsites.net/api/deployments`
- **Azure Portal:** Portal > App Services > seu-app

## 💡 Dicas de Produção

1. **Habilitar HTTPS Only:**
   ```bash
   az webapp update --resource-group mapa-saas-rg --name mapa-saas-app-1762971490 --https-only true
   ```

2. **Configurar domínio customizado:**
   ```bash
   az webapp config hostname add --resource-group mapa-saas-rg --webapp-name mapa-saas-app-1762971490 --hostname www.seudominio.com
   ```

3. **Habilitar logs de aplicação:**
   ```bash
   az webapp log config --resource-group mapa-saas-rg --name mapa-saas-app-1762971490 --application-logging filesystem --level information
   ```

4. **Escalar workers (se necessário):**
   Edite `startup-azure.sh` e altere `--workers 2` para o número desejado.

5. **Monitoramento:**
   Configure Application Insights no Azure Portal para métricas e alertas.
