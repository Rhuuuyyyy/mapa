# Relatório de Auditoria de Segurança - MAPA SaaS v2.0.0

**Data da Auditoria:** 21 de Novembro de 2025
**Auditor:** Equipe de Segurança
**Classificação:** CONFIDENCIAL
**Metodologia:** SAST (Static Application Security Testing)

---

## Sumário Executivo

A auditoria de segurança do código-fonte da aplicação **MAPA SaaS** identificou vulnerabilidades de diferentes níveis de severidade que requerem atenção. A aplicação é um sistema SaaS multi-tenant construído com FastAPI (backend) e React (frontend), com funcionalidades de processamento de NF-e (Notas Fiscais Eletrônicas) e geração de relatórios.

### Resumo das Vulnerabilidades

| Severidade | Quantidade |
|------------|------------|
| **Crítica** | 2 |
| **Alta** | 4 |
| **Média** | 6 |
| **Baixa** | 4 |

### Postura Geral de Segurança

A aplicação implementa várias boas práticas de segurança, como:
- Hashing de senhas com bcrypt (custo 12)
- Validação de força de senha (12+ caracteres)
- Rate limiting no endpoint de login
- Validação de arquivos em múltiplas camadas
- Isolamento de dados por usuário via ORM

Contudo, foram identificadas vulnerabilidades críticas que necessitam correção imediata, especialmente relacionadas ao processamento de XML e validação de caminhos de arquivos.

---

## Lista de Vulnerabilidades

---

### 1. XML External Entity (XXE) Injection

| Campo | Valor |
|-------|-------|
| **Severidade** | CRÍTICA |
| **CWE ID** | CWE-611: Improper Restriction of XML External Entity Reference |
| **OWASP** | A05:2021 – Security Misconfiguration |
| **Arquivo** | `/home/user/mapa/app/utils/nfe_processor.py` |
| **Linhas** | 104-106 |

#### Descrição

O processador de XML utiliza `lxml.etree.parse()` sem desabilitar o processamento de entidades externas. Isso permite que um atacante envie arquivos XML maliciosos contendo referências a entidades externas, possibilitando:

- **Leitura de arquivos locais** (ex: `/etc/passwd`, arquivos de configuração)
- **Server-Side Request Forgery (SSRF)** para acessar recursos internos
- **Denial of Service (DoS)** via "Billion Laughs" attack (expansão exponencial de entidades)

#### Código Vulnerável

```python
# /home/user/mapa/app/utils/nfe_processor.py - Linhas 104-106
def process_xml(self, file_path: str) -> Optional[NFeData]:
    try:
        tree = etree.parse(file_path)  # VULNERÁVEL: Entidades externas habilitadas
        root = tree.getroot()
```

#### Prova de Conceito (PoC)

Um atacante pode enviar o seguinte XML malicioso:

```xml
<?xml version="1.0"?>
<!DOCTYPE nfe [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<nfeProc>
  <NFe>
    <infNFe Id="NFe&xxe;">
      <!-- conteúdo do /etc/passwd será injetado aqui -->
    </infNFe>
  </NFe>
</nfeProc>
```

#### Remediação

```python
from lxml import etree

def process_xml(self, file_path: str) -> Optional[NFeData]:
    try:
        # Criar parser seguro que desabilita entidades externas
        parser = etree.XMLParser(
            resolve_entities=False,
            no_network=True,
            dtd_validation=False,
            load_dtd=False
        )
        tree = etree.parse(file_path, parser)
        root = tree.getroot()
```

---

### 2. Path Traversal via Manipulação de Caminho de Arquivo

| Campo | Valor |
|-------|-------|
| **Severidade** | CRÍTICA |
| **CWE ID** | CWE-22: Improper Limitation of a Pathname to a Restricted Directory |
| **OWASP** | A01:2021 – Broken Access Control |
| **Arquivo** | `/home/user/mapa/app/routers/user.py` |
| **Linhas** | 591-604 |

#### Descrição

O endpoint `upload-confirm` aceita um `temp_file_path` fornecido pelo cliente e realiza apenas uma verificação fraca baseada em string (`user_{id}` in path). Essa validação pode ser facilmente contornada, permitindo:

- Acesso a arquivos de outros usuários
- Acesso a arquivos arbitrários do sistema
- Manipulação de arquivos em diretórios sensíveis

#### Código Vulnerável

