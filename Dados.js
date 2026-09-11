function getBase3Coracoes() {
  const ss = SpreadsheetApp.openById(CONFIG.PLANILHA_3_CORACOES_ID);
  const sheet = ss.getSheets()[0]; // 1a aba
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  // Mapear indices (assumindo nomes padrão, mas idealmente seria dinâmico pelo header)
  const h = {};
  headers.forEach((header, i) => h[header.toString().trim()] = i);
  
  const registros = [];
  
  rows.forEach(row => {
    const transportadora = row[h['Transportadora']] || row[h['TRANSPORTADORA']] || row[9] || '';
    if (normalizeTHX(transportadora)) {
      registros.push({
        valePalete: row[h['Número do Vale-Palete']] || row[h['Número do Vale-Palete ']] || row[0],
        turno: row[h['Turno']] || row[1],
        plano: row[h['Número do Plano de Viagem']] || row[h['Nº Plano de Viagem']] || row[2],
        qtdePaletes: Number(row[h['Quantidade de Paletes Expedida']] || row[h['Qtde Paletes']] || row[3]) || 0,
        dataOcorrencia: row[h['Data da Ocorrência']] || row[h['Data Ocorrência']] || row[4],
        cliente: row[h['Nome do Cliente']] || row[5],
        placa: row[h['Placa do Veículo']] || row[h['Placa']] || row[6],
        motorista: row[h['Nome do Motorista']] || row[7],
        perfil: row[h['Perfil do Veículo']] || row[h['Perfil']] || row[8],
        transportadoraOriginal: transportadora,
        dataDevolucao: row[h['Data da Devolução do Palete']] || row[h['Data Devolução']] || row[10],
        statusOriginal: row[h['Status']] || row[11]
      });
    }
  });
  
  return registros;
}
