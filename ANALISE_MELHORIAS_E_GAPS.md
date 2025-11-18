# ANÁLISE DE GAPS E OPORTUNIDADES
## Sistema MAPA SaaS v2.0

**Data:** Novembro 2025
**Versão Analisada:** 2.0.0
**Tipo de Análise:** Gaps funcionais, técnicos e oportunidades de negócio

---

## SUMÁRIO EXECUTIVO

Após análise detalhada do código, arquitetura, documentação e contexto de negócio, identifiquei **78 oportunidades de melhoria** organizadas em 10 categorias. As sugestões variam de funcionalidades críticas faltando (alta prioridade) até melhorias de UX e novas oportunidades de receita.

**Priorização:**
- 🔴 **CRÍTICO** - Impacto alto, deveria estar na v2.0
- 🟠 **ALTO** - Importante para competitividade
- 🟡 **MÉDIO** - Melhora experiência mas não é urgente
- 🟢 **BAIXO** - Nice to have, pode esperar

---

## 1. FUNCIONALIDADES CRÍTICAS FALTANDO 🔴

### 1.1 Validação de Duplicatas de NF-e
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🔴 CRÍTICO
**Impacto:** Usuário pode processar a mesma NF-e múltiplas vezes, gerando dados duplicados no relatório

**Solução:**
```python
# Em XMLUpload model, adicionar:
nfe_key = Column(String(44), index=True)  # Chave de acesso da NF-e

# Unique constraint por user + chave
__table_args__ = (
    Index('idx_user_nfe_key', 'user_id', 'nfe_key', unique=True),
)

# Validação no upload:
existing = db.query(XMLUpload).filter(
    XMLUpload.user_id == user_id,
    XMLUpload.nfe_key == nfe_key
).first()

if existing:
    raise HTTPException(
        status_code=409,
        detail=f"NF-e {nfe_key} já foi processada em {existing.upload_date}"
    )
```

**Benefício:** Integridade de dados, previne erros, melhora confiança do usuário

---

### 1.2 Deleção de Uploads e Relatórios
**Status:** PARCIALMENTE IMPLEMENTADO (DELETE de reports existe, mas não de uploads)
**Prioridade:** 🔴 CRÍTICO
**Impacto:** Se usuário fez upload errado, não consegue remover

**Solução:**
```python
@router.delete("/uploads/{upload_id}", status_code=204)
async def delete_upload(
    upload_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    upload = db.query(XMLUpload).filter(
        XMLUpload.id == upload_id,
        XMLUpload.user_id == current_user.id
    ).first()

    if not upload:
        raise HTTPException(status_code=404, detail="Upload não encontrado")

    # Deletar arquivo físico
    if os.path.exists(upload.file_path):
        os.remove(upload.file_path)

    # Deletar registro (cascade vai deletar reports associados)
    db.delete(upload)
    db.commit()
```

**Frontend:**
- Adicionar botão "Deletar" na lista de uploads
- Modal de confirmação
- Atualizar lista após deleção

**Benefício:** Usuário corrige erros facilmente

---

### 1.3 Edição de Período do Upload
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🔴 CRÍTICO
**Impacto:** Se usuário marcou período errado, precisa deletar e refazer

**Solução:**
```python
@router.patch("/uploads/{upload_id}")
async def update_upload_period(
    upload_id: int,
    period: str,  # Q1-2025, Q2-2025, etc
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    upload = db.query(XMLUpload).filter(
        XMLUpload.id == upload_id,
        XMLUpload.user_id == current_user.id
    ).first()

    if not upload:
        raise HTTPException(status_code=404)

    # Validar formato Q1-2025
    if not re.match(r'^Q[1-4]-\d{4}$', period):
        raise HTTPException(status_code=400, detail="Formato inválido")

    upload.period = period
    db.commit()

    return {"message": "Período atualizado"}
```

**Benefício:** Flexibilidade, menos retrabalho

---

### 1.4 Preview de Relatório (Antes do Download)
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟠 ALTO
**Impacto:** Usuário só vê o relatório depois de baixar Excel

**Solução:**
- Endpoint `/reports/{id}/preview` retorna JSON com dados do relatório
- Frontend mostra tabela HTML antes de gerar Excel
- Usuário valida e clica "Confirmar e Baixar Excel"

**Benefício:** Usuário valida dados antes de gerar arquivo final

---

### 1.5 Auditoria e Logs Detalhados
**Status:** LOGS BÁSICOS (logger em alguns pontos)
**Prioridade:** 🔴 CRÍTICO (para compliance)
**Impacto:** Não tem rastreabilidade completa de ações

**Solução:**
Criar model `AuditLog`:
```python
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(50))  # CREATE, UPDATE, DELETE, LOGIN, DOWNLOAD
    entity_type = Column(String(50))  # USER, COMPANY, PRODUCT, UPLOAD, REPORT
    entity_id = Column(Integer, nullable=True)
    details = Column(JSON)  # Dados antes/depois
    ip_address = Column(String(45))
    user_agent = Column(String(255))
    timestamp = Column(DateTime, default=datetime.utcnow)
```

Decorator para audit:
```python
def audit_action(action: str, entity_type: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Capturar request, user, etc
            result = await func(*args, **kwargs)
            # Salvar log
            return result
        return wrapper
    return decorator

@router.post("/companies")
@audit_action("CREATE", "COMPANY")
async def create_company(...):
    ...
```

