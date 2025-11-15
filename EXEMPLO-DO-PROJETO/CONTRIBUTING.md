# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o MAPA SaaS! 

## 📋 Como Contribuir

### 1. Reportar Bugs

Se você encontrou um bug, por favor abra uma issue incluindo:

- **Título claro e descritivo**
- **Descrição detalhada** do problema
- **Passos para reproduzir**
- **Comportamento esperado** vs **comportamento atual**
- **Screenshots** (se aplicável)
- **Informações do ambiente**:
  - Sistema Operacional
  - Versão do Python
  - Versão do PostgreSQL

### 2. Sugerir Melhorias

Para sugerir novas funcionalidades:

- Abra uma issue com o título `[FEATURE]`
- Descreva detalhadamente a funcionalidade
- Explique o caso de uso
- Se possível, sugira uma implementação

### 3. Contribuir com Código

#### Pré-requisitos

- Python 3.9+
- PostgreSQL 12+
- Git
- Familiaridade com FastAPI

#### Processo

1. **Fork o repositório**
```bash
   # No GitHub, clique em "Fork"
```

2. **Clone seu fork**
```bash
   git clone https://github.com/SEU-USUARIO/mapa-saas.git
   cd mapa-saas
```

3. **Crie uma branch**
```bash
   git checkout -b feature/minha-feature
   # ou
   git checkout -b fix/correcao-bug
```

4. **Configure o ambiente**
```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   pip install -r requirements.txt
```

5. **Faça suas alterações**
   - Siga o estilo de código existente
   - Adicione comentários quando necessário
   - Escreva código limpo e legível

6. **Teste suas alterações**
```bash
   # Execute o servidor
   uvicorn app.main:app --reload
   
   # Teste manualmente no navegador
   # Verifique se não quebrou funcionalidades existentes
```

7. **Commit suas mudanças**
```bash
   git add .
   git commit -m "feat: adiciona nova funcionalidade X"
   # ou
   git commit -m "fix: corrige bug Y"
```

   **Padrão de commits**:
   - `feat:` Nova funcionalidade
   - `fix:` Correção de bug
   - `docs:` Documentação
   - `style:` Formatação
   - `refactor:` Refatoração
   - `test:` Testes
   - `chore:` Manutenção

8. **Push para seu fork**
```bash
   git push origin feature/minha-feature
```

9. **Abra um Pull Request**
   - Vá até o repositório original no GitHub
   - Clique em "New Pull Request"
   - Selecione sua branch
   - Preencha a descrição detalhadamente

### 4. Diretrizes de Código

#### Python

- Siga a PEP 8
- Use type hints
- Docstrings em funções importantes
- Nomes descritivos de variáveis

**Exemplo:**
```python
def extract_nfe_data(file_path: str) -> Dict[str, Any]:
    """
    Extrai dados de uma NF-e.
    
    Args:
        file_path: Caminho do arquivo XML ou PDF
        
    Returns:
        Dicionário com os dados extraídos
        
    Raises:
        FileNotFoundError: Se o arquivo não existir
        ValueError: Se o arquivo for inválido
    """
    # Implementação
    pass
```

#### JavaScript

- Use ES6+
- Funções async/await
- Comentários em funções complexas
- Nomes descritivos

**Exemplo:**
```javascript
/**
 * Faz upload de arquivo NF-e
 * @param {File} file - Arquivo a ser enviado
 * @returns {Promise<Object>} Resultado do upload
 */
async function uploadNFe(file) {
    // Implementação
}
```

#### HTML/CSS

- HTML semântico
- CSS organizado e comentado
- Classes descritivas
- Responsividade

### 5. Checklist antes do PR

- [ ] Código testado localmente
- [ ] Sem erros no console
- [ ] Documentação atualizada (se necessário)
- [ ] Comentários adicionados em código complexo
- [ ] Commit messages seguem o padrão
- [ ] Branch atualizada com a main

### 6. Revisão de Código

Seu PR será revisado por um mantenedor. Pode ser solicitado:

- Alterações no código
- Testes adicionais
- Melhorias na documentação
- Ajustes de estilo

Seja paciente e receptivo ao feedback!

## 🎯 Áreas que Precisam de Ajuda

- [ ] Testes automatizados
- [ ] Processamento de mais formatos de PDF
- [ ] Validação de dados do MAPA
- [ ] Melhorias na interface
- [ ] Otimização de performance
- [ ] Documentação
- [ ] Traduções (i18n)

## 💬 Comunicação

- **Issues**: Para bugs e features
- **Pull Requests**: Para contribuições de código
- **Discussions**: Para perguntas gerais

## 📜 Código de Conduta

- Seja respeitoso
- Aceite críticas construtivas
- Foque no que é melhor para o projeto
- Seja acolhedor com novos contribuidores

## 🎉 Reconhecimento

Contribuidores serão listados no README.md e nas release notes!

---

Obrigado por contribuir! 🚀