# 🔒 MAPA SaaS - Documentação de Segurança

Este documento descreve as medidas de segurança implementadas no sistema MAPA SaaS.

## ✅ Implementações de Segurança Atuais

### 1. Rate Limiting (Proteção contra Brute Force)
**Status:** ✅ Implementado
**Biblioteca:** SlowAPI v0.1.9

**Descrição:**
- Limite de 5 tentativas de login por minuto por endereço IP
- Previne ataques de força bruta em contas de usuário
- Retorna HTTP 429 (Too Many Requests) quando excedido

**Arquivos:**
- `app/main.py` - Configuração do limiter
- `app/routers/admin.py` - Rate limiting no endpoint de login

**Uso:**
```python
@router.post("/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, ...):
    ...
```

---

### 2. Política de Senhas Fortes
**Status:** ✅ Implementado
**Validação:** Pydantic Field Validators

**Requisitos:**
- ✅ Mínimo 12 caracteres (máximo 128)
- ✅ Pelo menos uma letra maiúscula
- ✅ Pelo menos uma letra minúscula
- ✅ Pelo menos um número
- ✅ Pelo menos um caractere especial (!@#$%^&*...)

**Arquivos:**
- `app/schemas.py` - Validadores de senha em UserCreate e UserUpdate
- `templates/admin_dashboard.html` - Exibição de requisitos no frontend

**Mensagens de erro:**
```
"A senha deve ter no mínimo 12 caracteres"
"A senha deve conter pelo menos uma letra maiúscula"
"A senha deve conter pelo menos uma letra minúscula"
"A senha deve conter pelo menos um número"
"A senha deve conter pelo menos um caractere especial"
```

---

### 3. Validação Avançada de Upload de Arquivos
**Status:** ✅ Implementado
**Biblioteca:** python-magic v0.4.27

**Camadas de Validação:**

#### 3.1 Validação de Extensão
- Aceita apenas: `xml`, `pdf`

#### 3.2 Validação de Tipo MIME
- XML: `application/xml`, `text/xml`, `application/x-xml`
- PDF: `application/pdf`

#### 3.3 Validação de Magic Numbers (Assinatura)
- XML: Verifica início com `<?xml` ou `<`
- PDF: Verifica assinatura `%PDF-`

#### 3.4 Validação de Tamanho
- Limite máximo: **10 MB**
- Arquivo vazio: Rejeitado

#### 3.5 Validação de Estrutura
- XML: Verifica estrutura básica e tags balanceadas
- PDF: Verifica assinatura válida

#### 3.6 Sanitização de Nome de Arquivo
- Remove caracteres especiais
- Previne path traversal attacks
- Limita tamanho do nome (255 chars)
- Remove componentes de caminho

**Arquivos:**
- `app/utils/file_validator.py` - Classe FileValidator
- `app/routers/user.py` - Uso no endpoint de upload

**Exemplo de Uso:**
```python
is_valid, error_message = await FileValidator.validate_file(file, ['xml', 'pdf'])
if not is_valid:
    raise HTTPException(status_code=400, detail=error_message)
```

---

### 4. Proteção CSRF (Framework)
**Status:** ✅ Framework implementado (não ativado)
**Biblioteca:** itsdangerous v2.1.2

**Descrição:**
- Middleware de CSRF com tokens assinados
- Tokens com expiração configurável (padrão: 1 hora)
- Proteção em métodos: POST, PUT, PATCH, DELETE

**Arquivos:**
- `app/middleware/csrf.py` - Middleware CSRF

**Ativação (quando necessário):**
```python
from app.middleware.csrf import CSRFMiddleware

app.add_middleware(
    CSRFMiddleware,
    secret_key=settings.secret_key,
    exempt_paths=["/docs", "/health", "/"]
)
```

---

## ⚠️ Pendências de Segurança

### 1. JWT em httpOnly Cookies (Alta Prioridade)
**Status:** 🔴 Não implementado
**Risco Atual:** JWT em localStorage vulnerável a XSS

**Implementação Necessária:**
1. Modificar endpoint de login para setar cookie httpOnly
2. Atualizar `get_current_user()` para ler token do cookie
3. Atualizar frontend para não armazenar token manualmente
4. Configurar SameSite e Secure flags

**Código Exemplo:**
```python
response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,
    secure=True,  # HTTPS only
    samesite="lax",
    max_age=3600
)
```

---

### 2. Migrações de Banco (Alembic)
**Status:** 🔴 Não implementado
**Risco Atual:** Schema changes destrutivos em produção

**Necessidade:**
- Gerenciar evolução do schema de forma segura
- Rollback de mudanças quando necessário
- Histórico de migrations

---

### 3. Testes de Segurança
**Status:** 🔴 Não implementado

**Testes Necessários:**
- Rate limiting (verificar bloqueio após 5 tentativas)
- Validação de senha (testar todos os casos de falha)
- Upload de arquivos (MIME spoofing, magic numbers, tamanho)
- CSRF tokens (validação e expiração)
- XSS prevention

---

### 4. Logging e Monitoramento
**Status:** 🟡 Parcialmente implementado

**Necessidades:**
- Substituir `print()` por logging estruturado
- Logs de tentativas de login falhadas
- Logs de uploads rejeitados
- Alertas de segurança

---

### 5. Headers de Segurança
**Status:** 🔴 Não implementado

**Headers Recomendados:**
```python
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

---

### 6. Soft Delete
**Status:** 🔴 Não implementado

**Necessidade:**
- Evitar perda acidental de dados
- Implementar campo `deleted_at`
- Filtrar registros deletados nas queries

---

## 📊 Scorecard de Segurança

| Categoria | Status | Prioridade |
|-----------|--------|------------|
| Rate Limiting | ✅ Implementado | Alta |
| Senhas Fortes | ✅ Implementado | Alta |
| Validação Upload | ✅ Implementado | Alta |
| CSRF Protection | 🟡 Framework pronto | Média |
| JWT httpOnly Cookies | 🔴 Pendente | **Alta** |
| Database Migrations | 🔴 Pendente | Alta |
| Testes Segurança | 🔴 Pendente | Média |
| Logging | 🟡 Parcial | Média |
| Security Headers | 🔴 Pendente | Média |
| Soft Delete | 🔴 Pendente | Baixa |

**Legenda:**
- ✅ Implementado e funcionando
- 🟡 Parcialmente implementado
- 🔴 Não implementado

---

## 🔄 Próximos Passos (Ordem de Prioridade)

1. **Migrar JWT para httpOnly cookies** (Alta - Previne XSS)
2. **Implementar Alembic migrations** (Alta - Essencial para produção)
3. **Criar suite de testes de segurança** (Alta - Garantir qualidade)
4. **Adicionar security headers** (Média - Defesa em profundidade)
5. **Implementar logging estruturado** (Média - Auditoria e debug)
6. **Ativar CSRF protection** (Média - Após httpOnly cookies)
7. **Implementar soft delete** (Baixa - Prevenir perda de dados)

---

## 📝 Notas Adicionais

### Dependências de Segurança
```
slowapi==0.1.9          # Rate limiting
python-magic==0.4.27    # File type detection
itsdangerous==2.1.2     # CSRF tokens
passlib[bcrypt]==1.7.4  # Password hashing
python-jose[cryptography]==3.3.0  # JWT handling
```

### Ambiente de Produção
⚠️ **IMPORTANTE:** Antes de deploy em produção:

1. Rotacionar todas as senhas e secrets
2. Configurar HTTPS obrigatório
3. Ativar httpOnly cookies
4. Habilitar security headers
5. Configurar backup automatizado
6. Implementar monitoring e alertas
7. Executar testes de penetração

---

**Última Atualização:** 2025-01-14
**Responsável:** Claude AI Assistant
**Versão:** 1.0.0