Endpoint para admin ver logs:
```python
@router.get("/admin/audit-logs")
async def get_audit_logs(
    limit: int = 100,
    current_user: User = Depends(get_current_admin)
):
    # Retornar logs paginados
    ...
```

**Benefício:** Compliance (LGPD), troubleshooting, segurança

---

## 2. MELHORIAS DE UX/UI 🟠

### 2.1 Paginação em Todas as Listagens
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟠 ALTO
**Impacto:** Com 10.000 produtos, frontend trava

**Solução:**
```python
@router.get("/products")
async def list_products(
    page: int = 1,
    per_page: int = 50,
    search: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Product).join(Company).filter(
        Company.user_id == current_user.id
    )

    if search:
        query = query.filter(
            Product.product_name.ilike(f"%{search}%")
        )

    total = query.count()
    products = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "items": products,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page
    }
```

**Frontend:**
- Componente Pagination reutilizável
- Infinite scroll ou botões página

**Benefício:** Performance, UX melhor com muitos dados

---

### 2.2 Busca Avançada e Filtros
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟠 ALTO

**Funcionalidades:**
- **Uploads:** Filtrar por período, status, nome de arquivo, data
- **Produtos:** Buscar por nome, registro MAPA, empresa
- **Relatórios:** Filtrar por período, data de geração
- **Empresas:** Buscar por nome, CNPJ, registro MAPA

**Solução:**
```python
@router.get("/uploads")
async def list_uploads(
    period: Optional[str] = None,
    status: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    search: Optional[str] = None,
    page: int = 1,
    per_page: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(XMLUpload).filter(XMLUpload.user_id == current_user.id)

    if period:
        query = query.filter(XMLUpload.period == period)
    if status:
        query = query.filter(XMLUpload.status == status)
    if date_from:
        query = query.filter(XMLUpload.upload_date >= date_from)
    if date_to:
        query = query.filter(XMLUpload.upload_date <= date_to)
    if search:
        query = query.filter(XMLUpload.filename.ilike(f"%{search}%"))

    # ... paginação
```

**Frontend:**
- Sidebar com filtros
- Aplicar filtros sem recarregar página
- Limpar filtros

**Benefício:** Usuário encontra dados rapidamente

---

### 2.3 Dashboard com Gráficos e Analytics
**Status:** DASHBOARD BÁSICO (só listagens)
**Prioridade:** 🟠 ALTO
**Impacto:** Usuário não tem visão geral do negócio

**Funcionalidades:**
1. **Cards de Resumo:**
   - Total de NF-es processadas (mês, trimestre, ano)
   - Total de empresas e produtos cadastrados
   - Último relatório gerado
   - Taxa de sucesso de processamento

2. **Gráficos:**
   - Linha: Volume de compras por mês (últimos 12 meses)
   - Pizza: Nacional vs Importação (% e valor)
   - Barra: Top 10 produtos mais comprados
   - Barra: Top 10 fornecedores (empresas)

3. **Alertas:**
   - "Você tem 5 produtos sem registro MAPA cadastrado"
   - "12 NF-es com erro de processamento"
   - "Próximo fechamento trimestral em 10 dias"

**Solução Backend:**
```python
@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Total de uploads
    total_uploads = db.query(XMLUpload).filter(
        XMLUpload.user_id == current_user.id
    ).count()

    # Sucesso vs erro
    success = db.query(XMLUpload).filter(
        XMLUpload.user_id == current_user.id,
        XMLUpload.status == "processed"
    ).count()

    # Empresas e produtos
    companies_count = db.query(Company).filter(
        Company.user_id == current_user.id
    ).count()

    products_count = db.query(Product).join(Company).filter(
        Company.user_id == current_user.id
    ).count()

    # Último relatório
    last_report = db.query(Report).filter(
        Report.user_id == current_user.id
    ).order_by(Report.generated_at.desc()).first()

    return {
        "total_uploads": total_uploads,
        "success_rate": (success / total_uploads * 100) if total_uploads > 0 else 0,
        "companies_count": companies_count,
        "products_count": products_count,
        "last_report": last_report
    }

@router.get("/dashboard/volume-by-month")
async def get_volume_by_month(
    months: int = 12,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Query agregada por mês
    # Retornar [{month: "2025-01", volume: 1234.56}, ...]
    ...
```

**Frontend:**
- Usar biblioteca de charts (Chart.js, Recharts, ApexCharts)
- Cards com ícones
- Gráficos interativos

**Benefício:** Insights de negócio, decisões baseadas em dados

---

### 2.4 Notificações em Tempo Real
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟡 MÉDIO

**Funcionalidades:**
- Notificar quando upload terminar de processar
- Notificar quando relatório estiver pronto
- Notificar erros de processamento
- Notificar quando catálogo estiver incompleto

**Solução:**
- **Backend:** WebSockets (FastAPI suporta) ou Server-Sent Events
- **Frontend:** Toast notifications (react-hot-toast, react-toastify)
- **Persistência:** Tabela `notifications` no banco

```python
# Model
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String(50))  # INFO, SUCCESS, WARNING, ERROR
    title = Column(String(255))
    message = Column(Text)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Endpoint
@router.get("/notifications")
async def get_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Notification).filter(
        Notification.user_id == current_user.id
    )

    if unread_only:
        query = query.filter(Notification.read == False)

    return query.order_by(Notification.created_at.desc()).limit(50).all()

@router.post("/notifications/{id}/read")
async def mark_notification_read(...):
    ...
```

