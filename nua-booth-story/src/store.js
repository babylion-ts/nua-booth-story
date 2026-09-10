// 상태 관리 (README: State Management).
//   index   : 현재 페이지 (0-based)
//   pages   : Page[]
//   overlay : 열려 있는 오버레이 화면 id | null (Planned)
// 진행바 칸 수·카운터·마지막 인덱스는 전부 pages.length 에서 파생 — 별도 상수 금지.

export function createStore(pages) {
  let state = { index: 0, pages, overlay: null };
  const listeners = new Set();
  let onPastEnd = null; // 마지막 페이지에서 '다음' 시 호출 (예: 다음 화면으로 이동)

  const emit = () => listeners.forEach((fn) => fn(state));
  const set = (patch) => {
    state = { ...state, ...patch };
    emit();
  };

  const clamp = (n) => Math.max(0, Math.min(state.pages.length - 1, n));

  return {
    get: () => state,
    subscribe(fn) {
      listeners.add(fn);
      fn(state); // 즉시 1회 (초기 렌더)
      return () => listeners.delete(fn);
    },
    // 마지막 페이지에서 '다음' 콜백 등록 (다음 화면으로 이동 등).
    setOnPastEnd(fn) { onPastEnd = fn; },
    // 오버레이가 열려 있으면 좌우 탭 넘김 비활성화 (README).
    next() {
      if (state.overlay) return;
      if (state.index >= state.pages.length - 1) { onPastEnd?.(); return; }
      set({ index: state.index + 1 });
    },
    prev() {
      if (state.overlay) return;
      set({ index: clamp(state.index - 1) });
    },
    goTo(n) {
      set({ index: clamp(n) }); // 썸네일/딥링크용
    },
    reset() {
      set({ index: 0, overlay: null });
    },
    // Planned: Overlay Screens. 히트 영역 탭 → openOverlay(id).
    openOverlay(id) {
      set({ overlay: id });
    },
    closeOverlay() {
      set({ overlay: null });
    },
  };
}
