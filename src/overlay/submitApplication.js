const SHEET_URL = '여기에_URL_붙여넣기';
const STORE_KEY = 'nua.applications.v1';

export async function submitApplication(payload) {
  const record = { id: crypto.randomUUID(), at: new Date().toISOString(), ...payload };
  try {
    const prev = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    prev.push(record);
    localStorage.setItem(STORE_KEY, JSON.stringify(prev));
  } catch (e) {}
  if (SHEET_URL) {
    try {
      await fetch(SHEET_URL, { method:'POST', mode:'no-cors',
        headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify(record) });
    } catch (e) {}
  }
  return { ok: true, id: record.id };
}
