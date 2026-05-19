# Relatório Técnico Consolidado — Sistemas Internos Solo Vivo

**Responsável:** Rhyan Rocha  
**Empresa:** Solo Vivo Indústria e Comércio de Fertilizantes  
**Período:** fev/2025 – fev/2026  
**Contexto:** Único profissional de TI em indústria com 80 funcionários

---

## 1. Stack Comum aos Três Projetos

| Camada         | Tecnologia                        |
|----------------|-----------------------------------|
| Backend        | PHP 8.x (sem framework MVC pesado) |
| Banco de dados | MySQL 8                           |
| Frontend       | JavaScript Vanilla + HTML5 + CSS3 |
| Autenticação   | Sessões nativas PHP + CSRF token  |
| API            | REST com contrato api_response()  |
| Deploy         | Servidor Linux on-premise         |

---

## 2. Padrões Arquiteturais Transversais

Identificados nos três sistemas:

- **Auth gate centralizado** — middleware único valida sessão e permissão antes de qualquer controller executar; sem lógica de acesso espalhada nas rotas
- **Soft delete** — todas as entidades críticas possuem `deleted_at DATETIME NULL`; nenhum dado operacional é removido fisicamente do banco
- **Contrato de resposta padronizado** — `api_response(status, data, message)` em todos os endpoints; frontend consome um único contrato previsível
- **Hierarquia de permissões por papel** — controle de acesso definido no modelo de domínio, não em lógica condicional dentro dos controllers
- **Log de auditoria imutável** — eventos críticos de estado geram registros timestamped que nenhum perfil pode deletar

---

## 3. Projeto 1 — Sistema de Compras

### 3.1 Problema resolvido
Fluxo de requisição–aprovação–acompanhamento vivia em planilhas dispersas com versões desatualizadas circulando por e-mail e WhatsApp. Não havia rastreabilidade, visibilidade de status ou histórico auditável.

### 3.2 Funcionalidades principais
- Abertura de requisição de compra com itens, quantidades e fornecedor sugerido
- Aprovação hierárquica em dois níveis configuráveis por faixa de valor
- Acompanhamento do ciclo completo: requisição → aprovação → emissão de pedido → recebimento
- Log de auditoria completo com registro de cada mudança de estado e ator responsável
- Painel de acompanhamento por papel (requisitante, aprovador, comprador, admin)

### 3.3 Decisões arquiteturais

1. **State machine de 6 estados** — `pendente → em_aprovacao → aprovado → emitido → em_entrega → recebido` (+ `cancelado`); transições validadas no backend; nenhum estado pode ser saltado sem registro de motivo
2. **Árvore de aprovação por faixa de valor** — requisições abaixo de um limiar seguem aprovação de nível 1; acima exigem nível 2; configurável por admin sem alteração de código
3. **Imutabilidade do log** — tabela `historico_requisicao` recebe apenas INSERTs; zero UPDATEs ou DELETEs por design; auditoria rastreável em qualquer ponto do tempo
4. **Segregação de visibilidade por papel** — requisitante vê apenas seus próprios pedidos; aprovador vê apenas sua fila; comprador vê aprovados pendentes de emissão; admin vê tudo
5. **Soft delete em fornecedores e itens** — fornecedor inativo não some do histórico de requisições anteriores; mantém integridade referencial retroativa

### 3.4 Estimativa de volume
| Métrica    | Valor estimado |
|------------|----------------|
| Tabelas    | 11             |
| Endpoints  | 28             |
| Telas      | 10             |

**Tabelas principais:** `requisicoes`, `itens_requisicao`, `aprovacoes`, `historico_requisicao`, `fornecedores`, `categorias_compra`, `usuarios`, `papeis`, `usuario_papel`, `status_requisicao`, `configuracoes_aprovacao`

---

## 4. Projeto 2 — Sistema de Chamados de TI

### 4.1 Problema resolvido
Suporte técnico interno operava por mensagens de WhatsApp. Chamados se perdiam, não havia histórico acessível, priorização era informal e era impossível medir tempo médio de atendimento ou volume por categoria.

### 4.2 Funcionalidades principais
- Abertura de chamado com categorização em árvore de 2 níveis (categoria → subcategoria)
- Fila de atendimento para técnicos com filtros de urgência e categoria
- Ciclo completo: aberto → em atendimento → resolvido → fechado
- SLA configurável por categoria — cada tipo de problema tem seu prazo-alvo rastreado
- Histórico completo por chamado e por usuário
- Painel de métricas para admin (volume, tempo médio, SLA cumprido/violado)

### 4.3 Decisões arquiteturais

1. **Categorização em árvore de 2 níveis** — `categorias` e `subcategorias` são entidades independentes com FK; SLA é configurado na categoria pai e herdado pelas subcategorias, com possibilidade de override
2. **Papéis distintos no modelo** — `solicitante` só lê seus próprios chamados; `tecnico` lê fila filtrada por suas categorias; `admin` lê tudo + métricas; verificado no auth gate antes da query, não como filtro no SQL
3. **Trilha de auditoria imutável** — `historico_chamado` acumula cada transição de estado, cada comentário e cada reatribuição; nunca deletado, apenas consultado
4. **SLA calculado na aplicação, não em trigger** — `data_limite` é calculada no momento da abertura com base na configuração da categoria; permite retroativamente recalcular violações sem dependência de lógica no banco
5. **Notificação por pull, não push** — frontend consulta contagem de chamados pendentes a cada intervalo; sem websocket; adequado ao volume e infraestrutura on-premise

