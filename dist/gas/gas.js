function doGet() {
  return HtmlService.createTemplate(createHtml()).evaluate();
}
function createHtml() {
  var htmlUrl = 'https://raw.githubusercontent.com/naosim/pjfu/main/dist/index.html';
  var jsUrl = 'https://raw.githubusercontent.com/naosim/pjfu/main/dist/js/pjfu.js';
  var html = UrlFetchApp.fetch(htmlUrl).getContentText();
  var js = UrlFetchApp.fetch(jsUrl).getContentText();
  html = html.split('<script type="module" src="./js/pjfu.js"></script>').join('<script type="module">' + js + '</script>')
  return html;
}

function saveGasKeyValue(key, value) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(key);
  return sheet.getRange(1, 1, 1, 1).setValue(value);
}

function loadGasKeyValue(key) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(key);
  return sheet.getRange(1, 1, 1, 1).getValue();
}