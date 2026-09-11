function realizarCruzamento() {
  const base3Coracoes = getBase3Coracoes();
  const protocolosMap = getProtocolos();
  const acompanhamentoMap = typeof getAcompanhamentoMap === 'function' ? getAcompanhamentoMap() : {};
  
  const registrosCruzados = base3Coracoes.map(reg => {
    const vpNormalizado = normalizeString(reg.valePalete);
    const planoNormalizado = normalizeString(reg.plano);
    
    let temProtocolo = false;
    let numeroProtocolo = '-';
    
    if (vpNormalizado && protocolosMap[vpNormalizado]) {
      temProtocolo = true;
      numeroProtocolo = protocolosMap[vpNormalizado];
    }
    
    if (!temProtocolo && planoNormalizado && protocolosMap[planoNormalizado]) {
      temProtocolo = true;
      numeroProtocolo = protocolosMap[planoNormalizado];
    }
    
    const devolvido = !!reg.dataDevolucao;
    const horasAberto = devolvido ? getHorasEmAberto(reg.dataOcorrencia, reg.dataDevolucao) : getHorasEmAberto(reg.dataOcorrencia, new Date());
    const diasAberto = Math.floor(horasAberto / 24);
    const emAtraso = !devolvido && diasAberto >= 3;
    
    let situacao = '';
    let cor = '';
    
    if (devolvido) {
      situacao = 'DEVOLVIDO';
      cor = '🟢';
    } else if (!devolvido && temProtocolo) {
      situacao = 'PENDENTE COM PROTOCOLO';
      cor = '🔵';
    } else if (!devolvido && !emAtraso) {
      situacao = 'PENDENTE NO PRAZO';
      cor = '🟡';
    } else if (!devolvido && emAtraso) {
      situacao = 'PENDENTE EM ATRASO';
      cor = '🔴';
    }
    
    const vpKey = String(reg.valePalete || '').trim();
    const ac = acompanhamentoMap[vpKey] || {};

    return {
      ...reg,
      vpNormalizado,
      planoNormalizado,
      temProtocolo,
      numeroProtocolo,
      statusMotorista: ac.statusMotorista || 'ATIVO',
      linkAcao: ac.linkAcao || '',
      solicitacaoLuiz: ac.solicitacaoLuiz || '',
      horasAberto,
      diasAberto,
      dataLimite: calcularDataLimite(reg.dataOcorrencia),
      situacao,
      cor,
      emitidoOntem: isOntem(reg.dataOcorrencia)
    };
  });
  
  return registrosCruzados;
}

function isOntem(dataOcorrencia) {
  if (!dataOcorrencia) return false;
  const data = new Date(dataOcorrencia);
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);
  return data.getDate() === ontem.getDate() &&
         data.getMonth() === ontem.getMonth() &&
         data.getFullYear() === ontem.getFullYear();
}

function obterDadosCompletos() {
  try {
    const dados = realizarCruzamento();
    return JSON.stringify({ success: true, data: dados });
  } catch (e) {
    Logger.log(e.toString());
    return JSON.stringify({ success: false, error: e.toString() });
  }
}
