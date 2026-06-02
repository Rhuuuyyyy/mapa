# Análise de Custos Altos - MAPA SaaS Azure

**Data:** 22 de Novembro de 2025
**Custo Mensal:** R$ 100,00 (50% App Service + 50% Banco de Dados)

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **Queries SEM Paginação** - IMPACTO ALTO 💰💰💰

Vários endpoints carregam TODOS os dados de uma vez, sem limite:

| Endpoint | Arquivo | Linha | Problema |
|----------|---------|-------|----------|
| `GET /companies` | `user.py` | 224 | `.all()` sem limit |
| `GET /products` | `user.py` | 365 | `.all()` sem limit |
| `GET /catalog` | `user.py` | 451 | `.all()` sem limit (empresas + produtos) |
| `GET /uploads` | `user.py` | 734 | `.all()` sem limit |
| `GET /reports` | `user.py` | 1124 | `.all()` sem limit |

**Impacto:**
- **Banco:** Queries pesadas consomem muita CPU/memória (DTUs)
- **App:** Serialização de muitos objetos consome memória
- **Rede:** Transferência de dados desnecessária

**Exemplo:** Se um usuário tem 10.000 produtos, toda vez que acessar o catálogo, vai:
1. Fazer query de 10.000 linhas no banco
2. Carregar 10.000 objetos na memória do app
3. Serializar 10.000 produtos para JSON
4. Transferir megabytes de dados

---

### 2. **Pool de Conexões Pequeno** - IMPACTO MÉDIO 💰💰

```python
# database.py linha 19
pool_size=5,
max_overflow=10,
# Total: apenas 15 conexões simultâneas
```

**Problema:**
- Com múltiplos usuários fazendo requests, o pool se esgota
- Novas conexões ficam aguardando
- Azure PostgreSQL cobra por conexão ativa
- Pode estar abrindo/fechando conexões constantemente (overhead)

**Sintomas:**
- Timeout em requests
- Database connection errors
- Custo alto de banco mesmo com poucas queries

---

### 3. **Processamento Síncrono Pesado** - IMPACTO ALTO 💰💰💰

```python
# user.py linha 1076-1077
processor = MAPAProcessor(db, current_user.id)
result = processor.process_uploads(uploads)  # SÍNCRONO!
```

**Problema:**
- Processa TODOS os XMLs do período de forma síncrona
- Bloqueia o worker do Gunicorn/Uvicorn
- Se processar 100 XMLs, a request fica travada por minutos
- Azure App Service cobra por tempo de CPU

**Impacto:**
- Workers bloqueados = precisa de mais workers
- Mais workers = maior SKU do App Service = mais caro
- Se tiver apenas 2 workers e 2 requests pesadas, app trava

---

### 4. **Falta de Cache** - IMPACTO MÉDIO 💰💰

**Não há cache em lugar nenhum:**
- Catálogo é buscado do banco toda vez
- Companies/Products são buscados repetidamente
- Sem Redis ou cache em memória

**Exemplo:**
Se um usuário acessa a tela de upload 100x por dia:
- 100 queries para buscar companies
- 100 queries para buscar products
- 100 queries desnecessárias!

---

### 5. **Queries N+1 Potenciais** - IMPACTO MÉDIO 💰

```python
# user.py linha 442-451
companies = db.query(models.Company)...
return [
    {
        "company_id": c.id,
        "products": db.query(models.Product).filter(...).all()  # N+1!
    }
]
```

**Problema:**
- 1 query para pegar companies
- N queries para pegar products de cada company
- Com 100 companies = 101 queries ao invés de 2!

---

### 6. **Logs Excessivos em Debug** - IMPACTO BAIXO 💰

```python
# database.py linha 22
echo=settings.debug  # SQL queries no log
```

Se `DEBUG=True` em produção:
- Loga TODA query SQL
- Consome I/O de disco
- Pode gerar gigabytes de logs
- Azure cobra por armazenamento

---

## 📊 ESTIMATIVA DE IMPACTO

### Cenário Atual (100 usuários ativos/dia):

| Operação | Frequência | Queries/Op | Total Queries/Dia |
|----------|------------|------------|-------------------|
| Listar Catálogo | 100x | 100-1000 | 10.000-100.000 |
| Listar Uploads | 200x | 1 | 200 |
| Gerar Relatório | 50x | 500+ | 25.000+ |
| **TOTAL** | - | - | **~35.000-125.000** |

### Custo por Componente:

**Azure Database for PostgreSQL (R$ 50/mês):**
- Basic tier provavelmente
- 1-2 vCores
- Gasta muito em DTU por queries pesadas
- Conexões ativas custam recursos

**App Service (R$ 50/mês):**
- Provavelmente B1 ou B2 tier
- Workers ficam bloqueados em processamento
- Precisa de tier maior por causa de workers travados

---

## ✅ SOLUÇÕES RECOMENDADAS

