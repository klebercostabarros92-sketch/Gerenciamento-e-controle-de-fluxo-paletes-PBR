function criarTriggers() {
  removerTriggers();
  
  // Executar domingo a sexta às 22:00 (timezone de SP)
  ScriptApp.newTrigger('executarRotinaDiaria')
    .timeBased()
    .atHour(CONFIG.HORARIO_COBRANCA)
    .inTimezone(CONFIG.TIMEZONE)
    .everyDays(1)
    .create();
    
  Logger.log('Triggers criados com sucesso.');
}

function removerTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'executarRotinaDiaria') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

function executarRotinaDiaria() {
  const dataAtual = new Date();
  const diaSemana = dataAtual.getDay(); // 0 = Domingo, 6 = Sábado
  
  if (CONFIG.DIAS_COBRANCA.indexOf(diaSemana) !== -1) {
    enviarCobrancasAutomaticas();
  } else {
    Logger.log('Hoje não é dia de cobrança (Sábado).');
  }
}
