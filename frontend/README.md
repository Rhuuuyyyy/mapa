# SoloCloud Frontend

Frontend React moderno para o sistema SoloCloud - "Da Terra à Nuvem"

## Tecnologias

- **React 18** - Framework UI
- **Vite** - Build tool ultra-rápido
- **React Router v6** - Roteamento SPA
- **Tailwind CSS** - Estilização utility-first
- **Axios** - Cliente HTTP
- **Lucide React** - Biblioteca de ícones

## Estrutura

```
frontend/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Layout principal (sidebar + navbar)
│   ├── contexts/
│   │   └── AuthContext.jsx     # Contexto de autenticação
│   ├── pages/
│   │   ├── Login.jsx           # Página de login
│   │   ├── Dashboard.jsx       # Dashboard com estatísticas reais
│   │   ├── Profile.jsx         # Meu Perfil (estatísticas e atividades)
│   │   ├── Settings.jsx        # Configurações (perfil e senha)
│   │   ├── Companies.jsx       # CRUD de empresas
│   │   ├── Products.jsx        # CRUD de produtos
│   │   ├── UploadXML.jsx       # Upload e preview de XMLs
│   │   ├── Reports.jsx         # Geração e download de relatórios
│   │   ├── Catalog.jsx         # Visualização do catálogo
│   │   └── Users.jsx           # Gestão de usuários (admin only)
│   ├── services/
│   │   └── api.js              # Cliente API (Axios com interceptors)
│   ├── App.jsx                 # Rotas da aplicação
│   ├── main.jsx                # Entry point
│   └── index.css               # Estilos globais + Tailwind
├── public/
│   └── solocloud.svg           # Favicon (logo SoloCloud)
├── index.html                  # HTML template
├── tailwind.config.js          # Configuração Tailwind
├── vite.config.js              # Configuração Vite
└── package.json                # Dependências
```

## Como Rodar

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

### Build para Produção

```bash
npm run build
```

Os arquivos ficam em `dist/` e são servidos pelo FastAPI em produção.

## Identidade Visual

### Cores do Tema SoloCloud

| Cor | Hex | Variável Tailwind | Significado |
|-----|-----|-------------------|-------------|
| Emerald | #10b981 | `emerald-500` | SOLO (terra, agricultura) |
| Sky | #0ea5e9 | `sky-500` | CLOUD (nuvem, tecnologia) |
| Violet | #a855f7 | `violet-500` | TECH (inovação, premium) |

### Classes CSS Personalizadas

```css
/* Botões */
.btn-primary    /* Gradiente emerald→sky */
.btn-secondary  /* Outline emerald */
.btn-cloud      /* Azul sólido (sky) */
.btn-solo       /* Verde sólido (emerald) */

/* Cards e Inputs */
.card           /* Card branco com sombra */
.card-hover     /* Card com hover effect */
.input-field    /* Input estilizado */

/* Badges */
.badge-solo     /* Badge verde (emerald) */
.badge-cloud    /* Badge azul (sky) */

/* Gradientes de texto */
.text-gradient  /* Texto com gradiente tri-color */
```

### Gradientes

```jsx
// Gradiente principal (tri-color)
className="bg-gradient-to-r from-emerald-600 via-sky-600 to-violet-700"

// Gradiente alternativo
className="bg-gradient-solocloud"
```

## Páginas Implementadas

| Página | Rota | Descrição |
|--------|------|-----------|
| Login | `/login` | Autenticação com "Lembrar-me" |
| Dashboard | `/dashboard` | Estatísticas reais + atividades |
| Meu Perfil | `/profile` | Stats do usuário + atividades |
| Configurações | `/settings` | Editar perfil + alterar senha |
| Empresas | `/companies` | CRUD de empresas |
| Produtos | `/products` | CRUD de produtos |
| Upload XML | `/upload` | Upload com preview |
| Relatórios | `/reports` | Geração e download |
| Catálogo | `/catalog` | Visualização completa |
| Usuários | `/users` | Admin only - CRUD usuários |

## Autenticação

O sistema usa JWT armazenado no localStorage:

```javascript
// Login
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// Logout
localStorage.removeItem('token');
localStorage.removeItem('user');

// Axios interceptor adiciona automaticamente
headers: { Authorization: `Bearer ${token}` }
```

### Funcionalidade "Lembrar-me"

Quando marcado, o email é salvo em `solocloud_remember_email` e preenchido automaticamente no próximo acesso.

## API

O frontend se conecta ao backend:

```javascript
// Produção (build)
const API_BASE_URL = '/api';

// Desenvolvimento
const API_BASE_URL = 'https://mapa-app-clean-8270.azurewebsites.net/api';
```

Configurado em `src/services/api.js`

## Contato

Links na página de login abrem email para:
- **Administrador**: rhyan.hdr@gmail.com

---

**SoloCloud** - Da Terra à Nuvem
