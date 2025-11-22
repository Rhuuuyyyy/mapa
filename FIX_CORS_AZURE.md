# CORREÇÃO RÁPIDA: Erro de CORS

## Problema
```
Access to XMLHttpRequest at 'https://mapa-app-clean-8270.azurewebsites.net/api/user/generate-report'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

## Causa
A variável de ambiente `ALLOWED_ORIGINS` não está configurada no Azure App Service.

## Solução Rápida (Azure Portal)

### Opção 1: Via Azure Portal (2 minutos)

1. Acesse: https://portal.azure.com
2. Procure por: **mapa-app-clean-8270**
3. Clique em **Configuration** (no menu lateral esquerdo)
4. Clique em **New application setting**
5. Adicione:
   ```
   Name: ALLOWED_ORIGINS
   Value: http://localhost:3000,https://mapa-app-clean-8270.azurewebsites.net
   ```
6. Clique em **OK**
7. Clique em **Save** (no topo)
8. Aguarde 30 segundos para o app reiniciar

### Opção 2: Via Azure CLI (1 minuto)

```bash
az webapp config appsettings set \
  --name mapa-app-clean-8270 \
  --resource-group mapa-saas-clean \
  --settings ALLOWED_ORIGINS="http://localhost:3000,https://mapa-app-clean-8270.azurewebsites.net"
```

### Opção 3: Temporário - Permitir Tudo (NÃO RECOMENDADO PARA PRODUÇÃO)

Se quiser testar rapidamente:
```
Name: ALLOWED_ORIGINS
Value: *
```

**ATENÇÃO:** Isso permite qualquer origem. Use só para testes!

## Como Verificar se Funcionou

1. Aguarde 30 segundos após salvar
2. Abra o console do navegador
3. Tente gerar relatório novamente
4. Erro de CORS deve desaparecer

## Variáveis de Ambiente Recomendadas (Azure)

Configure todas essas no Azure App Service → Configuration:

```env
# Banco de dados (já deve estar configurado)
DATABASE_URL=postgresql://mapaadmin:senha@mapa-db-clean-XXXX.postgres.database.azure.com:5432/mapa_db?sslmode=require

# Segurança (CRÍTICO - gerar nova chave)
SECRET_KEY=<gerar com: python -c "import secrets; print(secrets.token_urlsafe(32))">

# CORS (este que está faltando!)
ALLOWED_ORIGINS=http://localhost:3000,https://mapa-app-clean-8270.azurewebsites.net

# Upload
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=uploads

# Debug (False em produção)
DEBUG=False

# JWT
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Por que Isso Aconteceu?

O código já tem CORS configurado corretamente:
- `app/config.py` linha 51: Sempre inclui `localhost:3000` por padrão
- `app/main.py` linha 44-50: CORS middleware configurado

Mas o Azure não conhece as variáveis de ambiente do `.env` local. Precisa configurar manualmente.

## Solução Permanente

Adicione ao seu workflow de deploy (`.github/workflows/azure-deploy.yml`):

```yaml
- name: Set environment variables
  run: |
    az webapp config appsettings set \
      --name mapa-app-clean-8270 \
      --resource-group mapa-saas-clean \
      --settings \
        ALLOWED_ORIGINS="http://localhost:3000,https://mapa-app-clean-8270.azurewebsites.net" \
        DEBUG="False" \
        ALGORITHM="HS256" \
        ACCESS_TOKEN_EXPIRE_MINUTES="30"
```

Ou crie arquivo de configuração no repositório: `azure-env-vars.json`
```json
{
  "ALLOWED_ORIGINS": "http://localhost:3000,https://mapa-app-clean-8270.azurewebsites.net",
  "DEBUG": "False",
  "ALGORITHM": "HS256",
  "ACCESS_TOKEN_EXPIRE_MINUTES": "30"
}
```

E no deploy:
```bash
az webapp config appsettings set \
  --name mapa-app-clean-8270 \
  --resource-group mapa-saas-clean \
  --settings @azure-env-vars.json
```

## Teste Final

Depois de configurar:

```bash
# Testar se CORS está funcionando
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     https://mapa-app-clean-8270.azurewebsites.net/api/user/generate-report

# Deve retornar headers:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Methods: POST, GET, OPTIONS, ...
```

## Fallback: Se Ainda Não Funcionar

Verifique se o app reiniciou:
```bash
az webapp restart --name mapa-app-clean-8270 --resource-group mapa-saas-clean
```

Verifique logs:
```bash
az webapp log tail --name mapa-app-clean-8270 --resource-group mapa-saas-clean
```

Ou no Azure Portal:
**App Service → Log stream**

Procure por linha que diz:
```
Starting MAPA SaaS v2.0.0
```

E verifique os allowed_origins que foram carregados.