### PRIORIDADE 1 (Economia estimada: 40-60%)

#### 1.1 Adicionar Paginação em TODOS os endpoints

```python
# Antes
@router.get("/companies")
async def list_companies(db: Session = Depends(get_db), ...):
    companies = db.query(models.Company).all()  # RUIM

# Depois
@router.get("/companies")
async def list_companies(
    page: int = 1,
    page_size: int = 50,  # Limite padrão
    db: Session = Depends(get_db),
    ...
):
    skip = (page - 1) * page_size
    companies = db.query(models.Company)\
        .offset(skip)\
        .limit(page_size)\
        .all()

    total = db.query(models.Company).count()

    return {
        "items": companies,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }
```

#### 1.2 Otimizar Pool de Conexões

```python
# database.py
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=10,        # Aumentar para 10
    max_overflow=20,     # Aumentar para 20
    pool_recycle=300,    # Reciclar a cada 5min (menos que antes)
    echo=False,          # NUNCA em produção
    pool_timeout=30,     # Timeout para pegar conexão
)
```

#### 1.3 Processar XMLs de Forma Assíncrona

```python
# Usar background tasks ou fila (Celery/Redis)
from fastapi import BackgroundTasks

@router.post("/generate-report")
async def generate_report(
    background_tasks: BackgroundTasks,
    request: schemas.ReportGenerateRequest,
    ...
):
    # Iniciar processamento em background
    background_tasks.add_task(process_report_async, uploads, user_id)

    return {
        "message": "Relatório sendo processado. Você receberá uma notificação."
    }
```

### PRIORIDADE 2 (Economia estimada: 20-30%)

#### 2.1 Adicionar Cache com Redis

```python
import redis
from functools import lru_cache

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

@router.get("/catalog")
async def get_catalog(current_user: models.User = Depends(...)):
    cache_key = f"catalog:user:{current_user.id}"

    # Tentar cache primeiro
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    # Se não tem cache, buscar do banco
    catalog = db.query(...).all()

    # Salvar no cache por 5 minutos
    redis_client.setex(cache_key, 300, json.dumps(catalog))

    return catalog
```

#### 2.2 Resolver Queries N+1 com Eager Loading

```python
from sqlalchemy.orm import joinedload

# Antes (N+1)
companies = db.query(models.Company).all()
for company in companies:
    products = company.products  # Query extra!

# Depois (1 query)
companies = db.query(models.Company)\
    .options(joinedload(models.Company.products))\
    .all()
```

### PRIORIDADE 3 (Economia estimada: 10-20%)

#### 3.1 Adicionar Índices no Banco

```sql
-- Índices para queries frequentes
CREATE INDEX idx_uploads_user_period ON xml_uploads(user_id, period);
CREATE INDEX idx_reports_user_period ON reports(user_id, report_period);
CREATE INDEX idx_products_company_name ON products(company_id, product_name);
```

#### 3.2 Configurar Compressão de Responses

```python
# main.py
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

---

## 🎯 PLANO DE AÇÃO IMEDIATO

### Semana 1 (Redução ~50% do custo):
1. ✅ Adicionar paginação em todos os endpoints
2. ✅ Aumentar pool de conexões
3. ✅ Garantir DEBUG=False em produção
4. ✅ Limitar rate limiting mais agressivo

### Semana 2 (Redução adicional ~20%):
5. ✅ Implementar cache Redis básico
6. ✅ Otimizar queries N+1
7. ✅ Adicionar índices no banco

### Semana 3 (Redução adicional ~10%):
8. ✅ Processamento assíncrono de relatórios
9. ✅ Compressão de responses
10. ✅ Monitoramento de queries lentas

---

## 💡 DICAS EXTRAS

### Verificar Tier do App Service
```bash
# Ver o SKU atual
az webapp show --name mapa-app-clean-8270 --resource-group your-rg \
  --query "sku.name"
```

Se estiver em **B2** ou superior, pode reduzir para **B1** após otimizações.

### Monitorar Queries Lentas

```python
# Adicionar ao database.py
import logging
from sqlalchemy import event

@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    conn.info.setdefault('query_start_time', []).append(time.time())

@event.listens_for(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - conn.info['query_start_time'].pop(-1)
    if total > 1.0:  # Queries > 1 segundo
        logger.warning(f"SLOW QUERY ({total:.2f}s): {statement}")
```

---

## 📈 RESULTADO ESPERADO

Com todas as otimizações implementadas:

| Componente | Custo Atual | Custo Estimado | Economia |
|------------|-------------|----------------|----------|
| App Service | R$ 50 | R$ 25-30 | 40-50% |
| Database | R$ 50 | R$ 20-25 | 50-60% |
| **TOTAL** | **R$ 100** | **R$ 45-55** | **45-55%** |

---

**Quer que eu implemente essas otimizações agora?**
