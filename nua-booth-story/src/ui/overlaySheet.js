// 오버레이 화면 — 하단에서 올라오는 iOS 바텀 시트.
// 히트영역 탭 → store.overlay = id → 해당 이미지(결과지/스타일링)를 시트로 띄운다.
// 스펙: 상단 라운드 34px, 시트 섀도, 등장 300ms cubic-bezier(0.4,0,0.2,1).
// 열려 있는 동안 좌우 탭 넘김 비활성화(store/stage 에서 처리). 닫기는 명시적 닫기 버튼.

const CLOSE_MS = 300;

/**
 * @param {ReturnType<import('../store.js').createStore>} store
 * @param {Record<string,{src:string,title?:string}>} overlays  // overlays.json
 * @param {{ src:(rel:string)=>string }} deps
 */
export function createOverlaySheet(store, overlays, deps) {
  const root = document.createElement('div');
  root.className = 'overlay';
  root.hidden = true;
  root.innerHTML = `
    <div class="overlay__backdrop"></div>
    <div class="overlay__sheet" role="dialog" aria-modal="true" aria-label="상세 보기">
      <div class="overlay__bar">
        <span class="overlay__grabber" aria-hidden="true"></span>
        <span class="overlay__title"></span>
        <button class="overlay__close" type="button" aria-label="닫기">
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="overlay__scroll">
        <img class="overlay__img" alt="">
      </div>
    </div>`;

  const sheet = root.querySelector('.overlay__sheet');
  const titleEl = root.querySelector('.overlay__title');
  const scroll = root.querySelector('.overlay__scroll');
  const img = root.querySelector('.overlay__img');
  const closeBtn = root.querySelector('.overlay__close');

  closeBtn.addEventListener('click', () => store.closeOverlay());
  // 스펙: 닫기는 명시적 닫기 버튼으로 → 백드롭 탭으로는 닫지 않는다.

  let closeTimer = 0;
  let current = null;

  store.subscribe((state) => {
    const id = state.overlay;
    if (id === current) return;
    current = id;

    if (id && overlays[id]) {
      const o = overlays[id];
      img.src = deps.src(o.src);
      img.alt = o.title || id;
      titleEl.textContent = o.title || '';
      scroll.scrollTop = 0;
      clearTimeout(closeTimer);
      root.hidden = false;
      // 다음 프레임에 열림 클래스 → transform/opacity 트랜지션 발동
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-open')));
    } else {
      root.classList.remove('is-open');
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => { root.hidden = true; img.removeAttribute('src'); }, CLOSE_MS);
    }
  });

  return { el: root };
}
