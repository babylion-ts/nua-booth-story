// NUA 신청폼 → 구글 시트 수신 스크립트 (Google Apps Script)
// 사용법: 구글 시트 → 확장 프로그램 → Apps Script 에 이 코드를 전부 붙여넣고,
//        [배포 → 새 배포 → 웹 앱] 으로 배포한 뒤 나오는 URL을
//        src/overlay/submitApplication.js 의 SHEET_URL 에 넣으세요.

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('신청') || ss.insertSheet('신청');

    // 첫 행에 헤더 자동 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['접수시각', '이름', '나이', '연락처', '지역', '희망 시간대', '동의']);
    }

    var d = JSON.parse(e.postData.contents);
    var time = Array.isArray(d.time) ? d.time.join(', ') : (d.time || '');

    sheet.appendRow([
      new Date(),        // 접수시각
      d.name || '',      // 이름
      d.age || '',       // 나이
      d.phone || '',     // 연락처
      d.region || '',    // 지역
      time,              // 희망 시간대(여러 개면 쉼표로)
      d.consent ? '동의' : ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