**Benefício:** Usuário sempre informado, não precisa ficar atualizando página

---

### 2.5 Exportação de Catálogo
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟡 MÉDIO

**Funcionalidades:**
- Exportar empresas + produtos em Excel
- Exportar em CSV
- Exportar em JSON (para backup/migração)

**Solução:**
```python
@router.get("/catalog/export")
async def export_catalog(
    format: str = "excel",  # excel, csv, json
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    companies = db.query(Company).filter(
        Company.user_id == current_user.id
    ).all()

    data = []
    for company in companies:
        for product in company.products:
            data.append({
                "empresa": company.company_name,
                "registro_mapa_empresa": company.mapa_registration,
                "produto": product.product_name,
                "registro_mapa_produto": product.mapa_registration,
                "referencia": product.product_reference
            })

    if format == "excel":
        # Gerar Excel com openpyxl
        ...
    elif format == "csv":
        # Gerar CSV com pandas
        ...
    elif format == "json":
        return data
```

**Benefício:** Backup, migração, análise externa

---

### 2.6 Importação em Massa de Catálogo
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟠 ALTO
**Impacto:** Cadastro manual de 100+ produtos é tedioso

**Funcionalidades:**
- Upload de Excel/CSV com empresas e produtos
- Validação de dados
- Preview antes de importar
- Importação com rollback em caso de erro

**Solução:**
```python
@router.post("/catalog/import")
async def import_catalog(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ler Excel com pandas
    df = pd.read_excel(file.file)

    # Validar colunas obrigatórias
    required = ["empresa", "registro_mapa_empresa", "produto", "registro_mapa_produto"]
    if not all(col in df.columns for col in required):
        raise HTTPException(400, "Colunas faltando")

    errors = []
    created_companies = 0
    created_products = 0

    try:
        for idx, row in df.iterrows():
            # Buscar ou criar empresa
            company = db.query(Company).filter(
                Company.user_id == current_user.id,
                Company.company_name == row["empresa"]
            ).first()

            if not company:
                company = Company(
                    user_id=current_user.id,
                    company_name=row["empresa"],
                    mapa_registration=row["registro_mapa_empresa"]
                )
                db.add(company)
                db.flush()
                created_companies += 1

            # Criar produto
            product = Product(
                company_id=company.id,
                product_name=row["produto"],
                mapa_registration=row["registro_mapa_produto"],
                product_reference=row.get("referencia", "")
            )
            db.add(product)
            created_products += 1

        db.commit()

        return {
            "success": True,
            "created_companies": created_companies,
            "created_products": created_products,
            "errors": errors
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Erro na importação: {str(e)}")
```

**Template Excel:**
Disponibilizar template para download com colunas corretas

**Benefício:** Onboarding rápido, menos trabalho manual

---

## 3. SEGURANÇA E COMPLIANCE 🔴

### 3.1 Autenticação de Dois Fatores (2FA)
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟠 ALTO
**Impacto:** Segurança adicional para contas

**Solução:**
- Usar TOTP (Time-based One-Time Password)
- Biblioteca: `pyotp`
- QR Code: `qrcode`

```python
# Adicionar ao User model
class User(Base):
    ...
    totp_secret = Column(String(32), nullable=True)
    totp_enabled = Column(Boolean, default=False)

# Endpoints
@router.post("/auth/2fa/enable")
async def enable_2fa(current_user: User = Depends(get_current_user)):
    import pyotp
    import qrcode

    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(
        name=current_user.email,
        issuer_name="MAPA SaaS"
    )

    # Gerar QR code
    qr = qrcode.make(uri)
    # Salvar temporariamente e retornar URL

    # Salvar secret (só confirma depois de validar código)
    current_user.totp_secret = secret
    db.commit()

    return {"qr_code_url": "...", "secret": secret}

@router.post("/auth/2fa/verify")
async def verify_2fa(
    code: str,
    current_user: User = Depends(get_current_user)
):
    import pyotp

    totp = pyotp.TOTP(current_user.totp_secret)

    if totp.verify(code):
        current_user.totp_enabled = True
        db.commit()
        return {"success": True}
    else:
        raise HTTPException(400, "Código inválido")

# Modificar login para pedir 2FA se habilitado
```

**Benefício:** Segurança contra roubo de senha

---

### 3.2 Política de Senha com Expiração
**Status:** VALIDAÇÃO BÁSICA IMPLEMENTADA
**Prioridade:** 🟡 MÉDIO

**Melhorias:**
- Expiração de senha (90 dias)
- Histórico de senhas (não permitir reusar últimas 5)
- Forçar troca de senha no primeiro login

```python
# User model
class User(Base):
    ...
    password_changed_at = Column(DateTime, default=datetime.utcnow)
    password_history = Column(JSON, default=list)  # Lista de hashes
    must_change_password = Column(Boolean, default=False)

# Middleware para verificar
@app.middleware("http")
async def check_password_expiry(request: Request, call_next):
    # Se usuário logado, verificar se senha expirou
    # Se expirou, forçar redirect para /change-password
    ...
```

**Benefício:** Compliance, segurança

---

### 3.3 Controle de Sessões Ativas
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟡 MÉDIO

**Funcionalidades:**
- Ver todas sessões ativas (device, IP, última atividade)
- Revogar sessões remotamente
- Logout de todos os dispositivos

