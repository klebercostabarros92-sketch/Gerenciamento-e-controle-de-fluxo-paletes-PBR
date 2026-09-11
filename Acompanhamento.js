// ===================================================================
// ACOMPANHAMENTO.JS
// Salva e carrega dados de acompanhamento (status motorista + link ação)
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
    ws.getRange(1, 1, 1, 3).setValues([['vale_palete', 'status_motorista', 'link_acao']]);
    ws.getRange(1, 1, 1, 3).setFontWeight('bold');
  }
  return ws;
}

/**
 * Carrega todos os registros de acompanhamento e retorna um mapa:
 * { 'VP_KEY': { statusMotorista: '...', linkAcao: '...' } }
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
          linkAcao: String(data[i][2] || '').trim()
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
 * @param {string} campo - 'statusMotorista' ou 'linkAcao'
 * @param {string} valor - valor a salvar
 */
function salvarAcompanhamento(valePalete, campo, valor) {
  try {
    var ws = getAbaAcompanhamento_();
    var data = ws.getDataRange().getValues();
    var vpStr = String(valePalete).trim();
    
    // Mapa de campo para índice de coluna (1-based)
    var colMap = { statusMotorista: 2, linkAcao: 3 };
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
