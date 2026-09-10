// Planned: 신청 폼 전송 어댑터 (다음 단계).
// 전송처가 미정이므로 "어댑터 한 겹"을 둔다.
//   초기: 로컬 저장  →  이후: API/시트 연동으로 이 함수만 교체.
//
// ⚠️ 개인정보 처리 주의 (README):
//   - 수집 동의 문구 필수
//   - 로컬 저장 시 암호화 (아래는 평문 임시 저장 — 운영 투입 전 반드시 교체)
//   - 운영 종료 후 삭제 절차 필요
// 폼 필드(디자인 04 시안): 이름·나이·연락처·지역·성별·프로그램·희망 일시.

const STORE_KEY = 'nua.applications.v1';

/**
 * @param {Record<string, unknown>} payload
 * @returns {Promise<{ ok: boolean, id: string }>}
 */
export async function submitApplication(payload) {
  const record = { id: crypto.randomUUID(), at: new Date().toISOString(), payload };

  // TODO(운영): 암호화 + 원격 전송으로 교체. 현재는 데모용 로컬 큐.
  try {
    const prev = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    prev.push(record);
    localStorage.setItem(STORE_KEY, JSON.stringify(prev));
  } catch (e) {
    return { ok: false, id: record.id };
  }
  return { ok: true, id: record.id };
}
