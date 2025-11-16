# 🚨 STATUS ATUAL - MAPA SaaS Azure Deploy

**Data**: 2025-11-16 05:05 UTC
**Status**: 🟡 Deploy realizado, app não inicia completamente

---

## ✅ O QUE JÁ FUNCIONA

1. ✅ GitHub Actions configurado e funcionando
2. ✅ Build com Oryx completado com sucesso
3. ✅ Dependências instaladas (`antenv/` criado)
4. ✅ Deploy para Azure bem-sucedido
5. ✅ Gunicorn inicia (porta 8000)
6. ✅ Container não está crashando

## ❌ PROBLEMA ATUAL

- **HTTP 503** - Application Error
- App inicia mas não responde corretamente
- Logs de aplicação não aparecem no Fluxo de log

## 🔍 EVIDÊNCIAS DOS LOGS

```
[2025-11-16 04:46:54 +0000] [2119] [INFO] Starting gunicorn 21.2.0
[2025-11-16 04:46:54 +0000] [2119] [INFO] Listening at: http://0.0.0.0:8000 (2119)
[2025-11-16 04:46:54 +0000] [2119] [INFO] Using worker: sync
[2025-11-16 04:46:54 +0000] [2123] [INFO] Booting worker with pid: 2123
```

**Problema identificado**:
- Worker type: `sync` (deveria ser `uvicorn.workers.UvicornWorker`)
- Isso significa que o comando de inicialização NÃO está sendo aplicado

---

## 🎯 CAUSA RAIZ PROVÁVEL

O **Comando de inicialização** no Azure não está sendo executado. O Oryx está gerando seu próprio script de startup automaticamente e ignorando nossa configuração.

### Por que isso acontece?

Quando o Oryx detecta um app Python, ele:
1. Gera automaticamente `/opt/startup/startup.sh`
2. Esse script sobrescreve o comando customizado
3. O Oryx tenta adivinhar o comando (e erra)

---

## 🔧 SOLUÇÕES POSSÍVEIS

### Solução 1: Criar arquivo de configuração Oryx ⭐⭐⭐⭐⭐

Criar arquivo que diz ao Oryx como iniciar o app:

**Arquivo**: `oryx.config.json` (na raiz do projeto)

```json
{
  "run": {
    "appType": "python",
    "startupCommand": "gunicorn app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --timeout 120 --access-logfile - --error-logfile - --log-level info"
  }
}
```

### Solução 2: Usar variável de ambiente WEBSITE_STARTUP_COMMAND ⭐⭐⭐⭐

Configurar no Azure Portal:
- **Configuração** → **Configurações do aplicativo**
- Adicionar: `WEBSITE_STARTUP_COMMAND`
- Valor: `gunicorn app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000`

### Solução 3: Modificar o workflow GitHub Actions ⭐⭐⭐⭐⭐

Editar `.github/workflows/main_mapa-app-clean-8270.yml` para incluir:

```yaml
- name: Configure startup command
  run: |
    az webapp config set \
      --resource-group mapa-saas-clean \
      --name mapa-app-clean-8270 \
      --startup-file "gunicorn app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000"
```

### Solução 4: Criar startup.sh na raiz do projeto ⭐⭐⭐

**Arquivo**: `startup.sh` (raiz do projeto, não em scripts/)

```bash
#!/bin/bash
set -e
source antenv/bin/activate
cd /home/site/wwwroot
exec gunicorn app.main:app \
    --workers 2 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
```

---

## 📋 PLANO DE AÇÃO RECOMENDADO

### Opção A: Mais Rápida (5 minutos) ⭐⭐⭐⭐⭐

1. **Criar variável de ambiente no Azure**:
   - Portal → Configurações do aplicativo
   - Nome: `WEBSITE_STARTUP_COMMAND`
   - Valor: `gunicorn app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000`
   - Salvar e Reiniciar

2. **Aguardar 1 minuto e testar**

### Opção B: Mais Profissional (10 minutos) ⭐⭐⭐⭐⭐

1. **Criar `oryx.config.json` no repositório**
2. **Commit e push**
3. **GitHub Action roda automaticamente**
4. **App inicia corretamente**

---

## 🧪 COMO TESTAR SE FUNCIONOU

```bash
# Deve retornar JSON, não HTML de erro
curl https://mapa-app-clean-8270.azurewebsites.net/health

# Resposta esperada:
{"status":"healthy","app":"MAPA SaaS","version":"2.0.0"}
```

---

## 📊 CHECKLIST DE CONFIGURAÇÕES AZURE

- [x] App Service criado
- [x] PostgreSQL configurado
- [x] Variáveis de ambiente configuradas (DATABASE_URL, SECRET_KEY, etc.)
- [x] GitHub Actions funcionando
- [x] Deploy bem-sucedido
- [x] Build Oryx completado
- [x] Dependências instaladas
- [ ] **Startup command correto aplicado** ❌ PROBLEMA ATUAL
- [ ] App respondendo ao /health ❌ PROBLEMA ATUAL

---

## 🔍 DIAGNÓSTICOS EXECUTADOS

1. ✅ Código Python validado (imports funcionam localmente)
2. ✅ requirements.txt completo
3. ✅ runtime.txt correto (python-3.11)
4. ✅ .deployment configurado
5. ✅ GitHub Actions executando
6. ✅ Build Oryx bem-sucedido
7. ✅ Gunicorn iniciando
8. ❌ Worker type incorreto (sync em vez de uvicorn)
9. ❌ Comando de inicialização não aplicado

---

## 💡 PRÓXIMO PASSO IMEDIATO

**RECOMENDAÇÃO**: Usar **Opção A** (variável de ambiente) por ser mais rápida.

Vá no Azure Portal agora:
1. App Service → Configuração → Configurações do aplicativo
2. **+ Nova configuração de aplicativo**
3. Nome: `WEBSITE_STARTUP_COMMAND`
4. Valor: `gunicorn app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --timeout 120`
5. OK → Salvar → Reiniciar

Aguarde 1 minuto e teste o `/health`.

---

**Se não funcionar**, vamos para **Opção B** (criar oryx.config.json).

---

## 📝 HISTÓRICO DE TENTATIVAS

1. ❌ Deploy via `az webapp deploy --type zip` - Não acionou Oryx
2. ❌ Configurar `SCM_DO_BUILD_DURING_DEPLOYMENT` - Não funciona com ZIP deploy
3. ✅ GitHub Actions via Deployment Center - Funcionou!
4. ✅ Build Oryx completado - Sucesso!
5. ❌ Startup command via "Configurações gerais" - Ignorado pelo Oryx
6. 🟡 **ATUAL**: Configurar via variável de ambiente ou oryx.config.json

---

**Última atualização**: 2025-11-16 05:05 UTC
