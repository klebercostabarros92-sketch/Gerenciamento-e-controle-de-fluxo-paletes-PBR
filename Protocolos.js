function getProtocolos() {
  const ss = SpreadsheetApp.openById(CONFIG.PLANILHA_PROTOCOLOS_ID);
  const ws = ss.getSheetByName(CONFIG.ABA_PROTOCOLOS);
  if (!ws) return {};
  
  const data = ws.getDataRange().getValues();
  if (data.length === 0) return {};
  
  // Find the index of the 'Protocolo' column
  const header = data[0];
  let protocoloIdx = -1;
  for (let c = 0; c < header.length; c++) {
    if (String(header[c]).toLowerCase().includes('protocolo')) {
      protocoloIdx = c;
      break;
    }
  }
  
  const protocolosMap = {};
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    let numProtocolo = 'Sim'; // Fallback se a coluna estiver vazia
    if (protocoloIdx !== -1 && row[protocoloIdx]) {
      numProtocolo = String(row[protocoloIdx]).trim();
    }
    
    row.forEach(cell => {
      if (cell) {
        const norm = normalizeString(cell);
        if (norm) {
          protocolosMap[norm] = numProtocolo;
        }
      }
    });
  }
  return protocolosMap;
}