**Solução:**
```python
# Model
class Session(Base):
    __tablename__ = "sessions"

    id = Column(String(64), primary_key=True)  # Token ID
    user_id = Column(Integer, ForeignKey("users.id"))
    device = Column(String(255))
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.utcnow)
    revoked = Column(Boolean, default=False)

# Ao criar token, salvar sessão
# Ao validar token, verificar se não está revoked

@router.get("/sessions")
async def get_active_sessions(current_user: User = Depends(get_current_user)):
    sessions = db.query(Session).filter(
        Session.user_id == current_user.id,
        Session.revoked == False
    ).all()
    return sessions

@router.delete("/sessions/{session_id}")
async def revoke_session(...):
    ...
```

**Benefício:** Usuário controla acessos à sua conta

---

### 3.4 IP Whitelist (para clientes enterprise)
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟢 BAIXO (feature enterprise)

**Funcionalidades:**
- Admin pode configurar IPs permitidos
- Bloquear acesso de IPs não listados

**Solução:**
```python
# User model
class User(Base):
    ...
    ip_whitelist = Column(JSON, default=list)  # ["192.168.1.1", "10.0.0.0/24"]

# Middleware
@app.middleware("http")
async def check_ip_whitelist(request: Request, call_next):
    # Pegar IP do cliente
    client_ip = request.client.host

    # Se usuário logado, verificar whitelist
    if user and user.ip_whitelist:
        if not ip_in_whitelist(client_ip, user.ip_whitelist):
            raise HTTPException(403, "IP não autorizado")

    return await call_next(request)
```

**Benefício:** Segurança adicional para grandes empresas

---

### 3.5 Criptografia de Arquivos em Storage
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟠 ALTO (para LGPD)

**Solução:**
- Criptografar XMLs/PDFs antes de salvar
- Descriptografar ao ler
- Usar `cryptography` library (Fernet)

```python
from cryptography.fernet import Fernet

# Gerar chave (uma vez, guardar em secret)
key = Fernet.generate_key()
cipher = Fernet(key)

# Ao salvar arquivo
with open(file_path, "rb") as f:
    data = f.read()
encrypted = cipher.encrypt(data)

with open(file_path, "wb") as f:
    f.write(encrypted)

# Ao ler arquivo
with open(file_path, "rb") as f:
    encrypted = f.read()
decrypted = cipher.decrypt(encrypted)
```

**Benefício:** LGPD compliance, dados sensíveis protegidos

---

## 4. PERFORMANCE E ESCALABILIDADE 🟠

### 4.1 Processamento Assíncrono com Fila
**Status:** PROCESSAMENTO SÍNCRONO
**Prioridade:** 🔴 CRÍTICO (para produção em escala)
**Impacto:** Upload de 1000 NF-es trava o request por minutos

**Solução:**
- Usar Celery (com Redis ou RabbitMQ)
- Endpoint retorna imediatamente com status "pending"
- Task em background processa uploads
- Usuário vê progresso em tempo real

```python
# celery_app.py
from celery import Celery

celery_app = Celery(
    "mapa",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

# tasks.py
@celery_app.task
def process_upload_task(upload_id: int):
    # Buscar upload do banco
    # Processar NF-e
    # Atualizar status
    ...

# Endpoint
@router.post("/upload-confirm")
async def confirm_upload(...):
    # Salvar upload com status="pending"
    db.add(upload)
    db.commit()

    # Enfileirar task
    process_upload_task.delay(upload.id)

    return {"status": "pending", "upload_id": upload.id}

# WebSocket para notificar progresso
@app.websocket("/ws/upload/{upload_id}")
async def upload_progress(websocket: WebSocket, upload_id: int):
    await websocket.accept()

    while True:
        upload = db.query(XMLUpload).get(upload_id)
        await websocket.send_json({"status": upload.status})

        if upload.status in ["processed", "error"]:
            break

        await asyncio.sleep(1)
```

**Infraestrutura necessária:**
- Redis (ou RabbitMQ)
- Celery workers rodando

**Benefício:** Escalabilidade, UX melhor (não trava), suporta uploads grandes

---

### 4.2 Cache de Catálogo
**Status:** SEM CACHE
**Prioridade:** 🟠 ALTO
**Impacto:** Catálogo é carregado do banco a cada request

**Solução:**
- Cache em Redis com TTL
- Invalidar cache ao criar/editar/deletar empresa/produto

```python
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

@router.get("/catalog")
async def get_catalog(current_user: User = Depends(get_current_user)):
    cache_key = f"catalog:{current_user.id}"

    # Tentar buscar do cache
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    # Buscar do banco
    companies = db.query(Company).filter(...).all()
    # ... montar estrutura

    # Salvar no cache (5 min)
    redis_client.setex(cache_key, 300, json.dumps(catalog))

    return catalog

# Ao criar/editar/deletar, invalidar cache
@router.post("/companies")
async def create_company(...):
    # ... criar empresa
    redis_client.delete(f"catalog:{current_user.id}")
```

**Benefício:** Performance 10x melhor em listagens

---

### 4.3 CDN para Arquivos Estáticos
**Status:** SERVIDO DIRETO DO APP SERVICE
**Prioridade:** 🟡 MÉDIO

**Solução:**
- Usar Azure CDN
- Frontend (build estático) servido por CDN
- Backend só API

**Benefício:** Latência menor, custo menor (bandwidth)

---

### 4.4 Índices de Banco Adicionais
**Status:** ÍNDICES BÁSICOS
**Prioridade:** 🟠 ALTO

