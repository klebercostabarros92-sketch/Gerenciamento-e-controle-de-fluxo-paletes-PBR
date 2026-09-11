function enviarCobrancasAutomaticas() {
  const webhookUrl = PropertiesService.getScriptProperties().getProperty('GOOGLE_CHAT_WEBHOOK_CRISTIANO');
  
  if (!webhookUrl && !CONFIG.MODO_TESTE) {
    Logger.log('Erro: Webhook não configurado em Script Properties.');
    return;
  }
  
  const dados = realizarCruzamento();
  const logCobrancas = obterLogCobrancas();
  
  let cobrancasEnviadas = 0;
  
  dados.forEach(reg => {
    // Agora cobramos apenas ATRASADOS e que NÃO tem protocolo.
    if (reg.situacao === 'PENDENTE EM ATRASO' && !reg.temProtocolo) {
      let tipoCobranca = 'COBRANÇA_DEVOLUÇÃO';
      let mensagem = `🚨 CONTROLE DE VALE-PALETES — THX\n📅 Cobrança: ${formatDate(new Date())}\n⚠️ PALETE PENDENTE EM ATRASO\n🚛 Motorista: ${reg.motorista}\n🚘 Placa: ${reg.placa}\n📋 Plano: ${reg.plano}\n🏢 Cliente: ${reg.cliente}\n🎫 Vale-palete: ${reg.valePalete}\n📦 Quantidade: ${reg.qtdePaletes} paletes\n📅 Ocorrência: ${formatDate(reg.dataOcorrencia)}\n⏱️ Prazo: ${formatDate(reg.dataLimite)}\n⏳ Tempo em aberto: ${reg.diasAberto} dias\n🔴 Situação: PENDENTE EM ATRASO\n👉 Ação: Favor cobrar o motorista pela devolução e protocolo.`;
      
      const jaCobrado = logCobrancas.some(l => l.valePalete === reg.valePalete && l.tipo === tipoCobranca && l.data === formatDate(new Date()).split(' ')[0]);
      
      if (!jaCobrado) {
        if (CONFIG.MODO_TESTE) {
          Logger.log(`[MODO TESTE] Envio de ${tipoCobranca} para VP ${reg.valePalete}:\n${mensagem}`);
        } else {
          enviarGoogleChat(webhookUrl, mensagem);
        }
        registrarLogCobranca(reg, tipoCobranca, mensagem, CONFIG.MODO_TESTE ? 'TESTE' : 'ENVIADO');
        cobrancasEnviadas++;
      }
    }
  });
  
  Logger.log(`Processo concluído. Cobranças enviadas/simuladas: ${cobrancasEnviadas}`);
}

function enviarGoogleChat(webhookUrl, mensagem) {
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ text: mensagem })
  };
  UrlFetchApp.fetch(webhookUrl, options);
}

function obterLogCobrancas() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.PLANILHA_PROTOCOLOS_ID);
    let sheet = ss.getSheetByName('LOG DE COBRANÇAS');
    if (!sheet) {
      sheet = ss.insertSheet('LOG DE COBRANÇAS');
      sheet.appendRow(['Data', 'Hora', 'Vale-palete', 'Plano', 'Motorista', 'Placa', 'Tipo', 'Mensagem', 'Status', 'Data/hora do envio']);
    }
    const data = sheet.getDataRange().getValues();
    const logs = [];
    for (let i = 1; i < data.length; i++) {
      logs.push({
        data: data[i][0],
        valePalete: data[i][2],
        tipo: data[i][6]
      });
    }
    return logs;
  } catch(e) {
    return [];
  }
}

function registrarLogCobranca(reg, tipo, mensagem, status) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.PLANILHA_PROTOCOLOS_ID);
    let sheet = ss.getSheetByName('LOG DE COBRANÇAS');
    const agora = new Date();
    sheet.appendRow([
      formatDate(agora).split(' ')[0], // Data
      formatDate(agora).split(' ')[1], // Hora
      reg.valePalete,
      reg.plano,
      reg.motorista,
      reg.placa,
      tipo,
      mensagem,
      status,
      agora
    ]);
  } catch(e) {
    Logger.log('Erro ao gravar log: ' + e);
  }
}

function testarCobranca() {
  Logger.log('Iniciando Teste de Cobrança...');
  const oldTeste = CONFIG.MODO_TESTE;
  CONFIG.MODO_TESTE = true;
  enviarCobrancasAutomaticas();
  CONFIG.MODO_TESTE = oldTeste;
}
