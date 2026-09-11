function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Controle de Vale-Paletes - THX')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Execute esta função no editor do Apps Script uma única vez
 * para o Google solicitar a permissão de envio de e-mails (MailApp).
 */
function autorizarPermissoes() {
  var quota = MailApp.getRemainingDailyQuota();
  Logger.log('Permissões concedidas! Cota diária restante de e-mails: ' + quota);
}
