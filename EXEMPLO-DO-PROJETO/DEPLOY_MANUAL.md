# 🚀 Relatório de Implantação e Manual de Manutenção - MAPA SaaS

**Sistema de Automação de Relatórios Trimestrais do MAPA**

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Azure](https://img.shields.io/badge/Azure-App%20Service-blue.svg)](https://azure.microsoft.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue.svg)](https://www.postgresql.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)

**Versão:** 1.0.0  
**Última Atualização:** 12 de Janeiro de 2025  
**Responsável:** Rhyan Rocha (rhyan.hdr@gmail.com)

---

## 📋 Índice

- [I. Informações Críticas da Infraestrutura](#i-informações-críticas-da-infraestrutura)
- [II. Gerenciamento e Monitoramento de Custos](#ii-gerenciamento-e-monitoramento-de-custos)
- [III. Manutenção e Atualização da Aplicação](#iii-manutenção-e-atualização-da-aplicação)
- [IV. Gerenciamento do Banco de Dados](#iv-gerenciamento-do-banco-de-dados)
- [V. Logs e Diagnóstico de Falhas](#v-logs-e-diagnóstico-de-falhas)
- [VI. Configuração em Novos Computadores](#vi-configuração-em-novos-computadores)
- [VII. Backup e Recuperação](#vii-backup-e-recuperação)
- [VIII. Segurança e Boas Práticas](#viii-segurança-e-boas-práticas)
- [IX. Monitoramento e Performance](#ix-monitoramento-e-performance)
- [X. Procedimentos de Emergência](#x-procedimentos-de-emergência)

---

## I. Informações Críticas da Infraestrutura

### 🔐 Credenciais e Endpoints

**⚠️ ATENÇÃO: As informações abaixo são CONFIDENCIAIS. Trate com segurança máxima!**

#### **Recursos Azure - Geral**

| Categoria | Recurso | Valor |
|-----------|---------|-------|
| **Grupo de Recursos** | Nome | `mapa-saas-rg` |
| | Localização | `brazilsouth` (Sul do Brasil) |
| | Subscription ID | Execute: `az account show --query id -o tsv` |

#### **Web App (App Service)**

| Item | Valor |
|------|-------|
| **Nome do Web App** | `mapa-saas-app-1762971490` |
| **URL de Produção** | https://mapa-saas-app-1762971490.azurewebsites.net |
| **URL Kudu** | https://mapa-saas-app-1762971490.scm.azurewebsites.net |
| **Runtime** | `PYTHON:3.11` |
| **App Service Plan** | `mapa-saas-plan` |
| **SKU** | `B1` (Basic) - ~$13 USD/mês |

#### **Banco de Dados PostgreSQL**

| Item | Valor |
|------|-------|
| **Servidor** | `mapa-saas-db-1762971848` |
| **Host Completo** | `mapa-saas-db-1762971848.postgres.database.azure.com` |
| **Banco de Dados** | `mapa_saas` |
| **Usuário Admin** | `mapaadmin` |
| **Senha Admin** | `NovaSenha12345!` ⚠️ |
| **Porta** | `5432` |
| **SSL Mode** | `require` (Obrigatório) |
| **Versão** | PostgreSQL 14 |
| **SKU** | `Standard_B1ms` - ~$12 USD/mês |

#### **String de Conexão Completa**
```bash
DATABASE_URL="postgresql://mapaadmin:NovaSenha12345!@mapa-saas-db-1762971848.postgres.database.azure.com:5432/mapa_saas?sslmode=require"
```

#### **Variáveis de Ambiente (App Settings)**

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `DATABASE_URL` | Ver acima | String de conexão PostgreSQL |
| `SECRET_KEY` | Gerado automaticamente | Chave JWT (32+ caracteres) |
| `ALGORITHM` | `HS256` | Algoritmo de criptografia JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Tempo de expiração do token |
| `DEBUG` | `False` | ⚠️ Sempre False em produção |
| `ALLOWED_ORIGINS` | `https://mapa-saas-app-1762971490.azurewebsites.net` | CORS |
| `WEBSITES_PORT` | `8000` | Porta interna do container |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` | Build automático no deploy |

#### **Usuário Admin da Aplicação**

| Item | Valor |
|------|-------|
| **E-mail** | `rhyan.hdr@gmail.com` |
| **Senha** | Definida via `create_admin.py` |
| **Tipo** | Administrador (is_admin=true) |

### 🔗 Links Rápidos de Acesso

| Serviço | URL | Uso |
|---------|-----|-----|
| **Portal Azure** | https://portal.azure.com | Gerenciamento visual |
| **Aplicação (Produção)** | https://mapa-saas-app-1762971490.azurewebsites.net | Sistema público |
| **API Docs (Swagger)** | https://mapa-saas-app-1762971490.azurewebsites.net/docs | API interativa |
| **API Docs (ReDoc)** | https://mapa-saas-app-1762971490.azurewebsites.net/redoc | Documentação alternativa |
| **Health Check** | https://mapa-saas-app-1762971490.azurewebsites.net/health | Verificar status |
| **Kudu Console** | https://mapa-saas-app-1762971490.scm.azurewebsites.net | Console web avançado |
| **WebSSH** | https://mapa-saas-app-1762971490.scm.azurewebsites.net/webssh/host | Terminal web |
| **Log Stream** | https://mapa-saas-app-1762971490.scm.azurewebsites.net/api/logstream | Logs em tempo real |

### 📚 Documentação Oficial

- [Azure App Service](https://docs.microsoft.com/azure/app-service/)
- [Azure PostgreSQL Flexible](https://docs.microsoft.com/azure/postgresql/flexible-server/)
- [Azure CLI](https://docs.microsoft.com/cli/azure/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)