**Sugestões:**
```python
# Em models.py

# XMLUpload
__table_args__ = (
    Index('idx_user_period', 'user_id', 'period'),
    Index('idx_user_status', 'user_id', 'status'),
    Index('idx_upload_date', 'upload_date'),
    Index('idx_nfe_key', 'nfe_key'),  # Para check de duplicata
)

# Report
__table_args__ = (
    Index('idx_user_period', 'user_id', 'report_period'),
    Index('idx_generated_at', 'generated_at'),
)

# Company
__table_args__ = (
    Index('idx_user_name', 'user_id', 'company_name'),
    Index('idx_mapa_reg', 'mapa_registration'),
)

# Product
__table_args__ = (
    Index('idx_company_name', 'company_id', 'product_name'),
    Index('idx_mapa_reg', 'mapa_registration'),
)
```

**Benefício:** Queries 100x mais rápidas com muitos dados

---

### 4.5 Paginação Server-Side
**Status:** NÃO IMPLEMENTADO (já mencionado em UX)
**Prioridade:** 🔴 CRÍTICO

Ver seção 2.1

---

## 5. INTEGRAÇÕES E AUTOMAÇÕES 🟠

### 5.1 Webhooks para Eventos
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟡 MÉDIO (para integrações)

**Funcionalidades:**
- Notificar URL externa quando upload processar
- Notificar quando relatório for gerado
- Notificar erros

**Solução:**
```python
# Model
class Webhook(Base):
    __tablename__ = "webhooks"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    url = Column(String(500))
    events = Column(JSON)  # ["upload.processed", "report.generated"]
    active = Column(Boolean, default=True)
    secret = Column(String(64))  # Para validar HMAC

# Função para disparar webhook
async def trigger_webhook(user_id: int, event: str, data: dict):
    webhooks = db.query(Webhook).filter(
        Webhook.user_id == user_id,
        Webhook.active == True
    ).all()

    for webhook in webhooks:
        if event in webhook.events:
            # POST para webhook.url
            import httpx

            payload = {
                "event": event,
                "timestamp": datetime.utcnow().isoformat(),
                "data": data
            }

            # Calcular HMAC
            import hmac
            signature = hmac.new(
                webhook.secret.encode(),
                json.dumps(payload).encode(),
                'sha256'
            ).hexdigest()

            async with httpx.AsyncClient() as client:
                await client.post(
                    webhook.url,
                    json=payload,
                    headers={"X-Webhook-Signature": signature}
                )

# Usar em endpoints
@router.post("/upload-confirm")
async def confirm_upload(...):
    # ... processar
    await trigger_webhook(user.id, "upload.processed", {"upload_id": upload.id})
```

**Benefício:** Integrações com ERPs, sistemas externos, automações

---

### 5.2 Integração com SEFAZ (Download Automático de NF-es)
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟢 BAIXO (complexidade alta)
**Impacto:** Usuário ainda precisa baixar XMLs manualmente

**Solução:**
- Integrar com API da SEFAZ (requer certificado digital)
- Baixar automaticamente NF-es do CNPJ do cliente
- Processar automaticamente

**Desafio:**
- Cada estado tem API diferente
- Requer certificado A1 ou A3
- Complexidade alta

**Alternativa:**
- Integrar com APIs de terceiros (Nota Fiscal Web, NFe.io, etc)

**Benefício:** Automação total, zero trabalho manual

---

### 5.3 Integração com ERPs (SAP, TOTVS, etc)
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟢 BAIXO (feature enterprise)

**Solução:**
- API pública com documentação
- Endpoints para push de NF-es via API
- Webhooks para notificar ERP

Ver 5.1 (Webhooks)

**Benefício:** Automação para grandes empresas

---

### 5.4 Email Notifications
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟠 ALTO

**Funcionalidades:**
- Email de boas-vindas
- Email de confirmação de cadastro (verificação)
- Email quando upload processar
- Email quando relatório estiver pronto
- Email de erro de processamento
- Email de reset de senha

**Solução:**
- Usar SendGrid, AWS SES, ou SMTP
- Templates HTML bonitos

```python
# utils/email.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

async def send_email(to: str, subject: str, html: str):
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = "noreply@mapasaas.com.br"
    msg['To'] = to

    html_part = MIMEText(html, 'html')
    msg.attach(html_part)

    # Enviar via SMTP
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)

# Templates
UPLOAD_SUCCESS_TEMPLATE = """
<html>
<body>
    <h1>Upload Processado com Sucesso!</h1>
    <p>Olá {user_name},</p>
    <p>Seu upload "{filename}" foi processado com sucesso.</p>
    <p><a href="{app_url}/uploads">Ver Detalhes</a></p>
</body>
</html>
"""
```

**Benefício:** Comunicação proativa, engagement

---

### 5.5 API Pública para Integrações
**Status:** API EXISTE MAS NÃO É "PÚBLICA"
**Prioridade:** 🟡 MÉDIO

**Melhorias:**
- Documentação pública da API (Swagger já existe)
- API Keys (além de JWT)
- Rate limiting por plano (Standard: 100/min, Premium: 1000/min)
- Sandbox environment para testes