```python
# /home/user/mapa/app/routers/user.py - Linhas 591-604
@router.post("/upload-confirm", response_model=schemas.XMLUploadResponse)
async def upload_xml_confirm(
    upload_data: schemas.XMLUploadConfirm,
    # ...
):
    temp_file_path = Path(upload_data.temp_file_path)

    # Verificação INSUFICIENTE - pode ser contornada
    if f"user_{current_user.id}" not in str(temp_file_path):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a este arquivo"
        )
```

#### Prova de Conceito

Um atacante com `user_id=5` pode forjar o caminho:
```
/etc/passwd/../../../uploads/temp/user_5_fake/../../secret_file.xml
```

Ou simplesmente:
```
/var/log/user_5/../../etc/passwd
```

#### Remediação

```python
from pathlib import Path
import os

@router.post("/upload-confirm")
async def upload_xml_confirm(
    upload_data: schemas.XMLUploadConfirm,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Definir diretório base permitido
    base_temp_dir = Path(settings.upload_dir) / "temp" / f"user_{current_user.id}"
    base_temp_dir = base_temp_dir.resolve()

    # Resolver caminho fornecido
    requested_path = Path(upload_data.temp_file_path).resolve()

    # Verificar se está dentro do diretório permitido
    try:
        requested_path.relative_to(base_temp_dir)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a este arquivo"
        )

    if not requested_path.exists() or not requested_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arquivo temporário não encontrado"
        )
```

---

### 3. Endpoint de Setup de Admin Exposto Sem Proteção Adequada

| Campo | Valor |
|-------|-------|
| **Severidade** | ALTA |
| **CWE ID** | CWE-284: Improper Access Control |
| **OWASP** | A01:2021 – Broken Access Control |
| **Arquivo** | `/home/user/mapa/app/routers/admin.py` |
| **Linhas** | 53-111 |

#### Descrição

O endpoint `/auth/setup-first-admin` está permanentemente exposto e apenas verifica se existe um admin no banco. Em cenários de race condition, truncamento de tabela, ou restauração de backup, um atacante poderia criar um admin malicioso.

#### Código Vulnerável

```python
# /home/user/mapa/app/routers/admin.py - Linhas 53-65
@router.post("/auth/setup-first-admin", response_model=schemas.UserResponse)
async def setup_first_admin(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """
    ⚠️ IMPORTANTE: Este endpoint só funciona se não existir nenhum admin.
    """
    existing_admin = db.query(models.User).filter(
        models.User.is_admin == True
    ).first()

    if existing_admin:
        raise HTTPException(...)
```

#### Riscos

1. **Race Condition**: Múltiplas requisições simultâneas durante o primeiro setup
2. **Rollback/Restore**: Após restauração de banco sem admin, endpoint fica ativo
3. **SQL Injection em outra parte**: Se houver SQL injection que delete admins

#### Remediação

1. **Remover o endpoint em produção** (conforme comentário no código)
2. **Implementar proteção via variável de ambiente**:

```python
import os

@router.post("/auth/setup-first-admin", response_model=schemas.UserResponse)
async def setup_first_admin(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    # Verificar se setup está habilitado via variável de ambiente
    if not os.getenv("ALLOW_ADMIN_SETUP", "false").lower() == "true":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Endpoint de setup desabilitado"
        )

    # Usar transação com lock para prevenir race condition
    with db.begin_nested():
        existing_admin = db.query(models.User).filter(
            models.User.is_admin == True
        ).with_for_update().first()

        if existing_admin:
            raise HTTPException(...)
```

---

### 4. Configuração CORS Permissiva (Wildcard)

| Campo | Valor |
|-------|-------|
| **Severidade** | ALTA |
| **CWE ID** | CWE-942: Permissive Cross-domain Policy with Untrusted Domains |
| **OWASP** | A05:2021 – Security Misconfiguration |
| **Arquivo** | `/home/user/mapa/.env.example` |
| **Linha** | 17 |

#### Descrição

O arquivo de exemplo de configuração sugere `ALLOWED_ORIGINS=*` como valor padrão, o que permite requisições de qualquer origem. Combinado com `allow_credentials=True`, isso pode expor tokens e dados sensíveis.

#### Código Vulnerável

```python
# /home/user/mapa/app/main.py - Linhas 47-53
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,  # Pode ser ["*"]
    allow_credentials=True,  # PROBLEMA: Credenciais com wildcard
    allow_methods=["*"],
    allow_headers=["*"],
)
```

```env
# /home/user/mapa/.env.example - Linha 17
ALLOWED_ORIGINS=*
```

