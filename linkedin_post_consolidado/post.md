Em 1 ano como único profissional de TI de uma indústria com 80 funcionários, digitalizei do zero os três processos internos mais críticos da Solo Vivo: compras, manutenção e atendimento técnico. Esta é a história arquitetural dessa transição.

Sistema de Compras

Requisições viviam em planilhas dispersas; aprovações por e-mail e WhatsApp, sem rastreabilidade de estágio ou ator.

→ State machine de 6 estados validada no backend: nenhuma transição ocorre sem registro de motivo e ator responsável
→ Dois níveis de aprovação configuráveis por faixa de valor — sem alteração de código para reconfigurar o fluxo
→ Tabela de histórico append-only: apenas INSERTs, zero UPDATEs — auditoria completa de qualquer momento no tempo

Sistema de Chamados de TI

Suporte técnico por WhatsApp. Chamados se perdiam; medir tempo de atendimento era impossível.

→ Categorização em árvore de 2 níveis com SLA por categoria — prazo calculado na abertura, não em trigger de banco
→ Papéis verificados no auth gate, antes da query: solicitante vê seus chamados; técnico vê fila filtrada; admin vê métricas
→ Trilha de auditoria imutável: cada transição de estado e reatribuição gera registro permanente — encerrado, não deletado

Sistema de Chamados PCM e PCP

Manutenção e produção operavam em cadernos físicos. Histórico de falhas por equipamento não existia.

→ Equipamentos como entidade de domínio: cada chamado PCM se vincula ao ativo físico, criando histórico de falhas por equipamento
→ Domínios separados, infraestrutura compartilhada: PCM e PCP têm workflows independentes mas compartilham auth e base de chamados
→ Base de usuários unificada com Chamados TI: mesmo cadastro, mesmo login, permissões específicas como papéis na mesma tabela

Padrões transversais

→ Auth gate centralizado: middleware único valida sessão e permissão antes de qualquer controller executar
→ Soft delete universal: deleted_at em todas as entidades críticas; nenhum dado operacional é removido fisicamente
→ api_response(status, data, message) em todos os endpoints: frontend consome um único contrato previsível
→ Permissões no modelo: controle de acesso é propriedade do domínio, não lógica espalhada nos controllers

Stack: PHP 8.x, MySQL 8, JavaScript Vanilla.

Ser responsável por múltiplos sistemas em paralelo muda o nível de exigência: cada decisão arquitetural tem consequências transversais. Você para de pensar em features isoladas e começa a pensar em contratos — e no custo de quebrá-los com usuários dependendo de todos ao mesmo tempo.

Se você trabalha com digitalização de processos ou quer trocar ideia sobre sistemas internos, fala comigo.

#SoftwareEngineering #SoftwareArchitecture #FullStack #BackendDevelopment #AIEngineering #PHP #InternalTools #SystemDesign #ProcessDigitalization #IndustrialSoftware
