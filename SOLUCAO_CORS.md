# Solução para Problema de CORS

## O Problema

O frontend está rodando em `localhost:3000` e tentando fazer requisições para o servidor em produção no Azure (`mapa-app-clean-8270.azurewebsites.net`). O servidor Azure está bloqueando essas requisições porque não reconhece `localhost:3000` como uma origem permitida.

## Solução 1: Desenvolvimento Local (Recomendada) ✅

Use o backend localmente durante o desenvolvimento:

### Passos:

1. **Já configurado:** Criei o arquivo `frontend/.env` apontando para `http://localhost:8000`

2. **Rodar o backend localmente:**
   ```bash
   # Certifique-se de ter um arquivo .env na raiz com as variáveis necessárias
   # Copie do .env.example se necessário

   # Instale as dependências (se necessário)
   pip install -r requirements.txt

   # Rode o servidor
   uvicorn app.main:app --reload --port 8000
   ```

3. **Rode o frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Acesse:** `http://localhost:3000`

### Vantagens:
- ✅ Não precisa mexer nas configurações do Azure
- ✅ Desenvolvimento mais rápido (sem latência de rede)
- ✅ Pode testar alterações no backend imediatamente
- ✅ Usa dados locais (não afeta produção)

---

## Solução 2: Configurar CORS no Azure

Se você precisa usar o backend de produção durante desenvolvimento:

### Passos:

1. **Acessar o Azure Portal:**
   - Vá para https://portal.azure.com
   - Navegue até o App Service `mapa-app-clean-8270`

2. **Configurar variável de ambiente:**
   - Vá em **Configuration** → **Application settings**
   - Encontre ou adicione a variável `ALLOWED_ORIGINS`
   - Configure com: `http://localhost:3000,https://mapa-app-clean-8270.azurewebsites.net`
   - Clique em **Save**
   - Clique em **Restart** para aplicar as mudanças

3. **Atualizar frontend/.env:**
   ```bash
   # Backend no Azure
   VITE_API_URL=https://mapa-app-clean-8270.azurewebsites.net/api
   ```

4. **Reiniciar o frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

### ⚠️ Considerações de Segurança:
- Permitir `localhost:3000` em produção é aceitável apenas temporariamente
- Para produção final, remova `localhost:3000` das origens permitidas
- Use apenas as URLs reais do frontend em produção

---

## Qual escolher?

- **Desenvolvimento ativo:** Use Solução 1 (backend local)
- **Apenas testando o frontend:** Use Solução 2 (Azure)
- **Produção:** Nunca permita localhost nas origens CORS

---

## Verificar se funcionou

Após aplicar a solução, abra o console do navegador (F12) e tente fazer login. Você NÃO deve ver mais o erro:
```
Access to XMLHttpRequest at '...' has been blocked by CORS policy
```

Se ainda houver problemas, verifique:
1. O backend está rodando? (localhost:8000 ou Azure)
2. A variável VITE_API_URL está correta no frontend/.env?
3. Você reiniciou o frontend após mudar o .env?