#### Riscos

- Um site malicioso pode fazer requisições autenticadas em nome do usuário
- Roubo de tokens JWT via JavaScript malicioso
- Ataques CSRF mais eficientes

#### Remediação

```python
# /home/user/mapa/app/config.py
@field_validator("allowed_origins", mode="before")
@classmethod
def parse_allowed_origins(cls, v):
    # NUNCA permitir wildcard em produção
    if isinstance(v, str) and v.strip() == "*":
        import os
        if os.getenv("DEBUG", "false").lower() != "true":
            raise ValueError(
                "ALLOWED_ORIGINS='*' não é permitido em produção. "
                "Configure origens específicas."
            )
    # ... resto do código
```

```env
# .env.example - Valor seguro
ALLOWED_ORIGINS=https://seu-dominio.com
```

---

### 5. Armazenamento de Token JWT em localStorage

| Campo | Valor |
|-------|-------|
| **Severidade** | ALTA |
| **CWE ID** | CWE-922: Insecure Storage of Sensitive Information |
| **OWASP** | A02:2021 – Cryptographic Failures |
| **Arquivo** | `/home/user/mapa/frontend/src/contexts/AuthContext.jsx` |
| **Linhas** | 13, 29, 45, 50 |

#### Descrição

O token JWT é armazenado em `localStorage`, que é acessível por qualquer JavaScript executando na mesma origem. Se houver uma vulnerabilidade XSS na aplicação, tokens podem ser roubados.

#### Código Vulnerável

```javascript
// /home/user/mapa/frontend/src/contexts/AuthContext.jsx
const token = localStorage.getItem('token');  // Linha 13
localStorage.setItem('token', access_token);   // Linha 45
localStorage.setItem('user', JSON.stringify(userData));  // Linha 50
```

#### Remediação

Usar cookies HttpOnly para armazenar tokens:

**Backend:**
```python
from fastapi.responses import JSONResponse

@router.post("/auth/login")
async def login(...):
    # ... autenticação
    access_token = auth.create_access_token(data={"sub": user.email})

    response = JSONResponse(content={"message": "Login successful"})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,  # HTTPS only
        samesite="strict",
        max_age=settings.access_token_expire_minutes * 60
    )
    return response
```

**Frontend:**
```javascript
// Cookies HttpOnly são enviados automaticamente
const response = await api.post('/admin/auth/login', formData, {
  withCredentials: true
});
```

---

### 6. Ausência de Rate Limiting em Endpoints Sensíveis

| Campo | Valor |
|-------|-------|
| **Severidade** | ALTA |
| **CWE ID** | CWE-307: Improper Restriction of Excessive Authentication Attempts |
| **OWASP** | A07:2021 – Identification and Authentication Failures |
| **Arquivo** | `/home/user/mapa/app/routers/user.py` |
| **Linhas** | Múltiplas |

#### Descrição

Apenas o endpoint de login possui rate limiting (`5/minute`). Outros endpoints sensíveis como upload de arquivos, geração de relatórios e alteração de senha não possuem proteção contra abuso.

#### Endpoints Sem Rate Limiting

| Endpoint | Risco |
|----------|-------|
| `POST /user/upload-preview` | DoS via uploads massivos |
| `POST /user/upload-confirm` | Abuso de armazenamento |
| `POST /user/generate-report` | DoS via processamento intensivo |
| `POST /user/change-password` | Brute force offline |
| `POST /admin/users` | Criação em massa de usuários |

#### Remediação

```python
# /home/user/mapa/app/routers/user.py

@router.post("/upload-preview")
@limiter.limit("10/minute")  # Limite de uploads
async def upload_xml_preview(request: Request, ...):
    pass

@router.post("/generate-report")
@limiter.limit("5/minute")  # Limite de geração de relatórios
async def generate_report(request: Request, ...):
    pass

@router.post("/change-password")
@limiter.limit("3/minute")  # Limite de tentativas de troca de senha
async def change_password(request: Request, ...):
    pass
```

---

### 7. Exposição de Email de Administrador no Frontend

| Campo | Valor |
|-------|-------|
| **Severidade** | MÉDIA |
| **CWE ID** | CWE-200: Exposure of Sensitive Information |
| **OWASP** | A01:2021 – Broken Access Control |
| **Arquivo** | `/home/user/mapa/frontend/src/pages/Login.jsx` |
| **Linha** | 6 |

#### Descrição

