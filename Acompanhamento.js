// ===================================================================
// ACOMPANHAMENTO.JS
// Salva e carrega dados de acompanhamento (status motorista + link ação + solicitação luiz)
// em uma aba "acompanhamento" na planilha de protocolos da THX.
// ===================================================================

var ABA_ACOMPANHAMENTO = 'acompanhamento';

/**
 * Retorna ou cria a aba de acompanhamento na planilha de protocolos.
 */
function getAbaAcompanhamento_() {
  var ss = SpreadsheetApp.openById(CONFIG.PLANILHA_PROTOCOLOS_ID);
  var ws = ss.getSheetByName(ABA_ACOMPANHAMENTO);
  if (!ws) {
    ws = ss.insertSheet(ABA_ACOMPANHAMENTO);
    ws.getRange(1, 1, 1, 4).setValues([['vale_palete', 'status_motorista', 'link_acao', 'solicitacao_luiz']]);
    ws.getRange(1, 1, 1, 4).setFontWeight('bold');
  }
  return ws;
}

/**
 * Carrega todos os registros de acompanhamento e retorna um mapa:
 * { 'VP_KEY': { statusMotorista: '...', linkAcao: '...', solicitacaoLuiz: '...' } }
 */
function getAcompanhamentoMap() {
  try {
    var ws = getAbaAcompanhamento_();
    var data = ws.getDataRange().getValues();
    var map = {};
    for (var i = 1; i < data.length; i++) {
      var vp = String(data[i][0]).trim();
      if (vp) {
        map[vp] = {
          statusMotorista: String(data[i][1] || 'ATIVO').trim(),
          linkAcao: String(data[i][2] || '').trim(),
          solicitacaoLuiz: String(data[i][3] || '').trim()
        };
      }
    }
    return map;
  } catch (e) {
    Logger.log('getAcompanhamentoMap error: ' + e);
    return {};
  }
}

/**
 * Salva ou atualiza um campo de acompanhamento para um VP específico.
 * Chamado via google.script.run do frontend.
 * @param {string} valePalete - chave do vale palete
 * @param {string} campo - 'statusMotorista', 'linkAcao' ou 'solicitacaoLuiz'
 * @param {string} valor - valor a salvar
 */
function salvarAcompanhamento(valePalete, campo, valor) {
  try {
    var ws = getAbaAcompanhamento_();
    var data = ws.getDataRange().getValues();
    var vpStr = String(valePalete).trim();
    
    // Mapa de campo para índice de coluna (1-based)
    var colMap = { statusMotorista: 2, linkAcao: 3, solicitacaoLuiz: 4 };
    var colIdx = colMap[campo];
    if (!colIdx) return JSON.stringify({ success: false, error: 'Campo inválido: ' + campo });
    
    // Procura linha existente
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === vpStr) {
        ws.getRange(i + 1, colIdx).setValue(valor);
        return JSON.stringify({ success: true });
      }
    }
    
    // Não encontrou — cria nova linha
    var newRow = ws.getLastRow() + 1;
    ws.getRange(newRow, 1).setValue(vpStr);
    ws.getRange(newRow, colIdx).setValue(valor);
    
    return JSON.stringify({ success: true });
  } catch (e) {
    Logger.log('salvarAcompanhamento error: ' + e);
    return JSON.stringify({ success: false, error: e.toString() });
  }
}

/**
 * Envia e-mail para luizhenrique@3coracoes.com.br solicitando a exclusão/baixa da pendência protocolada.
 */
