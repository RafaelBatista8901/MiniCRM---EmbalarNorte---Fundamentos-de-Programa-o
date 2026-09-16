# Mini CRM de Leads | Embalar Norte, S.A.
Aplicação web para registar e acompanhar leads da Embalar Norte.

## Criadores
- Pedro Ferreira
- Rafael Batista

## Como executar
Abrir o ficheiro `index.html` num navegador. Os dados ficam guardados no `localStorage` desse navegador.

## Funcionalidades
- Registo de leads com os seguintes campos: nome do contacto, nome da empresa, email, telefone, origem, região, código postal, morada de envio, estado da amostra e valor potencial.
- Origens disponíveis: Website, Telefone e Email.
- Regiões disponíveis: Norte, Centro e Sul.
- Atribuição automática de comercial: Norte para Pedro Ferreira, Centro para Rafael Batista e Sul para Mário Amorim.
- Validação dos campos obrigatórios.
- Validação do telefone com exatamente 9 dígitos.
- Formatação automática do código postal no formato `0000-000`.
- Impedimento de valores potenciais negativos.
- Estado da amostra editável de forma independente do acompanhamento.
- Uma amostra pode estar Aprovada mesmo quando a lead fica Perdida por causa do valor ou de outra decisão comercial.
- Uma amostra Rejeitada impede que o acompanhamento passe para Ganho.
- Ao editar uma lead e alterar a amostra para Rejeitada, o acompanhamento passa automaticamente para Perdido.
- Prioridade calculada automaticamente pelo valor: Quente a partir de 10 000 €, Morno a partir de 5 000 € e Frio abaixo desse valor.
- Percurso do acompanhamento: Novo → Contactado → Proposta.
- A partir de Proposta, é possível passar para Ganho ou Perdido.
- Ganho e Perdido são estados finais.
- O dropdown fica desativado quando não existem mais transições possíveis.
- Leads em Ganho ou Perdido não podem ser editadas mas podem ser eliminadas.
- Possibilidade de editar e eliminar leads que ainda não estejam num estado final.
- Pesquisa de leads por nome do contacto ou nome da empresa.
- Filtro de leads por estado do acompanhamento.
- Indicador do número total de leads.
- Indicador do valor potencial ativo, excluindo leads Ganho e Perdido.
- Indicador da taxa de conversão, calculada através das leads Ganhas.

## Três cenários testados
1. Criar uma lead da região Norte com valor de 12 000 €. Deve ficar atribuída ao Pedro Ferreira e a prioridade muda para quente.
2. Tentar mudar uma lead de Novo diretamente para Ganho. A aplicação recusa a transição e mantém o estado Novo.
3. Editar uma lead, aprovar a amostra e deixá-la em Perdido, verificando que os dois estados são independentes.

## Regras de negócio
- O Estado da amostra e o Estado do acompanhamento são campos independentes.
- Uma amostra Rejeitada nunca permite que o acompanhamento passe para Ganho.
- Uma lead pode ter a amostra Aprovada e ficar Perdida por causa do valor ou de outra decisão comercial.
- Ganho representa uma lead convertida e é usada para calcular a taxa de conversão.
- Ganho e Perdido são estados finais e impedem novas alterações à lead.
- A região define automaticamente o comercial responsável.

## Estrutura
- `index.html`: estrutura da página, formulário, indicadores e lista.
- `app.js`: leads, regras, validações, eventos, indicadores e persistência.
- `style.css`: apresentação visual, cores e adaptação para ecrãs mais pequenos.
- `Logotipo.png`: logótipo apresentado no cabeçalho da aplicação.