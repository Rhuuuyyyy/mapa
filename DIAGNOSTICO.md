# 🔧 Diagnóstico e Correção Final - MAPA SaaS

## Problema Identificado

A aplicação estava falhando ao iniciar no Azure devido a um erro de validação do Pydantic:

```
pydantic_settings.sources.SettingsError: error parsing value for field "allowed_origins"
gunicorn.errors.HaltServer: Worker failed to boot. Exit code 3
```

### Causa Raiz

O campo `allowed_origins` em `app/config.py` estava definido como `List[str]`, mas o Azure CLI não conseguia configurar um array JSON corretamente devido a problemas de escaping do Bash.

## Soluções Implementadas

### 1. Modificação do config.py ✅

**Arquivo:** `app/config.py`

**Mudança:** O campo `allowed_origins` agora aceita string OU lista:

```python
# ANTES (causava erro)
allowed_origins: List[str] = ["*"]

# DEPOIS (flexível)
allowed_origins: Union[str, List[str]] = "*"

@field_validator("allowed_origins", mode="before")
@classmethod
def parse_allowed_origins(cls, v):
    """Converte string para lista automaticamente"""
    if isinstance(v, str):
        if v.strip() == "*":
            return ["*"]
        if "," in v:
            return [origin.strip() for origin in v.split(",")]
        return [v.strip()]
    return v if isinstance(v, list) else ["*"]
```

**Benefícios:**
- ✅ Aceita `ALLOWED_ORIGINS="*"` (string simples)
- ✅ Aceita `ALLOWED_ORIGINS="url1,url2,url3"` (CSV)
- ✅ Aceita lista JSON se necessário
- ✅ Sem problemas de escaping no Bash

### 2. Correção de Terminações de Linha ✅

**Problema:** Todos os scripts `.sh` tinham terminações CRLF (Windows) causando erro:
```
/bin/bash^M: interpretador incorreto
```

**Solução:** Convertidos todos para LF (Unix):
```bash
sed -i 's/\r$//' scripts/*.sh startup.sh
```

**Arquivos corrigidos:**
- `scripts/azure-setup.sh`
- `scripts/azure-deploy.sh`
- `scripts/azure-logs.sh`
- `scripts/azure-redeploy.sh`
- `scripts/azure-fix-final.sh`
- `startup.sh`

### 3. Script de Correção Automática ✅

**Arquivo:** `scripts/azure-fix-final.sh`

**O que faz:**

1. **Verifica ALLOWED_ORIGINS** - Configura como `"*"` se não estiver setado
2. **Valida variáveis obrigatórias** - Verifica DATABASE_URL, SECRET_KEY, etc
3. **Faz deploy do código corrigido** - Envia novo config.py para Azure
4. **Reinicia aplicação** - Força reload com novo código
5. **Aguarda startup** - Espera 30s para app inicializar
6. **Testa health endpoint** - Faz 5 tentativas de verificação
7. **Mostra diagnóstico** - Logs e instruções baseadas no resultado

## Como Usar

Execute o script de correção definitiva:

```bash
./scripts/azure-fix-final.sh
```

O script é **idempotente** - você pode executá-lo múltiplas vezes sem problemas.

## Configurações Aplicadas

### Variáveis de Ambiente no Azure

```bash
ALLOWED_ORIGINS="*"                    # Permite todas origens (dev)
DATABASE_URL="postgresql://..."        # Conexão PostgreSQL
SECRET_KEY="..."                       # Chave JWT
ALGORITHM="HS256"                      # Algoritmo JWT
ACCESS_TOKEN_EXPIRE_MINUTES="30"       # Expiração token
DEBUG="False"                          # Modo produção
WEBSITES_PORT="8000"                   # Porta FastAPI
```

### Para Produção

Altere ALLOWED_ORIGINS para URLs específicas:

```bash
# Opção 1: Única origem
az webapp config appsettings set \
    -g mapa-saas-clean \
    -n mapa-app-clean-8270 \
    --settings ALLOWED_ORIGINS="https://mapa-app-clean-8270.azurewebsites.net"

# Opção 2: Múltiplas origens (CSV - sem espaços!)
az webapp config appsettings set \
    -g mapa-saas-clean \
    -n mapa-app-clean-8270 \
    --settings ALLOWED_ORIGINS="https://app.exemplo.com,https://www.exemplo.com"
```

## Timeouts no Deploy

O erro `504 Gateway Timeout` durante deploy é **NORMAL** e **não indica falha**:

- Azure CLI tem timeout de ~2 minutos
- Primeiro deploy demora 3-5 minutos (instala dependências)
- O deploy **continua no background** após o timeout
- O script aguarda 30s e verifica status automaticamente

## Verificação de Sucesso

Após executar o script, você deve ver:

```
🎉 SUCESSO! Aplicação está funcionando corretamente

URLs disponíveis:
  🏠 App:        https://mapa-app-clean-8270.azurewebsites.net
  🏥 Health:     https://mapa-app-clean-8270.azurewebsites.net/health
  📚 API Docs:   https://mapa-app-clean-8270.azurewebsites.net/api/docs
  🔐 Login:      https://mapa-app-clean-8270.azurewebsites.net/login.html
```

Teste manual:
```bash
curl https://mapa-app-clean-8270.azurewebsites.net/health
# Resposta esperada: {"status":"healthy","app":"MAPA SaaS","version":"2.0.0"}
```

## Troubleshooting

### Se ainda não funcionar:

1. **Verificar logs em tempo real:**
   ```bash
   az webapp log tail -g mapa-saas-clean -n mapa-app-clean-8270
   ```

2. **Verificar última exceção:**
   ```bash
   az webapp log download -g mapa-saas-clean -n mapa-app-clean-8270
   ```

3. **Verificar todas as configurações:**
   ```bash
   az webapp config appsettings list -g mapa-saas-clean -n mapa-app-clean-8270 --output table
   ```

4. **SSH no container (debugging avançado):**
   ```bash
   az webapp ssh -g mapa-saas-clean -n mapa-app-clean-8270
   ```

5. **Testar localmente:**
   ```bash
   # Configurar .env igual ao Azure
   cp .env.example .env
   # Editar DATABASE_URL, SECRET_KEY, etc

   # Rodar localmente
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

## Commits Realizados

1. `6bd3633` - fix: Allow ALLOWED_ORIGINS as comma-separated string
2. `c06bd5c` - docs: Add azure-redeploy script and ALLOWED_ORIGINS troubleshooting
3. `d4d0a5a` - fix: Converter azure-redeploy.sh para terminações Unix
4. `4b82363` - fix: Converter todos scripts shell para terminações Unix
5. `036670d` - fix: Corrigir nome do App Service no azure-redeploy.sh

## Próximos Passos

Após app funcionando:

1. **Criar usuário admin:**
   ```bash
   curl -X POST https://mapa-app-clean-8270.azurewebsites.net/api/admin/users \
     -H 'Content-Type: application/json' \
     -d '{"username":"admin","email":"admin@mapa.com","password":"SuaSenhaForte123!","is_admin":true}'
   ```

2. **Fazer login:**
   - Acesse: https://mapa-app-clean-8270.azurewebsites.net/login.html
   - Use as credenciais criadas

3. **Configurar CORS para produção** (remover `*`)

4. **Habilitar HTTPS apenas** (redirecionamento automático)

5. **Configurar domínio customizado** (opcional)

6. **Configurar Application Insights** para monitoramento

7. **Configurar backup automático** do PostgreSQL
