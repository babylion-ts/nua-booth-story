// 키오스크 운영 (신규 구현): 무입력 리셋 · 화면 꺼짐 방지 · 입력 하드닝 · 키보드 넘김.

import { IDLE_RESET_MS } from './config.js';

/**
 * 무입력 N초 → 1페이지로 리셋. 사용자 입력마다 타이머 재시작.
 * @param {ReturnType<import('./store.js').createStore>} store
 */
export function installIdleReset(store, ms = IDLE_RESET_MS) {
  let timer = 0;
  const kick = () => {
    clearTimeout(timer);
    timer = setTimeout(() => store.reset(), ms);
  };
  // passive: 스크롤 성능 영향 없음. 모든 상호작용을 입력으로 본다.
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) =>
    window.addEventListener(ev, kick, { passive: true }),
  );
  kick();
  return () => clearTimeout(timer);
}

/**
 * 키보드: → / Space = 다음, ← = 이전 (운영자 리모컨 대응).
 * @param {ReturnType<import('./store.js').createStore>} store
 */
export function installKeyboardNav(store) {
  const onKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      store.next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      store.prev();
    } else if (e.key === 'Escape') {
      store.closeOverlay();
    }
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}

/**
 * 화면 꺼짐 방지 (Wake Lock API). 탭 복귀 시 재획득.
 * 미지원 브라우저에서는 조용히 무시.
 */
export function installWakeLock() {
  let lock = null;
  const request = async () => {
    try {
      if ('wakeLock' in navigator && document.visibilityState === 'visible') {
        lock = await navigator.wakeLock.request('screen');
      }
    } catch {
      /* 사용자 제스처 필요/미지원 — 무시 */
    }
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') request();
  });
  request();
  return () => { try { lock?.release(); } catch { /* noop */ } };
}

/**
 * 확대·컨텍스트 메뉴·제스처 차단.
 * (스크롤/선택/오버스크롤은 CSS 에서 차단: user-select/touch-action/overscroll-behavior.)
 */
export function installInputHardening() {
  window.addEventListener('contextmenu', (e) => e.preventDefault());
  // iOS Safari 핀치 줌
  ['gesturestart', 'gesturechange', 'gestureend'].forEach((ev) =>
    document.addEventListener(ev, (e) => e.preventDefault()),
  );
  // 더블탭 줌 (touch-action:manipulation 로 대부분 차단되나, 보강)
  let lastTouch = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouch <= 300) e.preventDefault();
    lastTouch = now;
  }, { passive: false });
}
