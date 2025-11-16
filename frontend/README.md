# MAPA SaaS Frontend

Frontend moderno em React com tema verde esmeralda para o sistema MAPA SaaS.

## 🎨 Características

- ✅ **Design Moderno**: Interface limpa com tema verde esmeralda
- ✅ **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- ✅ **Autenticação JWT**: Sistema seguro de login
- ✅ **Dashboard Interativo**: Cards estatísticos e ações rápidas
- ✅ **Sidebar Navegável**: Menu lateral com todos os módulos
- ✅ **Tailwind CSS**: Estilização moderna e customizável
- ✅ **Lucide Icons**: Ícones bonitos e consistentes

## 🚀 Como Rodar

### Pré-requisitos

- Node.js 18+ instalado
- Backend MAPA SaaS rodando em: https://mapa-app-clean-8270.azurewebsites.net

### Instalação

```bash
# 1. Entre na pasta do frontend
cd /home/user/mapa/frontend

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

O frontend vai rodar em: **http://localhost:3000**

### Build para Produção

```bash
npm run build
```

Os arquivos de produção ficarão em `dist/`

## 🔐 Credenciais de Teste

Use as credenciais que você criou:
- **Email**: rhyan.hdr@gmail.com
- **Senha**: 06080220@Rhyan

## 📁 Estrutura

```
frontend/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   └── Layout.jsx   # Layout com sidebar e navbar
│   ├── contexts/        # Context API
│   │   └── AuthContext.jsx  # Gerenciamento de autenticação
│   ├── pages/           # Páginas da aplicação
│   │   ├── Login.jsx    # Página de login
│   │   └── Dashboard.jsx # Dashboard principal
│   ├── services/        # Serviços de API
│   │   └── api.js       # Integração com backend
│   ├── App.jsx          # Componente raiz
│   ├── main.jsx         # Entry point
│   └── index.css        # Estilos globais
├── public/              # Arquivos estáticos
├── index.html           # HTML principal
├── package.json         # Dependências
├── vite.config.js       # Configuração Vite
└── tailwind.config.js   # Configuração Tailwind
```

## 🎨 Tema de Cores

O tema verde esmeralda está configurado no `tailwind.config.js`:

- **Primary**: #10b981 (Verde Esmeralda)
- **Primary Dark**: #047857
- **Primary Light**: #34d399

## 🔧 Tecnologias

- **React 18** - Framework UI
- **Vite** - Build tool
- **React Router** - Roteamento
- **Tailwind CSS** - Estilização
- **Axios** - HTTP client
- **Lucide React** - Ícones

## 📱 Funcionalidades Disponíveis

### Implementadas:
- ✅ Login com autenticação JWT
- ✅ Dashboard com estatísticas
- ✅ Sidebar navegável
- ✅ Proteção de rotas
- ✅ Logout
- ✅ Design responsivo

### Em Desenvolvimento:
- 🔄 Upload de XMLs
- 🔄 Gestão de Empresas
- 🔄 Gestão de Produtos
- 🔄 Geração de Relatórios
- 🔄 Visualização de Catálogo
- 🔄 Gestão de Usuários (Admin)

## 🌐 API

O frontend se conecta automaticamente com a API em:
`https://mapa-app-clean-8270.azurewebsites.net/api`

A configuração está em `src/services/api.js`

## 💡 Dicas

1. **Hot Reload**: O Vite atualiza automaticamente quando você edita arquivos
2. **Console**: Abra o DevTools (F12) para ver logs e debug
3. **Token**: O token JWT é salvo no localStorage automaticamente
4. **Rotas**: Use `/dashboard`, `/upload`, `/companies`, etc.

## 🎯 Próximos Passos

1. **Implementar páginas completas** para cada módulo
2. **Adicionar formulários** de criação/edição
3. **Implementar upload** de arquivos XML
4. **Adicionar gráficos** no dashboard
5. **Deploy** para produção (Azure Static Web Apps, Vercel, etc.)

---

**Desenvolvido com** ❤️ **e** 🟢 **verde esmeralda**