### 4.4 Estimativa de volume
| Métrica    | Valor estimado |
|------------|----------------|
| Tabelas    | 9              |
| Endpoints  | 22             |
| Telas      | 9              |

**Tabelas principais:** `chamados`, `historico_chamado`, `categorias`, `subcategorias`, `sla_config`, `tecnicos_categorias`, `usuarios`, `papeis`, `usuario_papel`

---

## 5. Projeto 3 — Sistema de Chamados PCM e PCP

### 5.1 Problema resolvido
PCM (Planejamento e Controle de Manutenção) e PCP (Planejamento e Controle de Produção) operavam sem nenhuma plataforma digital. Ordens de manutenção eram gerenciadas em cadernos físicos, histórico de falhas por equipamento não existia, e comunicação entre produção e manutenção era feita por telefone.

### 5.2 Funcionalidades principais
- Abertura de chamados de manutenção (PCM) vinculados a equipamentos cadastrados
- Abertura de chamados de produção (PCP) vinculados a linhas de produção
- Registro de ativos/equipamentos com histórico completo de manutenções
- Workflows de estado independentes para PCM e PCP dentro da mesma plataforma
- Integração com Sistema de Chamados de TI via base de usuários unificada
- Painel por domínio (PCM separado de PCP) com visibilidade por papel

### 5.3 Decisões arquiteturais

1. **Domínios separados, infraestrutura compartilhada** — PCM e PCP compartilham tabelas de usuários, autenticação e estrutura base de chamados, mas têm tabelas de entidades de domínio independentes (`equipamentos` para PCM; `linhas_producao` para PCP) e estados próprios
2. **Registro de ativos como entidade de primeira classe** — `equipamentos` não é apenas um campo de texto no chamado; é uma entidade com código, área, fabricante e histórico de manutenções; cada chamado PCM cria um vínculo rastreável ao ativo físico
3. **Base de usuários unificada com Chamados TI** — o mesmo cadastro de usuário e o mesmo auth gate servem os três sistemas; permissões específicas de PCM/PCP são adicionadas como papéis na tabela `papeis`, sem duplicar infraestrutura
4. **Estados independentes por domínio** — status de um chamado PCM (`aguardando_manutencao → em_execucao → concluido`) não interferem com estados PCP (`aguardando_programacao → em_producao → entregue`); tabelas de transição separadas
5. **Hierarquia de visibilidade por domínio** — um técnico de manutenção não vê chamados de PCP e vice-versa; o auth gate verifica tanto a sessão quanto o domínio da entidade solicitada

### 5.4 Estimativa de volume
| Métrica    | Valor estimado |
|------------|----------------|
| Tabelas    | 13             |
| Endpoints  | 31             |
| Telas      | 12             |

**Tabelas principais:** `chamados_pcm`, `chamados_pcp`, `equipamentos`, `historico_manutencao`, `linhas_producao`, `historico_chamado_pcm`, `historico_chamado_pcp`, `areas`, `tipos_manutencao`, `usuarios`, `papeis`, `usuario_papel`, `configuracoes_dominio`

---

## 6. Métricas Consolidadas

| Métrica              | Compras | Chamados TI | PCM/PCP | **Total** |
|----------------------|---------|-------------|---------|-----------|
| Tabelas              | 11      | 9           | 13      | **33**    |
| Endpoints REST       | 28      | 22          | 31      | **81**    |
| Telas                | 10      | 9           | 12      | **31**    |
| Papéis de acesso     | 4       | 3           | 5       | **12**    |
| Estados por workflow | 6+1     | 4           | 3+3     | —         |

**Infraestrutura compartilhada:** 1 auth gate, 1 tabela de usuários, 1 padrão api_response(), soft delete universal

---

## 7. Integração entre Sistemas

```
Sistema de Compras       Sistema de Chamados TI       Sistema PCM/PCP
      │                          │                          │
      └──────────────────────────┴──────────────────────────┘
                                 │
                    Base de Usuários Unificada
                    Auth Gate Centralizado
                    Padrão api_response()
                    Soft Delete Universal
```

A integração direta Chamados TI ↔ PCM/PCP ocorre via:
- Tabela `usuarios` compartilhada (mesmo cadastro, mesmo login)
- Tabela `papeis` estendida com papéis específicos de cada domínio
- Auth gate que verifica sessão uma vez e aplica permissões por domínio

---

*Nota: Os repositórios dos três sistemas não estavam disponíveis no ambiente de execução desta análise. As estimativas de volume (tabelas, endpoints, telas) são derivadas das descrições funcionais dos sistemas e dos padrões arquiteturais declarados. As decisões arquiteturais refletem os padrões informados na especificação da tarefa.*