O email do administrador está hardcoded no código-fonte do frontend, expondo informações que podem ser usadas para ataques de phishing ou engenharia social.

#### Código Vulnerável

```javascript
// /home/user/mapa/frontend/src/pages/Login.jsx - Linha 6
const ADMIN_EMAIL = 'rhyan.hdr@gmail.com';
```

#### Remediação

```javascript
// Usar variável de ambiente ou endpoint da API
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'suporte@empresa.com';

// Ou buscar do backend via endpoint público
const { data } = await api.get('/public/contact-info');
```

---

### 8. Mass Assignment na Atualização de Usuário

| Campo | Valor |
|-------|-------|
| **Severidade** | MÉDIA |
| **CWE ID** | CWE-915: Improperly Controlled Modification of Dynamically-Determined Object Attributes |
| **OWASP** | A04:2021 – Insecure Design |
| **Arquivo** | `/home/user/mapa/app/routers/admin.py` |
| **Linhas** | 228-241 |

#### Descrição

O endpoint de atualização de usuário aceita campos arbitrários do schema e os aplica diretamente ao modelo, potencialmente permitindo a modificação de campos sensíveis não intencionais.

#### Código Vulnerável

```python
# /home/user/mapa/app/routers/admin.py - Linhas 228-241
update_data = user_update.dict(exclude_unset=True)

# Se senha fornecida, validar e hashear
if "password" in update_data:
    # ...
    update_data["hashed_password"] = auth.get_password_hash(update_data.pop("password"))

for field, value in update_data.items():
    setattr(user, field, value)  # PROBLEMA: Aplica qualquer campo
```

#### Remediação

```python
# Definir explicitamente campos permitidos
ALLOWED_UPDATE_FIELDS = {'full_name', 'company_name', 'is_active', 'is_admin'}

for field, value in update_data.items():
    if field in ALLOWED_UPDATE_FIELDS:
        setattr(user, field, value)
    elif field == 'hashed_password':
        setattr(user, field, value)
    # Ignorar campos não permitidos
```

---

### 9. Ausência de Validação de Propriedade em Detalhes de Upload

| Campo | Valor |
|-------|-------|
| **Severidade** | MÉDIA |
| **CWE ID** | CWE-639: Authorization Bypass Through User-Controlled Key (IDOR) |
| **OWASP** | A01:2021 – Broken Access Control |
| **Arquivo** | `/home/user/mapa/app/routers/user.py` |
| **Linhas** | 958-959 |

#### Descrição

O endpoint `get_upload_details` tenta buscar produtos com `user_id` do `current_user`, mas o modelo `Product` não possui atributo `user_id` direto, causando potencial erro ou comportamento inesperado.

#### Código Vulnerável

```python
# /home/user/mapa/app/routers/user.py - Linhas 958-959
products = db.query(models.Product).filter(
    models.Product.user_id == current_user.id  # ERRO: Product não tem user_id
).all()
```

#### Remediação

```python
# Buscar produtos através da relação correta
products = db.query(models.Product).join(models.Company).filter(
    models.Company.user_id == current_user.id
).all()
```

---

### 10. Ausência de Mecanismo de Invalidação de Tokens

| Campo | Valor |
|-------|-------|
| **Severidade** | MÉDIA |
| **CWE ID** | CWE-613: Insufficient Session Expiration |
| **OWASP** | A07:2021 – Identification and Authentication Failures |
| **Arquivo** | `/home/user/mapa/app/auth.py` |
| **Linhas** | N/A |

#### Descrição

Não existe mecanismo para invalidar tokens JWT antes de sua expiração natural. Se um token for comprometido, ele permanece válido até expirar.

#### Impacto

- Tokens roubados continuam válidos por 30 minutos
- Impossível forçar logout de sessões comprometidas
- Não há "logout em todos os dispositivos"

#### Remediação

**Implementar blacklist de tokens ou JWT ID tracking:**

```python
# /home/user/mapa/app/auth.py
import uuid
from datetime import datetime

# Redis ou banco de dados para blacklist
token_blacklist = set()  # Em produção, usar Redis

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    jti = str(uuid.uuid4())  # JWT ID único
    to_encode.update({
        "exp": expire,
        "jti": jti,
        "iat": datetime.utcnow()
    })
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

async def get_current_user(...):
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    jti = payload.get("jti")

    # Verificar se token está na blacklist
    if jti in token_blacklist:
        raise credentials_exception

    # ... resto da validação

def invalidate_token(token: str):
    """Adiciona token à blacklist"""
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    jti = payload.get("jti")
    token_blacklist.add(jti)
```

