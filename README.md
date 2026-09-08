# Mini CRM de Leads | Embalar Norte, S.A.

Aplicação web para registar e acompanhar leads da Embalar Norte.

## Como executar

Abrir o ficheiro index.html num navegador. Os dados ficam guardados no localStorage desse navegador.

## Funcionalidades

- Registo das leads com contacto, empresa, email, telefone, origem, morada, código postal, região e valor potencial.
- Estado da amostra e estado da proposta.
- Atribuição automática: Norte para Pedro Ferreira; Centro para Rafael Batista, Sul para Mário Amorim.
- Prioridade calculada pelo valor: Quente (a partir de 10 000 €), Morno (a partir de 5 000 €) ou Frio.
- Percurso de estados: Novo → Contactado → Proposta → Ganho. De qualquer estado ativo pode passar para Perdido. Ganho e Perdido são finais.
- Edição, eliminação, pesquisa por nome/empresa e filtro por estado.
- Indicadores de valor potencial ativo e taxa de conversão.

## Três cenários testados

1. Criar uma lead da região Norte com valor de 12 000 €. Deve ficar atribuída ao Pedro Ferreira e a prioridade muda para quente.
2. Tentar mudar uma lead de Novo diretamente para Ganho. A aplicação recusa a transição e mantém o estado Novo.
3. Criar uma lead com proposta Aceite e verificar o aumento da taxa de conversão.

## Estrutura

- index.html: estrutura da página e formulário.
- app.js: leads, regras, eventos, indicadores e persistência.
- style.css: apresentação da aplicação.