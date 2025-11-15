# 📝 Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-11-11

### ✨ Adicionado
- Sistema de autenticação completo com JWT
- Painel administrativo para gerenciamento de usuários
- Upload de arquivos XML de NF-e
- Upload de arquivos PDF (DANFE)
- Processamento automático de NF-e
- Extração de dados de XML com lxml
- Extração de dados de PDF com pdfplumber
- Geração de relatório trimestral MAPA em Excel
- Dashboard do usuário com visualização de uploads
- Dashboard do administrador com CRUD de usuários
- Sistema de download de relatórios
- Interface moderna e responsiva
- Validação de arquivos
- Feedback visual em tempo real
- Drag & Drop para upload
- Documentação completa da API (Swagger/ReDoc)
- README.md detalhado
- Guia de instalação para Windows e Linux/Mac
- Script de criação de usuário admin
- Estrutura de banco de dados PostgreSQL
- Isolamento de dados por usuário
- Criptografia de senhas com bcrypt
- Tratamento de erros robusto

### 🔒 Segurança
- Autenticação JWT com expiração de token
- Senhas criptografadas com bcrypt
- Validação de entrada de dados
- Proteção CORS configurável
- Isolamento de dados entre usuários

### 📚 Documentação
- README.md completo com tutorial passo a passo
- Documentação da API com Swagger UI
- Guia de contribuição (CONTRIBUTING.md)
- Changelog (este arquivo)
- Licença MIT
- Comentários no código

### 🎨 Interface
- Design moderno e limpo
- Tema claro com gradientes sutis
- Animações suaves
- Responsivo para mobile/tablet
- Cards informativos
- Feedback visual de ações
- Estados de loading
- Mensagens de erro amigáveis

## [Unreleased]

### 🔮 Planejado
- [ ] Testes automatizados (pytest)
- [ ] Upload em lote
- [ ] Processamento assíncrono com Celery
- [ ] Filtros e busca na lista de arquivos
- [ ] Exportação de relatórios em PDF
- [ ] Gráficos e estatísticas
- [ ] Notificações por e-mail
- [ ] API REST completa para integrações
- [ ] Suporte a mais formatos de relatório
- [ ] Sistema de auditoria (logs)
- [ ] Backup automático
- [ ] Multi-tenancy
- [ ] Internacionalização (i18n)
- [ ] Dark mode
- [ ] PWA (Progressive Web App)

---

## Formato das Versões

- **[MAJOR]**: Mudanças incompatíveis na API
- **[MINOR]**: Novas funcionalidades compatíveis
- **[PATCH]**: Correções de bugs compatíveis

## Tipos de Mudanças

- **✨ Adicionado**: Novas funcionalidades
- **🔄 Alterado**: Mudanças em funcionalidades existentes
- **❌ Depreciado**: Funcionalidades que serão removidas
- **🗑️ Removido**: Funcionalidades removidas
- **🐛 Corrigido**: Correções de bugs
- **🔒 Segurança**: Correções de vulnerabilidades
```

---

## 📄 **Arquivo Adicional: .dockerignore**

Para futuros deploys com Docker:

### 📄 **[Arquivo: .dockerignore]**
```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Environment
.env
.env.local
.env.*.local

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# Uploads and reports
uploads/
reports/

# Database
*.db
*.sqlite
*.sqlite3

# Logs
*.log

# OS
.DS_Store
Thumbs.db
.directory

# Git
.git/
.gitignore
.gitattributes

# Documentation
README.md
CONTRIBUTING.md
CHANGELOG.md
LICENSE

# CI/CD
.github/
.gitlab-ci.yml
azure-pipelines.yml

# Testing
.pytest_cache/
.coverage
htmlcov/
.tox/

# Node (if using)
node_modules/
npm-debug.log