function solicitarBaixaLuiz(dados) {
  try {
    var destinatario = 'luizhenrique@3coracoes.com.br';
    var emailKleber = 'kleber.costa@thxgroup.com.br';
    var assunto = 'Solicitação de Baixa de Vale-Palete Protocolado — VP: ' + dados.valePalete + ' / Plano: ' + (dados.plano || '-') + ' — THX';
    
    var corpoTexto = 
      'Olá Luiz,\n\n' +
      'Identificamos que o vale-palete abaixo já foi devidamente protocolado internamente pela THX, porém ainda consta com pendência de devolução no controle da 3 Corações:\n\n' +
      '• Vale-Palete: ' + dados.valePalete + '\n' +
      '• Nº Protocolo THX: ' + (dados.numeroProtocolo || '-') + '\n' +
      '• Nº Plano de Viagem: ' + (dados.plano || '-') + '\n' +
      '• Data da Ocorrência: ' + (dados.ocorrencia || '-') + '\n' +
      '• Cliente: ' + (dados.cliente || '-') + '\n' +
      '• Motorista: ' + (dados.motorista || '-') + '\n' +
      '• Placa: ' + (dados.placa || '-') + '\n' +
      '• Quantidade de Paletes: ' + (dados.qtdePaletes || 0) + '\n' +
      '• Valor da Pendência: ' + (dados.valor || '-') + '\n\n' +
      'Solicitamos a gentileza de providenciar a baixa/exclusão desta pendência na base da 3 Corações.\n\n' +
      'Atenciosamente,\n' +
      'Kleber Costa\n' +
      'Controle Operacional de Vale-Paletes — THX Transportes\n' +
      emailKleber;

    var corpoHtml = 
      '<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px;">' +
        '<h3 style="color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">' +
          'Solicitação de Baixa de Vale-Palete Protocolado' +
        '</h3>' +
        '<p>Olá <strong>Luiz</strong>,</p>' +
        '<p>Identificamos que o vale-palete abaixo já foi devidamente protocolado internamente pela <strong>THX</strong>, porém ainda consta com pendência de devolução no controle da 3 Corações:</p>' +
        '<table style="width: 100%; border-collapse: collapse; margin: 15px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">' +
          '<tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0; width: 40%;">Vale-Palete:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #1e40af;">' + dados.valePalete + '</td></tr>' +
          '<tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Nº Protocolo THX:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #047857;">' + (dados.numeroProtocolo || '-') + '</td></tr>' +
          '<tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Nº Plano:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">' + (dados.plano || '-') + '</td></tr>' +
          '<tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Data da Ocorrência:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">' + (dados.ocorrencia || '-') + '</td></tr>' +
          '<tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Cliente:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">' + (dados.cliente || '-') + '</td></tr>' +
          '<tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Motorista:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">' + (dados.motorista || '-') + '</td></tr>' +
          '<tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Placa:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">' + (dados.placa || '-') + '</td></tr>' +
          '<tr><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Quantidade de Paletes:</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">' + (dados.qtdePaletes || 0) + '</td></tr>' +
          '<tr><td style="padding: 8px 12px; font-weight: bold;">Valor da Pendência:</td><td style="padding: 8px 12px; font-weight: bold; color: #b91c1c;">' + (dados.valor || '-') + '</td></tr>' +
        '</table>' +
        '<p>Solicitamos, por gentileza, a <strong>baixa/exclusão desta pendência</strong> na base da 3 Corações.</p>' +
        '<br/>' +
        '<p style="font-size: 13px; color: #64748b;">Atenciosamente,<br/><strong>Kleber Costa</strong><br/>Controle Operacional de Vale-Paletes — THX Transportes<br/>' + emailKleber + '</p>' +
      '</div>';

    MailApp.sendEmail({
      to: destinatario,
      cc: emailKleber,
      replyTo: emailKleber,
      name: 'Kleber Costa - THX Transportes',
      subject: assunto,
      body: corpoTexto,
      htmlBody: corpoHtml
    });

    var dataEnvio = new Date().toLocaleString('pt-BR');
    salvarAcompanhamento(dados.valePalete, 'solicitacaoLuiz', dataEnvio);

    return JSON.stringify({ success: true, message: 'E-mail enviado com sucesso!', dataEnvio: dataEnvio });
  } catch (e) {
    Logger.log('solicitarBaixaLuiz error: ' + e);
    return JSON.stringify({ success: false, error: e.toString() });
  }
}
