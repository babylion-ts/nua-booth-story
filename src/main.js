// 부트스트랩: pages.json 로드 → store 생성 → stage 렌더 → 키오스크 운영 설치.

import { loadPages } from './pages.js';
import { createStore } from './store.js';
import { createStage } from './ui/stage.js';
import { createOverlaySheet } from './ui/overlaySheet.js';
import {
  installIdleReset,
  installKeyboardNav,
  installWakeLock,
  installInputHardening,
} from './kiosk.js';

// 페이지 이미지 src 는 pages.json 기준 상대경로. 문서 기준으로 해석한다.
const resolveSrc = (rel) => new URL(rel, document.baseURI).href;

// 프리뷰 vs 키오스크 모드.
//   - ?mode=kiosk  또는 PWA standalone → 풀스크린(라운드/섀도 제거, 헤더/레일 숨김)
//   - 그 외(데스크톱 프리뷰) → 라운드 38px + 시트 섀도 + 헤더/레일
function isKioskMode() {
  const q = new URLSearchParams(location.search);
  if (q.get('mode') === 'kiosk') return true;
  if (q.get('mode') === 'preview') return false;
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

async function boot() {
  const app = document.getElementById('app');
  const kiosk = isKioskMode();
  document.body.classList.toggle('is-kiosk', kiosk);
  document.body.classList.toggle('is-preview', !kiosk);

  let pages;
  try {
    pages = await loadPages();
  } catch (err) {
    app.innerHTML = `<div class="error">페이지를 불러오지 못했습니다.<br><small>${String(err.message || err)}</small></div>`;
    return;
  }

  // 오버레이 콘텐츠 맵 (mood reading / styling 히트영역 → 이미지 시트)
  let overlays = {};
  try {
    const r = await fetch('overlays.json', { cache: 'no-cache' });
    if (r.ok) overlays = await r.json();
  } catch { /* 오버레이 없음 — 무시 */ }

  const store = createStore(pages);

  // 마지막 페이지에서 '다음' 탭 → find your best style 페이지로 이동
  store.setOnPastEnd(() => { window.location.href = 'find/'; });

  // 프리뷰 헤더 (키오스크에서는 숨김)
  if (!kiosk) {
    const header = document.createElement('div');
    header.className = 'preview-header';
    header.innerHTML =
      `<span class="preview-header__title">NUA · 부스 태블릿 스토리</span>` +
      `<span class="preview-header__meta">세로 3:4 · ${pages.length}장</span>`;
    app.appendChild(header);
  }

  // 스테이지
  const stageMount = document.createElement('div');
  stageMount.className = 'stage-mount';
  app.appendChild(stageMount);
  createStage(stageMount, store, { src: resolveSrc });

  // 오버레이 시트 (mood reading / styling 히트영역 탭 → 이미지 시트)
  const overlay = createOverlaySheet(store, overlays, { src: resolveSrc });
  app.appendChild(overlay.el);

  // 프리뷰 썸네일 레일 (goTo 활용 — 운영자 편의). 키오스크에서는 숨김.
  if (!kiosk) {
    const rail = document.createElement('div');
    rail.className = 'rail';
    pages.forEach((p, i) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'rail__item';
      item.innerHTML =
        `<span class="rail__thumb" style="background-image:url('${resolveSrc(p.src)}')"></span>` +
        `<span class="rail__num">${String(i + 1).padStart(2, '0')}</span>`;
      item.addEventListener('click', () => store.goTo(i));
      rail.appendChild(item);
      store.subscribe((s) => item.classList.toggle('is-active', s.index === i));
    });
    app.appendChild(rail);
  }

  // 키오스크 운영
  installKeyboardNav(store);
  installIdleReset(store);
  installInputHardening();
  installWakeLock();
}

boot();
