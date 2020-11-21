function doGet() {
  return HtmlService.createTemplate(createHtml()).evaluate();
}
function createHtml() {
  var htmlUrl = 'https://raw.githubusercontent.com/naosim/pjfu/main/dist/index.html';
  var jsUrl = 'https://raw.githubusercontent.com/naosim/pjfu/main/dist/js/index/pjfu.js';
  var html = UrlFetchApp.fetch(htmlUrl).getContentText();
  var js = UrlFetchApp.fetch(jsUrl).getContentText().split('//# sourceMappingURL=/pjfu.js.map').join('');
//  html = html.split('<head>').join('<head><base target="_top">')
  html = html.split('<script src="./js/index/pjfu.js"></script>').join('<script>' + js + '</script>')
  html = html.split('<script src="./js/index/main.js"></script>').join('<script>' + mainJs() + '</script>')
  return html;
}

function mainJs() {
  // KeyValueIOの実装
  var js = `pjfu({
    save: function(key, value, callback) { google.script.run.withSuccessHandler((value)=> callback(null)).withFailureHandler((e) => callback(e)).savePjfu(key, value); },
    load: function(key, callback) {google.script.run.withSuccessHandler((value)=> callback(null, value)).withFailureHandler((e) => callback(e, null)).loadPjfu(key);}
  });
  `
  return js;
}

function savePjfu(key, value) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(key);
  return sheet.getRange(1, 1, 1, 1).setValue(value);
}

function loadPjfu(key) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(key);
  return sheet.getRange(1, 1, 1, 1).getValue();
}