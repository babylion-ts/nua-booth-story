// pages.json 로드 + 정규화.
// 페이지 데이터는 코드에 하드코딩하지 않는다 (README: pages.json 으로 분리).
// 런타임 fetch 이므로 페이지 추가 = 이미지 1장 + JSON 한 줄 (리빌드 불필요).

import { PAGES_URL } from './config.js';

/**
 * @typedef {Object} Hotspot   // Planned: Overlay Screens 용 (%로 정의)
 * @property {string} id
 * @property {number} x  // 0..100 (아트워크 폭 대비 %)
 * @property {number} y  // 0..100 (아트워크 높이 대비 %)
 * @property {number} w  // 0..100
 * @property {number} h  // 0..100
 * @property {string} action  // openOverlay id 등
 *
 * @typedef {Object} Page
 * @property {string} src        // 예: "pages/01-hooking.png"
 * @property {string} label
 * @property {boolean} bottomSafe // false 면 하단 힌트 행 숨김
 * @property {Hotspot[]} [hotspots]
 */

/** @returns {Promise<Page[]>} */
export async function loadPages() {
  const res = await fetch(PAGES_URL, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`pages.json 로드 실패: ${res.status}`);
  const raw = await res.json();
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('pages.json 이 비어 있거나 배열이 아니다.');
  }
  return raw.map((p, i) => ({
    src: p.src,
    label: p.label ?? `page ${i + 1}`,
    // bottomSafe 미지정이면 true (안전측: 하단 행 표시). false 일 때만 숨긴다.
    bottomSafe: p.bottomSafe !== false,
    hotspots: Array.isArray(p.hotspots) ? p.hotspots : [],
    reveal: p.reveal || null,   // 빈칸 정답 노출용 (선택)
  }));
}
