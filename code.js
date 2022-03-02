let sheetName = "dados";
let scriptProp = PropertiesService.getScriptProperties();
function intialSetup() {
  let activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty("key", activeSpreadsheet.getId());
}
function doPost(e) {
  let lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    let doc = SpreadsheetApp.openById(scriptProp.getProperty("key"));
    let sheet = doc.getSheetByName(sheetName);
    let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let nextRow = sheet.getLastRow() + 1;
    let newRow = headers.map(function (header) {
      return header === "timestamp" ? new Date() : e.parameter[header];
    });
    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);
    return ContentService.createTextOutput(
      JSON.stringify({ result: "success", row: nextRow })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", error: e })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
