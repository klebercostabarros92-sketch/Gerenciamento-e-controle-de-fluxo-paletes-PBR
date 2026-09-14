# 📦 Controle e Gestão de Fluxo de Vale-Paletes PBR — THX & 3 Corações

> **Sistema Web em Google Apps Script (GAS)** para monitoramento contínuo, reconciliação documental automatizada, prestação de contas operacional e mitigação de passivos financeiros no ciclo de vale-paletes PBR entre a **THX Transportes** e a **3 Corações**.

---

### 🖥️ Visão Geral da Interface Operacional

Abaixo, a interface unificada do sistema construída com foco em **Gestão Visual (Andon)** e usabilidade ágil para a equipe de tráfego e prestação de contas:

| 📊 Dashboard Executivo & Passivo Financeiro | 🚛 Gestão de Vale-Paletes & Filtros de Status (Dark Mode) |
| :---: | :---: |
| ![Dashboard e Indicadores](assets/dashboard.png) | ![Listagem Operacional de Vale-Paletes](assets/vale-paletes-escuro.png) |
| *Painel em tempo real: paletes devolvidos, ocorrências no prazo, em atraso e cálculo automático do valor de passivo em risco (R$ 35/unidade).* | *Grid de conciliação com busca instantânea, controle de motoristas ativos/inativos, tratativas e filtros por estágio.* |
| 🔍 **Auditoria & Conciliação de Protocolos** | ✉️ **Workflow Integrado de Baixa com 1 Clique** |
| ![Conferência de Protocolos](assets/protocolados.png) | ![Modal de Solicitação de Baixa ao Luiz](assets/modal-solicitacao-luiz.png) |
| *Cruzamento algorítmico entre base externa e protocolos internos, isolando pendências que já possuem canhoto comprovado.* | *Disparo formal de solicitação de baixa para `luizhenrique@3coracoes.com.br` com cópia para a gestão THX, eliminando retrabalho.* |

---

## 🎯 Impacto no Negócio: Conexão com Lean Logistics & Teoria das Restrições (TOC)

A operação de transporte fracionado e de distribuição envolve circulação intensiva de paletes de padrão PBR. Como a **THX não emite vale-paletes** (os documentos são gerados exclusivamente pela contratante 3 Corações), qualquer falha na devolução ou na comprovação documental transfere um custo financeiro direto de **R$ 35,00 por palete extraviado ou retido**.

A automação desenvolvida substitui controles manuais e descentralizados por uma esteira orientada a conceitos consagrados de engenharia de produção:

### 1. Aplicação da Teoria das Restrições (TOC — Eliyahu Goldratt)
* **Identificação do Gargalo (Restrição do Sistema):** O gargalo operacional não residia na devolução física do palete no cliente, mas sim no **tempo de conciliação documental** (lead time entre a devolução física, o retorno do canhoto/protocolo pelo motorista e a efetiva baixa no sistema da 3 Corações).
* **Exploração & Subordinação ao Gargalo (Buffer Management):** O sistema estabelece um *buffer temporal rígido* de **72 horas** (`CONFIG.PRAZO_HORAS`), monitorando a queima desse prazo com sinalização semafórica clara:
  * 🟡 **Pendente no Prazo:** Dentro da janela de segurança (0 a 72h).
  * 🔴 **Pendente em Atraso:** Buffer violado sem protocolo localizado — aciona cobrança direta e priorização máxima.
  * 🔵 **Pendente com Protocolo:** Palete devolvido fisicamente com comprovante sob posse da THX aguardando apenas a baixa sistêmica da 3 Corações.
* **Elevação da Restrição:** O fluxo manual de cobrança por e-mails dispersos ou mensagens avulsas foi substituído por gatilhos de **notificação diária via Google Chat** e pelo **Workflow de Baixa com 1 Clique**, acelerando o desembaraço documental junto ao responsável da 3 Corações.

### 2. Eliminação dos 7 Desperdícios do Lean (*Muda*)

| Desperdício Lean (*Muda*) | Como se manifestava antes | Como o sistema eliminou através de código |
| :--- | :--- | :--- |
| **Espera (*Waiting*)** | Dias de espera para cruzar manualmente planilhas de ocorrências e arquivos de protocolo. | Algoritmo de cruzamento O(N) com hash maps (`Cruzamento.js`), executado em segundos. |
| **Superprocessamento** | Digitação repetitiva de dados do plano, motorista e placa para cobrar ou solicitar baixas. | Template automatizado pré-preenchido que gera e-mails formais e webhooks padronizados. |
| **Defeitos / Retrabalho** | Erros de digitação, espaços invisíveis ou zeros omitidos impediam a localização de comprovantes. | Função `normalizeString()` (*Poka-Yoke*) que higieniza e pareia chaves independentemente do formato. |
| **Estoque Parado (*Inventory*)** | Paletes retidos em clientes sem rastreabilidade do motorista responsável pela coleta. | Monitoramento diário com ranking dos motoristas com maior volume retido (`Chart.js`). |
| **Movimentação Desnecessária** | Busca física em arquivos e pastas para checar se uma ocorrência já tinha protocolo. | Banco de dados consolidado com busca global e visualização instantânea do número do protocolo. |

### 3. Visibilidade do Passivo Financeiro em Tempo Real
O painel converte métricas operacionais em **indicadores financeiros imediatos**:
$$\text{Passivo Financeiro em Risco} = \text{Quantidade de Paletes em Atraso} \times \text{R\$\ 35,00}$$
Dessa forma, a diretoria e a coordenação operacional visualizam o valor exato da exposição financeira diária, orientando o foco da equipe para as pendências de maior valor agregado.