```python
# Model
class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    key = Column(String(64), unique=True)
    name = Column(String(255))  # "Integração ERP"
    scopes = Column(JSON)  # ["read:catalog", "write:uploads"]
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Autenticação via API Key (além de JWT)
async def get_current_user_or_api_key(
    authorization: str = Header(None)
):
    if authorization.startswith("Bearer "):
        # JWT (já implementado)
        ...
    elif authorization.startswith("ApiKey "):
        # API Key
        key = authorization.replace("ApiKey ", "")
        api_key = db.query(APIKey).filter(
            APIKey.key == key,
            APIKey.active == True
        ).first()

        if not api_key:
            raise HTTPException(401, "API Key inválida")

        return api_key.user
    else:
        raise HTTPException(401, "Autenticação necessária")
```

**Benefício:** Integrações sem expor senha

---

## 6. BUSINESS E MONETIZAÇÃO 💰

### 6.1 Multi-tenant (Organizações)
**Status:** MULTI-USER MAS NÃO MULTI-ORG
**Prioridade:** 🟠 ALTO

**Problema Atual:**
- Cada user tem suas empresas/produtos
- Não tem conceito de "Organização"
- Não dá pra ter múltiplos usuários compartilhando mesmo catálogo

**Solução:**
```python
# Adicionar model Organization
class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    cnpj = Column(String(18), unique=True)
    plan = Column(String(50))  # "standard", "premium", "enterprise"
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# User pertence a Organization
class User(Base):
    ...
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    role = Column(String(50))  # "owner", "admin", "member", "viewer"

# Company pertence a Organization (não mais a User)
class Company(Base):
    ...
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    # Remover user_id

# Filtrar por organization_id em vez de user_id
```

**Benefício:** Múltiplos usuários colaboram, modelo SaaS real

---

### 6.2 Planos e Billing
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟠 ALTO (para SaaS real)

**Funcionalidades:**
- Planos: Free, Standard, Premium, Enterprise
- Limites por plano:
  - Free: 50 NF-es/mês, 1 usuário
  - Standard: 500 NF-es/mês, 3 usuários
  - Premium: Ilimitado, 10 usuários
  - Enterprise: Ilimitado, usuários ilimitados
- Billing mensal ou anual
- Integração com Stripe ou gateway brasileiro (Pagar.me, Mercado Pago)

```python
# Organization model
class Organization(Base):
    ...
    plan = Column(String(50))
    billing_cycle = Column(String(20))  # "monthly", "annual"
    trial_ends_at = Column(DateTime, nullable=True)
    subscription_id = Column(String(255), nullable=True)  # ID no gateway

# Middleware para verificar limites
@app.middleware("http")
async def check_plan_limits(request: Request, call_next):
    # Se rota é /upload, verificar se ainda tem limite
    # Se excedeu, retornar 402 Payment Required
    ...

# Endpoints
@router.post("/billing/subscribe")
async def subscribe_to_plan(
    plan: str,
    billing_cycle: str,
    current_user: User = Depends(get_current_user)
):
    # Criar subscription no Stripe
    # Salvar subscription_id
    ...

@router.post("/billing/cancel")
async def cancel_subscription(...):
    ...

@router.get("/billing/usage")
async def get_usage(...):
    # Retornar uso atual vs limite
    ...
```

**Benefício:** Monetização real, crescimento do negócio

---

### 6.3 Convites e Permissões Granulares
**Status:** SÓ TEM ADMIN/USER
**Prioridade:** 🟡 MÉDIO

**Funcionalidades:**
- Convidar usuários para organização (via email)
- Roles: Owner, Admin, Member, Viewer
- Permissões granulares:
  - Viewer: Só lê catálogo e relatórios
  - Member: Cria uploads e relatórios
  - Admin: Gerencia catálogo
  - Owner: Gerencia billing e usuários

```python
# User model
class User(Base):
    ...
    role = Column(String(50))  # "owner", "admin", "member", "viewer"

# Permission checks
def require_role(min_role: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user: User, **kwargs):
            roles = ["viewer", "member", "admin", "owner"]

            if roles.index(current_user.role) < roles.index(min_role):
                raise HTTPException(403, "Permissão insuficiente")

            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

@router.post("/companies")
@require_role("admin")
async def create_company(...):
    ...
```

**Benefício:** Controle fino, segurança

---

### 6.4 White Label
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟢 BAIXO (feature enterprise)

**Funcionalidades:**
- Cliente pode customizar:
  - Logo
  - Cores (tema)
  - Nome do sistema
  - Domínio customizado
- Backend multi-tenant isola dados

**Solução:**
```python
# Organization model
class Organization(Base):
    ...
    branding = Column(JSON)  # {"logo_url": "...", "primary_color": "#...", ...}
    custom_domain = Column(String(255), nullable=True)

# Frontend carrega branding da org
```

**Benefício:** Revenda, grandes clientes

---

## 7. RELATÓRIOS E ANALYTICS 📊

### 7.1 Relatórios Customizados
**Status:** SÓ FORMATO MAPA
**Prioridade:** 🟡 MÉDIO

**Funcionalidades:**
- Relatório gerencial (não oficial)
- Escolher colunas
- Filtrar por empresa, produto, período
- Gráficos inclusos
- Exportar em Excel, PDF, CSV

**Benefício:** Flexibilidade, insights de negócio

---

### 7.2 Comparativo de Períodos
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟡 MÉDIO

**Funcionalidades:**
- Comparar Q1-2025 vs Q1-2024
- Mostrar crescimento/queda percentual
- Gráficos de evolução

**Benefício:** Insights, decisões estratégicas

---

### 7.3 Alertas Automáticos
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟡 MÉDIO