---

### 11. Exposição de Informações em Mensagens de Erro

| Campo | Valor |
|-------|-------|
| **Severidade** | MÉDIA |
| **CWE ID** | CWE-209: Generation of Error Message Containing Sensitive Information |
| **OWASP** | A04:2021 – Insecure Design |
| **Arquivo** | `/home/user/mapa/app/routers/user.py` |
| **Linhas** | Múltiplas |

#### Descrição

Algumas mensagens de erro expõem detalhes internos como caminhos de arquivo, stack traces, e detalhes de implementação.

#### Código Vulnerável

```python
# Linha 495
detail=f"Erro ao salvar arquivo: {str(e)}"

# Linha 577
detail=f"Erro ao processar arquivo: {str(e)}"

# Linha 1007
print(traceback.format_exc())  # Expõe stack trace nos logs
```

#### Remediação

```python
import logging
logger = logging.getLogger(__name__)

try:
    # operação
except Exception as e:
    logger.exception(f"Erro ao processar arquivo: {e}")
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Erro interno ao processar arquivo. Tente novamente."
    )
```

---

### 12. Validação MIME Opcional (Fallback Inseguro)

| Campo | Valor |
|-------|-------|
| **Severidade** | MÉDIA |
| **CWE ID** | CWE-434: Unrestricted Upload of File with Dangerous Type |
| **OWASP** | A04:2021 – Insecure Design |
| **Arquivo** | `/home/user/mapa/app/utils/validators.py` |
| **Linhas** | 63-69 |

#### Descrição

Se a biblioteca `python-magic` não estiver instalada, a validação MIME é completamente ignorada, permitindo upload de arquivos potencialmente maliciosos.

#### Código Vulnerável

```python
# /home/user/mapa/app/utils/validators.py - Linhas 63-69
def validate_mime_type(content: bytes) -> str:
    if not MAGIC_AVAILABLE:
        # Se magic não está disponível, pular validação MIME
        return "application/octet-stream"  # BYPASS SILENCIOSO
```

#### Remediação

```python
def validate_mime_type(content: bytes) -> str:
    if not MAGIC_AVAILABLE:
        # NUNCA pular validação em produção
        raise RuntimeError(
            "python-magic não está disponível. "
            "Instale libmagic: apt-get install libmagic1"
        )
```

---

### 13. Função Duplicada de Delete Upload

| Campo | Valor |
|-------|-------|
| **Severidade** | BAIXA |
| **CWE ID** | CWE-561: Dead Code |
| **OWASP** | N/A (Qualidade de Código) |
| **Arquivo** | `/home/user/mapa/app/routers/user.py` |
| **Linhas** | 718-754 e 889-920 |

#### Descrição

Existem duas funções `delete_upload` e `list_uploads` duplicadas no mesmo arquivo, o que pode causar comportamento inconsistente e dificultar manutenção.

#### Remediação

Remover as definições duplicadas e manter apenas uma versão de cada função.

---

### 14. Endpoint GET para Operações de Escrita

| Campo | Valor |
|-------|-------|
| **Severidade** | BAIXA |
| **CWE ID** | CWE-650: Trusting HTTP Permission Methods on the Server Side |
| **OWASP** | A04:2021 – Insecure Design |
| **Arquivo** | `/home/user/mapa/app/routers/user.py` |
| **Linha** | 1171 |

#### Descrição

O endpoint de download de relatório `/reports/{report_period}/download` usa GET mas pode gerar e processar dados. Idealmente, operações que causam processamento intensivo deveriam usar POST.

#### Remediação

```python
@router.post("/reports/{report_period}/download")  # Usar POST
async def download_report(...):
    pass
```

---

### 15. Algoritmo JWT Hardcoded

| Campo | Valor |
|-------|-------|
| **Severidade** | BAIXA |
| **CWE ID** | CWE-327: Use of a Broken or Risky Cryptographic Algorithm |
| **OWASP** | A02:2021 – Cryptographic Failures |
| **Arquivo** | `/home/user/mapa/app/config.py` |
| **Linha** | 24 |

#### Descrição

O algoritmo HS256 é seguro, mas está hardcoded como padrão. Em caso de migração para RS256 (recomendado para sistemas distribuídos), seria necessário modificar código.

#### Código Atual

```python
algorithm: str = "HS256"
```

#### Recomendação

