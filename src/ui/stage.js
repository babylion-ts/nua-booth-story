// Story Stage — 유일한 화면. (미니멀 구성: 아트워크 + 탭 넘김만)
// 배경 레이어(페이지 아트워크) + 탭 영역 + (Planned) 히트영역.
// 페이지 전환 = 두 레이어 크로스페이드 (opacity 160ms). 슬라이드·줌·바운스 없음.

import { createTapZones } from './tapZones.js';

/**
 * @param {HTMLElement} mount
 * @param {ReturnType<import('../store.js').createStore>} store
 * @param {{ src:(rel:string)=>string }} deps  // src: 상대경로 → 실제 URL 해석
 */
export function createStage(mount, store, deps) {
  const { pages } = store.get();

  const stage = document.createElement('div');
  stage.className = 'stage';

  // --- 배경 레이어들 (모든 페이지를 쌓고 opacity 토글) ---
  const layerWrap = document.createElement('div');
  layerWrap.className = 'layers';
  const layers = pages.map((p) => {
    const layer = document.createElement('div');
    layer.className = 'layer';
    layer.style.backgroundImage = `url("${deps.src(p.src)}")`;
    layer.setAttribute('role', 'img');
    layer.setAttribute('aria-label', p.label);
    layerWrap.appendChild(layer);
    return layer;
  });

  // --- (Planned) 히트영역: 아트워크 좌표에 %로 얹는다 ---
  const hotspotWrap = document.createElement('div');
  hotspotWrap.className = 'hotspots';

  // --- 탭 영역 ---
  const tap = createTapZones(() => store.prev(), () => store.next());

  stage.append(layerWrap, hotspotWrap, tap.left, tap.right);
  mount.appendChild(stage);

  // 히트영역은 현재 페이지가 바뀔 때마다 다시 그린다.
  function renderHotspots(index) {
    hotspotWrap.replaceChildren();
    const page = pages[index];

    // reveal: 빈칸 탭 → 정답 이미지로 토글 (페이지 진입 시 원본으로 리셋)
    if (page.reveal) {
      const orig = deps.src(page.src);
      const answer = deps.src(page.reveal.src);
      new Image().src = answer;                       // 미리 로드 (탭 시 깜빡임 방지)
      layers[index].style.backgroundImage = `url("${orig}")`;
      let shown = false;
      const rb = document.createElement('button');
      rb.type = 'button';
      rb.className = 'hotspot';
      rb.setAttribute('aria-label', '정답 보기');
      rb.style.left = `${page.reveal.x}%`;
      rb.style.top = `${page.reveal.y}%`;
      rb.style.width = `${page.reveal.w}%`;
      rb.style.height = `${page.reveal.h}%`;
      rb.addEventListener('click', () => {
        shown = !shown;
        layers[index].style.backgroundImage = `url("${shown ? answer : orig}")`;
      });
      hotspotWrap.appendChild(rb);
    }

    const list = page.hotspots || [];
    for (const h of list) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hotspot';
      btn.setAttribute('aria-label', h.id);
      btn.style.left = `${h.x}%`;
      btn.style.top = `${h.y}%`;
      btn.style.width = `${h.w}%`;
      btn.style.height = `${h.h}%`;
      btn.addEventListener('click', () => {
        // action 규약: 지금은 openOverlay:<id> 만. 어댑터 확장 지점.
        if (typeof h.action === 'string' && h.action.startsWith('openOverlay:')) {
          store.openOverlay(h.action.slice('openOverlay:'.length));
        }
      });
      hotspotWrap.appendChild(btn);
    }
  }

  // --- store 구독 → 렌더 ---
  store.subscribe((state) => {
    const { index } = state;
    layers.forEach((l, i) => { l.style.opacity = i === index ? '1' : '0'; });
    renderHotspots(index);
    // 오버레이 열림 여부에 따라 탭영역 비활성화
    const locked = !!state.overlay;
    tap.left.disabled = locked;
    tap.right.disabled = locked;
  });

  return { el: stage };
}