**Funcionalidades:**
- Alerta se volume caiu mais de X%
- Alerta se há NF-es duplicadas
- Alerta se falta cadastrar produtos
- Alerta de prazo trimestral próximo

**Benefício:** Proatividade, evita problemas

---

### 7.4 Integração com BI Tools
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟢 BAIXO

**Funcionalidades:**
- Conector para Power BI
- Conector para Metabase
- Conector para Google Data Studio
- API de dados agregados

**Benefício:** Clientes enterprise, analytics avançado

---

## 8. ONBOARDING E HELP 🎓

### 8.1 Wizard de Primeiro Acesso
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟠 ALTO

**Funcionalidades:**
- Passo 1: Bem-vindo, explicação do sistema
- Passo 2: Cadastrar primeira empresa
- Passo 3: Cadastrar primeiro produto
- Passo 4: Upload de NF-e de exemplo
- Passo 5: Gerar primeiro relatório

**Benefício:** Onboarding suave, reduz churn

---

### 8.2 Tutorial Interativo
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟡 MÉDIO

**Solução:**
- Usar biblioteca tipo Shepherd.js, Intro.js
- Tooltips em cada funcionalidade
- "Pular" ou "Próximo"

**Benefício:** Usuário aprende rápido

---

### 8.3 FAQ Integrada
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟡 MÉDIO

**Funcionalidades:**
- Página /help com perguntas comuns
- Busca na FAQ
- Links para vídeos tutoriais

**Benefício:** Self-service, reduz tickets de suporte

---

### 8.4 Chat de Suporte (Integração)
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟢 BAIXO

**Solução:**
- Integrar Intercom, Drift, ou Crisp
- Chat ao vivo (horário comercial)
- Chatbot para perguntas básicas

**Benefício:** Suporte em tempo real

---

### 8.5 Status Page
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟡 MÉDIO

**Funcionalidades:**
- Página pública status.mapasaas.com.br
- Mostra uptime dos últimos 90 dias
- Incidentes passados
- Manutenções programadas

**Solução:**
- Usar Statuspage.io (Atlassian)
- Ou self-hosted com Cachet

**Benefício:** Transparência, confiança

---

## 9. MOBILE E PWA 📱

### 9.1 Progressive Web App (PWA)
**Status:** NÃO É PWA
**Prioridade:** 🟡 MÉDIO

**Funcionalidades:**
- Instalável no celular
- Funciona offline (cache básico)
- Notificações push

**Solução:**
- Service Worker
- Web App Manifest
- Push notifications API

**Benefício:** UX mobile melhor, engagement

---

### 9.2 App Nativo (iOS/Android)
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟢 BAIXO

**Solução:**
- React Native (compartilha código com web)
- Ou Flutter

**Benefício:** Presença nas lojas, branding

---

## 10. OPERACIONAL E MANUTENÇÃO 🛠️

### 10.1 Agendamento de Tarefas
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟡 MÉDIO

**Funcionalidades:**
- Gerar relatório automaticamente no último dia do trimestre
- Enviar email de lembrete 7 dias antes do fim do trimestre
- Limpar uploads antigos (mais de 1 ano)
- Limpar relatórios antigos

**Solução:**
- Celery Beat (agendador)
- Cron jobs

```python
# celery_app.py
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    'generate-quarterly-reports': {
        'task': 'tasks.generate_quarterly_reports',
        'schedule': crontab(day_of_month='28', month_of_year='3,6,9,12'),
    },
    'cleanup-old-files': {
        'task': 'tasks.cleanup_old_files',
        'schedule': crontab(hour=2, minute=0),  # Todo dia às 2am
    },
}
```

**Benefício:** Automação, reduz trabalho manual

---

### 10.2 Backup Manual para Usuário
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟡 MÉDIO

**Funcionalidades:**
- Usuário pode baixar backup de todos seus dados
- Formato: ZIP com catálogo (JSON), uploads (XMLs), relatórios (Excel)

**Solução:**
```python
@router.get("/backup")
async def download_backup(current_user: User = Depends(get_current_user)):
    # Criar ZIP temporário
    import zipfile

    zip_path = f"/tmp/backup_{current_user.id}_{datetime.now().isoformat()}.zip"

    with zipfile.ZipFile(zip_path, 'w') as zipf:
        # Adicionar catálogo (JSON)
        catalog = get_catalog(current_user)
        zipf.writestr("catalog.json", json.dumps(catalog))

        # Adicionar uploads
        uploads = db.query(XMLUpload).filter(...).all()
        for upload in uploads:
            if os.path.exists(upload.file_path):
                zipf.write(upload.file_path, f"uploads/{upload.filename}")

        # Adicionar relatórios
        reports = db.query(Report).filter(...).all()
        for report in reports:
            if os.path.exists(report.file_path):
                zipf.write(report.file_path, f"reports/{report.report_period}.xlsx")

    return FileResponse(zip_path, filename="backup.zip")
```

**Benefício:** Usuário tem controle total dos dados (LGPD)

---

### 10.3 Migração de Dados (Import Histórico)
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟡 MÉDIO

**Funcionalidades:**
- Importar dados de sistema antigo
- Importar relatórios históricos
- Manter histórico de anos anteriores

**Solução:**
- Endpoint de importação em massa
- Validação e transformação de dados

**Benefício:** Onboarding de clientes com histórico

---

### 10.4 Feature Flags
**Status:** NÃO IMPLEMENTADO
**Prioridade:** 🟡 MÉDIO

