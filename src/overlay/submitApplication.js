// 신청 폼 전송 어댑터 — 구글 시트(Apps Script 웹앱)로 전송 + 로컬 백업.
//
// ▶ 설정: 아래 SHEET_URL 에 Google Apps Script 웹앱 주소를 붙여넣으세요.
//   (설정 방법은 프로젝트의 SHEETS연동.md 참고)
//   비워두면 로컬(localStorage)에만 저장됩니다.
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxSgWFzCof9IWrt97Ie8gI2ZXyQrV06XXg-o_x8vAMR7X-7xPTbiknAA7l31macYecR/exec'; // 예: 'https://script.google.com/macros/s/AKfycb.../exec'

const STORE_KEY = 'nua.applications.v1';

/**
 * @param {Record<string, unknown>} payload  // name, age, phone, region, time(배열), consent
 * @returns {Promise<{ ok: boolean, id: string }>}
 */
export async function submitApplication(payload) {
  const record = { id: crypto.randomUUID(), at: new Date().toISOString(), ...payload };

  // 1) 로컬 백업 (전송 실패 대비 — 항상 저장)
  try {
    const prev = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    prev.push(record);
    localStorage.setItem(STORE_KEY, JSON.stringify(prev));
  } catch (e) { /* 저장 실패해도 아래 전송은 시도 */ }

  // 2) 구글 시트로 전송 (Apps Script 웹앱)
  //    text/plain + no-cors → CORS 프리플라이트 없이 바로 전송 (응답은 읽지 않음)
  if (SHEET_URL) {
    try {
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(record),
      });
    } catch (e) { /* 네트워크 실패해도 로컬엔 남아있음 */ }
  }

  return { ok: true, id: record.id };
}
