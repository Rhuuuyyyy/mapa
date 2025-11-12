# MAPA SaaS - Automação de Relatórios Trimestrais

Sistema de automação de relatórios trimestrais do MAPA a partir de arquivos XML de NF-e.

## 🚀 Tecnologias

- **Backend**: FastAPI + Python 3.9+
- **Banco de Dados**: PostgreSQL (Azure Database for PostgreSQL)
- **Autenticação**: JWT (JSON Web Tokens)
- **Deploy**: Microsoft Azure Web Apps

## 📋 Requisitos

- Python 3.9 ou superior
- PostgreSQL 12 ou superior
- pip (gerenciador de pacotes Python)

## 🔧 Instalação Local

1. Clone o repositório
2. Crie um ambiente virtual:
```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
```

3. Instale as dependências:
```bash
   pip install -r requirements.txt
```

4. Configure as variáveis de ambiente:
```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
```

5. Execute as migrações do banco de dados (automático ao iniciar)

6. Inicie o servidor:
```bash
   uvicorn app.main:app --reload
```

7. Acesse: http://localhost:8000

## 📚 Documentação da API

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🏗️ Estrutura do Projeto
```
mapa-saas/
├── app/                    # Aplicação principal
│   ├── routers/           # Endpoints da API
│   ├── utils/             # Utilitários e processadores
│   ├── models.py          # Modelos do banco de dados
│   ├── schemas.py         # Schemas Pydantic
│   └── auth.py            # Autenticação e segurança
├── static/                # Arquivos estáticos
├── templates/             # Templates HTML
└── uploads/               # Arquivos XML enviados
```

## 🔐 Usuário Administrador Padrão

Será criado no próximo passo.

## 📝 Próximos Passos

- Implementar lógica específica de processamento XML NF-e
- Desenvolver geração de relatórios MAPA
- Criar interface frontend completa
- Configurar deploy no Azure