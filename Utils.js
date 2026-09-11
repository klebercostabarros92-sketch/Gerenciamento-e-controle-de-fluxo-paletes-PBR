function normalizeString(str) {
  if (!str) return '';
  return String(str)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '') // Remove caracteres especiais e ESPAÇOS
    .replace(/^0+/, ''); // Remove zeros à esquerda
}

function normalizeTHX(str) {
  if (!str) return false;
  return str.toString().trim().toUpperCase() === 'THX';
}

function getHorasEmAberto(dataOcorrencia, dataDevolucao) {
  const finalDate = dataDevolucao ? new Date(dataDevolucao) : new Date();
  const startDate = new Date(dataOcorrencia);
  const diffTime = Math.abs(finalDate - startDate);
  return Math.floor(diffTime / (1000 * 60 * 60));
}

function calcularDataLimite(dataOcorrencia) {
  const data = new Date(dataOcorrencia);
  data.setHours(data.getHours() + CONFIG.PRAZO_HORAS);
  return data;
}

function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