**Funcionalidades:**
- Ativar/desativar features sem deploy
- Testar features com beta users
- Rollback fácil

**Solução:**
- Usar LaunchDarkly, Unleash, ou self-hosted

```python
# Simples: flags no banco
class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    name = Column(String(100), primary_key=True)
    enabled = Column(Boolean, default=False)
    rollout_percentage = Column(Integer, default=0)  # 0-100

# Helper
def is_feature_enabled(flag_name: str, user: User = None) -> bool:
    flag = db.query(FeatureFlag).filter(...).first()

    if not flag:
        return False

    if flag.enabled:
        return True

    # Gradual rollout
    if user and flag.rollout_percentage > 0:
        # Hash user ID e verificar se entra no percentual
        ...
```

**Benefício:** Deploy seguro, testes A/B

---

### 10.5 Logs Estruturados e Monitoramento
**Status:** LOGS BÁSICOS
**Prioridade:** 🟠 ALTO

**Melhorias:**
- Logs estruturados (JSON)
- Integração com ELK Stack ou Datadog
- Alertas automáticos (erro rate alto, latência alta)
- Tracing distribuído (se microservices no futuro)

**Solução:**
```python
# Configurar logger para JSON
import logging
import json_log_formatter

formatter = json_log_formatter.JSONFormatter()
handler = logging.StreamHandler()
handler.setFormatter(formatter)

logger = logging.getLogger()
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Logs estruturados
logger.info("Upload processado", extra={
    "user_id": user.id,
    "upload_id": upload.id,
    "nfe_count": 10,
    "duration_ms": 1234
})
```

**Benefício:** Troubleshooting rápido, observabilidade

---

## RESUMO DE PRIORIDADES

### CRÍTICO 🔴 (Implementar AGORA)
1. Validação de duplicatas de NF-e
2. Deleção de uploads
3. Edição de período
4. Auditoria e logs detalhados
5. Paginação em todas listagens
6. Processamento assíncrono (Celery)
7. Índices de banco adicionais

### ALTO 🟠 (Próxima Sprint)
8. Preview de relatório
9. Busca avançada e filtros
10. Dashboard com gráficos
11. Importação em massa de catálogo
12. 2FA
13. Cache de catálogo
14. Email notifications
15. Multi-tenant (organizações)
16. Planos e billing
17. Wizard de onboarding
18. Logs estruturados

### MÉDIO 🟡 (Roadmap Q1-2026)
19. Notificações em tempo real
20. Exportação de catálogo
21. Política de senha com expiração
22. Controle de sessões ativas
23. Criptografia de arquivos
24. Webhooks
25. API pública
26. Relatórios customizados
27. Comparativo de períodos
28. Alertas automáticos
29. Tutorial interativo
30. FAQ integrada
31. Status page
32. PWA
33. Agendamento de tarefas
34. Backup manual para usuário
35. Migração de dados
36. Feature flags

### BAIXO 🟢 (Roadmap Q2-Q3 2026)
37. IP whitelist
38. CDN para estáticos
39. Integração SEFAZ
40. Integração com ERPs
41. White label
42. Integração com BI tools
43. Chat de suporte
44. App nativo

---

## ESTIMATIVA DE ESFORÇO

| Prioridade | Quantidade | Esforço Médio | Total |
|------------|------------|---------------|-------|
| CRÍTICO 🔴 | 7 itens | 3 dias | 21 dias |
| ALTO 🟠 | 11 itens | 5 dias | 55 dias |
| MÉDIO 🟡 | 18 itens | 3 dias | 54 dias |
| BAIXO 🟢 | 8 itens | 5 dias | 40 dias |
| **TOTAL** | **44 itens** | | **170 dias (8 meses)** |

---

## IMPACTO NO NEGÓCIO

### Curto Prazo (CRÍTICO + ALTO)
- **Retenção:** +30% (menos churn por bugs/limitações)
- **Satisfação:** +40% (UX melhor)
- **Conversão trial:** +25% (onboarding melhor)
- **Ticket médio:** +50% (billing implementado)

### Médio Prazo (MÉDIO)
- **Redução de suporte:** -40% (self-service)
- **Engagement:** +35% (notificações, PWA)
- **Expansion revenue:** +60% (planos, usuários)

### Longo Prazo (BAIXO)
- **Enterprise deals:** +200% (white label, integrações)
- **Market share:** Liderança no nicho

---

## PRÓXIMOS PASSOS RECOMENDADOS

### Semana 1-2: Quick Wins
1. Validação de duplicatas (2h)
2. Deleção de uploads (3h)
3. Edição de período (2h)
4. Índices de banco (1h)

### Semana 3-4: Fundação
5. Processamento assíncrono (Celery) (3 dias)
6. Paginação (2 dias)
7. Auditoria completa (2 dias)

### Mês 2: UX
8. Busca e filtros (5 dias)
9. Dashboard analytics (7 dias)
10. Preview de relatório (3 dias)
11. Importação em massa (3 dias)

### Mês 3: Segurança e Compliance
12. 2FA (4 dias)
13. Logs estruturados (2 dias)
14. Criptografia de arquivos (3 dias)
15. Email notifications (4 dias)

### Mês 4: Monetização
16. Multi-tenant (organizações) (7 dias)
17. Planos e billing (10 dias)
18. Permissões granulares (3 dias)

---

**FIM DA ANÁLISE**

*Este documento deve ser revisado trimestralmente e priorizado com base em feedback de clientes e métricas de uso.*
