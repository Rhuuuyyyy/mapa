# 🚀 Criar Primeiro Admin - MÉTODO SUPER FÁCIL

**Este é o jeito mais fácil! Usa apenas o navegador, sem precisar instalar nada.**

---

## ✅ Passo a Passo

### 1️⃣ Aguarde o Deploy Completar (~3-5 minutos)

O código acabou de ser enviado. Aguarde o deploy terminar em:
https://github.com/Rhuuuyyyy/mapa/actions

Quando a bolinha ficar verde ✅, pode continuar!

---

### 2️⃣ Abra a Documentação da API

Abra este link no seu navegador:

**https://mapa-app-clean-8270.azurewebsites.net/docs**

Você verá a interface Swagger com todos os endpoints.

---

### 3️⃣ Encontre o Endpoint de Setup

Na página da documentação:

1. Procure a seção **"admin"** (em verde ou azul)
2. Expanda clicando na setinha
3. Procure o endpoint: **POST /admin/auth/setup-first-admin**
4. Clique nele para abrir

---

### 4️⃣ Clique em "Try it out"

No canto direito, você verá um botão **"Try it out"** - clique nele!

---

### 5️⃣ Preencha os Dados

Vai aparecer um formulário JSON. Edite com seus dados:

```json
{
  "email": "admin@suaempresa.com",
  "password": "SuaSenhaForte123!@#",
  "full_name": "Seu Nome Completo",
  "company_name": "Nome da Sua Empresa",
  "is_admin": true
}
```

**⚠️ IMPORTANTE - A senha DEVE ter:**
- Mínimo 12 caracteres
- Pelo menos 1 letra MAIÚSCULA
- Pelo menos 1 letra minúscula
- Pelo menos 1 número
- Pelo menos 1 símbolo (!, @, #, $, etc.)

**Exemplos de senhas válidas:**
- `MinhaSenh@123Forte`
- `Admin#Mapa2025!`
- `Segur@2025Admin!`

---

### 6️⃣ Clique em "Execute"

Depois de preencher, clique no botão azul **"Execute"** embaixo do formulário.

---

### 7️⃣ Veja o Resultado

**Se deu certo:**
- Código: **200** (verde)
- Resposta: Mostra os dados do admin criado (ID, email, nome, etc.)

**Se deu erro:**
- **403**: Já existe um admin (use o login normal)
- **400**: Senha fraca ou email inválido
- **500**: Problema no servidor (aguarde alguns minutos e tente novamente)

---

### 8️⃣ Teste o Login

Agora que o admin foi criado, teste o login!

**Na mesma página de documentação:**

1. Procure o endpoint: **POST /admin/auth/login**
2. Clique em "Try it out"
3. Preencha:
   - **username**: seu email (ex: admin@suaempresa.com)
   - **password**: sua senha
4. Clique em "Execute"

**Se funcionou:**
- Código: **200**
- Você receberá um `access_token` (um texto grande começando com "ey...")

---

## 🔒 Segurança

**Este endpoint é SEGURO porque:**
- ✅ Só funciona se NÃO existir nenhum admin
- ✅ Depois de criar o primeiro admin, o endpoint para de funcionar automaticamente
- ✅ Valida força da senha
- ✅ Requer email válido

**⚠️ DEPOIS que criar o admin, você PODE remover este endpoint do código** (não é obrigatório, mas é uma boa prática).

---

## 🎯 Exemplo Completo via CURL (se preferir terminal)

```bash
curl -X POST "https://mapa-app-clean-8270.azurewebsites.net/admin/auth/setup-first-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@suaempresa.com",
    "password": "MinhaSenh@123Forte",
    "full_name": "João Silva",
    "company_name": "Minha Empresa LTDA",
    "is_admin": true
  }'
```

---

## ❓ Problemas Comuns

### "Já existe um administrador"
✅ **Solução**: O admin já foi criado! Use o endpoint de login.

### "Senha muito fraca"
✅ **Solução**: Sua senha precisa ter 12+ caracteres, maiúsculas, minúsculas, números e símbolos.

### "Email inválido"
✅ **Solução**: Use um email válido (ex: seunome@empresa.com).

### Página não carrega
✅ **Solução**: Aguarde o deploy completar em https://github.com/Rhuuuyyyy/mapa/actions

---

## 🎉 Próximos Passos

Depois de criar o admin:

1. **Faça login** no endpoint `/admin/auth/login`
2. **Copie o token** que receber
3. **Use o token** para acessar outros endpoints (clicando no cadeado 🔒 no Swagger)
4. **Explore a API!**

---

**Criado**: 2025-11-16
**Método**: Interface Swagger (sem precisar instalar nada!)