---

## ⚙️ Regras de Classificação e Lógica de Negócio

Cada registro é classificado dinamicamente no backend pelo módulo `Cruzamento.js`:

| Situação | Condição Lógica | Indicador Visual | Ação Operacional Recomendada |
| :--- | :--- | :---: | :--- |
| **`DEVOLVIDO`** | Campo `dataDevolucao` preenchido na base 3 Corações | 🟢 Verde | Concluído. Sem pendências. |
| **`PENDENTE COM PROTOCOLO`** | Não devolvido na 3C, mas chave (VP ou Plano) localizada na aba de protocolos | 🔵 Azul | Disparar e-mail de solicitação de baixa com 1 clique para `luizhenrique@3coracoes.com.br`. |
| **`PENDENTE NO PRAZO`** | Sem devolução, sem protocolo, com tempo de abertura inferior a 72 horas | 🟡 Amarelo | Acompanhamento preventivo de rota. |
| **`PENDENTE EM ATRASO`** | Sem devolução, sem protocolo, com tempo de abertura $\ge$ 72 horas | 🔴 Vermelho | Cobrança ativa do motorista e escalonamento de tratativa. |

---

## 🏛️ Arquitetura e Engenharia de Software

O ecossistema é projetado sobre a infraestrutura serverless do **Google Workspace**:

```
.
├── appsscript.json          # Manifesto do GAS (OAuth Scopes, timezone America/Sao_Paulo)
├── .clasp.json              # Configuração do Clasp CLI (sincronização Git ↔ Google Apps Script)
├── Code.js                  # Ponto de entrada Web App (doGet) e injeção de HTML
├── Config.js                # Constantes globais (IDs das planilhas, SLAs, Webhooks)
├── Dados.js                 # ETL e normalização da base da 3 Corações
├── Protocolos.js            # Indexação e mapeamento da base de protocolos internos
├── Cruzamento.js            # Mecanismo central de reconciliação e cálculo de status
├── Acompanhamento.js        # Persistência de status do motorista, links de tratativa e logs
├── Notificacoes.js          # Disparos de cobrança via Webhook (Google Chat)
├── Triggers.js              # Gerenciador de gatilhos cronológicos (Time-driven triggers)
├── Utils.js                 # Higienização de strings (Poka-Yoke), cálculo de datas e moedas
├── index.html               # Estrutura semântica SPA (Single Page Application)
├── css.html                 # Folha de estilos responsiva com suporte a Dark/Light Mode
└── js.html                  # Controladores client-side (renderização, filtros, modais e gráficos)
```

### Tecnologias Utilizadas
* **Backend:** Google Apps Script (V8 Engine)
* **Frontend:** HTML5, CSS3 Moderno (CSS Variables, Flexbox/Grid), JavaScript Vanilla (ES6+)
* **Visualização de Dados:** [Chart.js](https://www.chartjs.org/)
* **Tipografia & Ícones:** Google Fonts (Inter) & FontAwesome 6
* **Deploy & CI/CD Local:** `@google/clasp` (Command Line Apps Script Projects)

---

## 🚀 Guia de Implantação e Execução

### Pré-requisitos
* Node.js instalado (v16+)
* Acesso às planilhas Google da operação THX e 3 Corações

### 1. Clonar o Repositório e Autenticar
```bash
git clone https://github.com/klebercostabarros92-sketch/Gerenciamento-e-controle-de-fluxo-paletes-PBR.git
cd Gerenciamento-e-controle-de-fluxo-paletes-PBR

# Instalar o Clasp globalmente e fazer login com a conta Google
npm install -g @google/clasp
clasp login
```

### 2. Configurar os Parâmetros da Operação (`Config.js`)
Edite o arquivo `Config.js` com os IDs das planilhas de produção:
```javascript
const CONFIG = {
  PLANILHA_3_CORACOES_ID: 'ID_DA_PLANILHA_BASE_3_CORACOES',
  PLANILHA_PROTOCOLOS_ID:  'ID_DA_PLANILHA_PROTOCOLOS_THX',
  ABA_PROTOCOLOS:          'protocolo geral',
  TRANSPORTADORA:          'THX',
  PRAZO_HORAS:             72,
  HORARIO_COBRANCA:        22, // Disparo diário às 22:00
  DIAS_COBRANCA:           [0, 1, 2, 3, 4, 5], // Domingo a Sexta
  TIMEZONE:                'America/Sao_Paulo',
  MODO_TESTE:              false
};
```

### 3. Publicar e Atualizar no Google Apps Script
```bash
# Enviar os arquivos locais para o projeto no Apps Script
clasp push -f

# Abrir o projeto no navegador
clasp open
```

No editor do Apps Script:
1. Vá em **Implantar → Gerenciar Implantações** ou **Nova Implantação**.
2. Tipo: **Aplicativo da Web**.
3. Executar como: **Eu (proprietário)**.
4. Quem tem acesso: **Qualquer pessoa com a conta da organização** (ou conforme política interna).
5. Para ativar os disparos diários automatizados, execute a função `criarTriggers()` uma única vez.

---

## 👤 Responsável Técnico & Operacional

* **Kleber Costa** — *Controle Operacional e Inteligência de Processos*
* **THX Transportes**
* **Contato Corporativo:** `kleber.costa@thxgroup.com.br`

---
*Documentação atualizada em conformidade com as práticas de excelência operacional e governança logística.*
