[README.md](https://github.com/user-attachments/files/32126107/README.md)
Controle de Vale-Paletes — THX
Web app em Google Apps Script (GAS) para acompanhamento dos vale-paletes emitidos pela 3 Corações e transportados pela THX, com cruzamento automático de protocolos, cobrança automática de motoristas em atraso e dashboard de prestação de contas.
Publicado como Web App (`doGet`) a partir do script ID configurado em `.clasp.json`, sincronizado via `clasp`.
---
Visão geral
O sistema lê a base de ocorrências de vale-palete da planilha "3 Corações", cruza cada registro com a planilha de "Protocolos" da THX (por número de vale-palete ou número do plano de viagem) e classifica cada ocorrência em uma situação:
Situação	Condição	Cor
`DEVOLVIDO`	Palete já devolvido	🟢
`PENDENTE COM PROTOCOLO`	Não devolvido, mas já tem protocolo aberto	🔵
`PENDENTE NO PRAZO`	Não devolvido, dentro de 72h (`CONFIG.PRAZO_HORAS`)	🟡
`PENDENTE EM ATRASO`	Não devolvido, acima de 72h e sem protocolo	🔴
A cada dia, um trigger dispara o envio automático de cobranças (Google Chat) para vale-paletes em atraso sem protocolo, com deduplicação diária por VP.
Funcionalidades
Dashboard: cards com totais de paletes devolvidos, ocorrências em atraso, no prazo, com protocolo, paletes em atraso e valor financeiro estimado da pendência (R$ 35/palete).
Monitoramento: tabela dos últimos 3 dias em aberto, com filtros (todos / dentro do prazo / emitidos ontem).
Vale-Paletes: listagem completa com busca por texto (VP, plano, motorista, placa, cliente), filtros por situação e exportação para CSV.
Protocolos: cruzamento mostrando quais vale-paletes já têm protocolo localizado ou não.
Análise: gráficos (Chart.js) de status geral dos paletes e ranking dos 10 motoristas com mais paletes em atraso.
Prestação de Contas: resumo consolidado (total, devolvido, pendente, atraso, passivo financeiro).
Acompanhamento manual: aba dedicada na planilha de protocolos para registrar status do motorista e link de ação por vale-palete.
Cobrança automática: mensagem formatada enviada via webhook do Google Chat para vale-paletes em atraso sem protocolo, com log de envios e modo de teste (`CONFIG.MODO_TESTE`).
Tema claro/escuro persistido em `localStorage`.
Estrutura do projeto
```
.
├── appsscript.json          # Manifesto do Apps Script (timezone, runtime V8)
├── .clasp.json              # Configuração do clasp (scriptId, extensões)
├── Code.js                  # doGet() e include() — bootstrap do Web App
├── Config.js                # IDs de planilhas e parâmetros globais (CONFIG)
├── Dados.js                 # Leitura e normalização da base "3 Corações"
├── Protocolos.js            # Leitura e indexação da planilha de protocolos THX
├── Cruzamento.js            # Cruzamento de dados + cálculo de situação/prazos
├── Acompanhamento.js        # CRUD da aba "acompanhamento" (status motorista/link ação)
├── Notificacoes.js          # Envio de cobranças via Google Chat + log
├── Triggers.js              # Criação/remoção do trigger diário de cobrança
├── Dashboard.js             # Endpoint legado (mantido por compatibilidade)
├── Monitoramento.js         # Endpoint legado (mantido por compatibilidade)
├── Utils.js                 # Normalização de strings, datas e cálculo de horas em aberto
├── index.html                # Layout principal (sidebar + tabs)
├── css.html                  # Estilos (tema claro/escuro via CSS variables)
└── js.html                   # Lógica de frontend (render de tabelas, filtros, gráficos, export)
```
Configuração (`Config.js`)
Parâmetro	Descrição
`PLANILHA_3_CORACOES_ID`	ID da planilha com a base de ocorrências da 3 Corações
`PLANILHA_PROTOCOLOS_ID`	ID da planilha de protocolos/acompanhamento/log da THX
`ABA_PROTOCOLOS`	Nome da aba com os protocolos ("protocolo geral")
`TRANSPORTADORA`	Filtro de transportadora aplicado à base (`THX`)
`PRAZO_HORAS`	Prazo em horas para devolução do palete (72h)
`HORARIO_COBRANCA`	Hora do dia em que o trigger diário roda (22h)
`DIAS_COBRANCA`	Dias da semana em que há cobrança (0=Dom … 6=Sáb; sábado excluído)
`TIMEZONE`	Fuso horário do script (`America/Sao_Paulo`)
`MODO_TESTE`	Quando `true`, cobranças são apenas logadas, não enviadas
> ⚠️ Propriedade de script necessária: `GOOGLE_CHAT_WEBHOOK_CRISTIANO` (Script Properties) com a URL do webhook do Google Chat usado em `enviarCobrancasAutomaticas()`.
Fluxo de dados
Frontend chama `google.script.run.obterDadosCompletos()` ao carregar a página.
`Cruzamento.realizarCruzamento()` busca a base normalizada (`getBase3Coracoes`) e o mapa de protocolos (`getProtocolos`), cruza por vale-palete ou plano normalizado e calcula prazos/situação.
O resultado é serializado em JSON e devolvido ao frontend (`js.html`), que popula dashboard, tabelas, gráficos e prestação de contas.
Diariamente, o trigger `executarRotinaDiaria` (criado por `criarTriggers()`) roda `enviarCobrancasAutomaticas()`, que filtra pendências em atraso sem protocolo e dispara mensagens via Google Chat, registrando cada envio na aba "LOG DE COBRANÇAS".
Setup com clasp
```bash
npm install -g @google/clasp
clasp login
clasp pull      # ou clasp push, a partir deste diretório
clasp open      # abre o projeto no editor do Apps Script
```
Após publicar como Web App (Implantar → Nova implantação → Aplicativo da Web), configurar:
Executar como: Eu (proprietário)
Quem pode acessar: conforme política interna da THX
Para ativar a cobrança automática, executar uma vez `criarTriggers()` no editor do Apps Script.
Observações
`Dashboard.js` e `Monitoramento.js` são endpoints legados mantidos apenas por compatibilidade — os dados reais trafegam por `obterDadosCompletos()`.
A normalização de chaves (`normalizeString`) remove acentos, espaços, caracteres especiais e zeros à esquerda, permitindo cruzar vale-palete/plano mesmo com formatação divergente entre planilhas.
O valor de R$ 35,00 por palete em atraso está fixo no frontend (`js.html`) e deve ser revisado caso o valor de referência mude.