Para sistemas com múltiplos serviços, considerar migração para RS256:

```python
algorithm: str = "RS256"  # Assimétrico - mais seguro para microserviços
```

---

### 16. Secret Key Fraca no Exemplo

| Campo | Valor |
|-------|-------|
| **Severidade** | BAIXA |
| **CWE ID** | CWE-798: Use of Hard-coded Credentials |
| **OWASP** | A07:2021 – Identification and Authentication Failures |
| **Arquivo** | `/home/user/mapa/.env.example` |
| **Linha** | 10 |

#### Descrição

O arquivo de exemplo contém `SECRET_KEY=your-secret-key-here` que pode ser copiado acidentalmente para produção.

#### Código Vulnerável

```env
SECRET_KEY=your-secret-key-here-use-secrets.token_urlsafe(32)
```

#### Remediação

```env
# SECRET_KEY DEVE ser gerada assim em produção:
# python -c "import secrets; print(secrets.token_urlsafe(64))"
SECRET_KEY=GERE_UMA_CHAVE_SEGURA_ANTES_DE_USAR
```

---

## Melhores Práticas e Recomendações Adicionais

### 1. Implementar Content Security Policy (CSP)

```python
# /home/user/mapa/app/main.py
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["seu-dominio.com", "*.seu-dominio.com"]
)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

### 2. Implementar Logging de Segurança

```python
import logging
from datetime import datetime

security_logger = logging.getLogger("security")

def log_security_event(event_type: str, user_id: int, details: dict):
    security_logger.warning(f"[{event_type}] user_id={user_id} {details}")

# Usar em eventos como:
# - Tentativas de login falhas
# - Acesso negado
# - Upload de arquivos suspeitos
# - Alterações de permissão
```

### 3. Implementar Validação de Entrada Mais Rigorosa

```python
from pydantic import validator
import re

class CompanyCreate(CompanyBase):
    @validator('company_name')
    def validate_company_name(cls, v):
        # Prevenir XSS em nomes
        if re.search(r'[<>"\']', v):
            raise ValueError('Nome contém caracteres inválidos')
        return v
```

### 4. Adicionar Testes de Segurança Automatizados

```python
# tests/test_security.py
import pytest

def test_xxe_prevention(client, auth_headers):
    malicious_xml = b'''<?xml version="1.0"?>
    <!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
    <nfe>&xxe;</nfe>'''

    response = client.post(
        "/api/user/upload",
        files={"file": ("test.xml", malicious_xml, "application/xml")},
        headers=auth_headers
    )

    assert response.status_code == 400
    assert "passwd" not in response.text

def test_path_traversal_prevention(client, auth_headers):
    response = client.post(
        "/api/user/upload-confirm",
        json={"temp_file_path": "/etc/passwd", "filename": "test.xml"},
        headers=auth_headers
    )

    assert response.status_code == 403
```

### 5. Implementar Rotação de Secrets

```python
# Suportar múltiplas chaves para rotação
secret_keys = [
    settings.secret_key,
    settings.previous_secret_key  # Para tokens antigos
]

def decode_token_with_rotation(token: str):
    for key in secret_keys:
        try:
            return jwt.decode(token, key, algorithms=[settings.algorithm])
        except JWTError:
            continue
    raise credentials_exception
```

---

## Conclusão

A aplicação MAPA SaaS possui uma base sólida de segurança, com boas práticas implementadas em autenticação, validação de arquivos e isolamento de dados. Contudo, as vulnerabilidades críticas identificadas (XXE e Path Traversal) representam riscos significativos que devem ser corrigidos antes de qualquer deploy em produção.

### Prioridade de Correção

1. **IMEDIATA**: Vulnerabilidades #1 (XXE) e #2 (Path Traversal)
2. **CURTO PRAZO**: Vulnerabilidades #3, #4, #5, #6
3. **MÉDIO PRAZO**: Vulnerabilidades #7 a #12
4. **LONGO PRAZO**: Vulnerabilidades #13 a #16 e melhorias de boas práticas

### Próximos Passos Recomendados

1. Aplicar correções para vulnerabilidades críticas
2. Configurar pipeline de SAST (ex: Bandit, Semgrep)
3. Implementar testes de penetração (DAST)
4. Realizar code review focado em segurança
5. Implementar monitoramento de segurança em produção

---

**Documento gerado automaticamente por auditoria SAST**
**Versão do Relatório:** 1.0
**Classificação:** CONFIDENCIAL - USO INTERNO
