// 컴포넌트 B — 탭 영역 (필수).
// 좌 26% = 이전, 우 74% = 다음. box-sizing: border-box 로 겹침 방지.
// 눌림 상태만 rgba(0,0,0,0.03); 스케일·리플·페이드 금지.

/**
 * @param {() => void} onPrev
 * @param {() => void} onNext
 */
export function createTapZones(onPrev, onNext) {
  const left = document.createElement('button');
  left.className = 'tapzone tapzone--left';
  left.type = 'button';
  left.setAttribute('aria-label', '이전 페이지');

  const right = document.createElement('button');
  right.className = 'tapzone tapzone--right';
  right.type = 'button';
  right.setAttribute('aria-label', '다음 페이지');

  // click 이 아니라 pointerup 계열이 아니라 click 사용: 가장 단순/확실.
  left.addEventListener('click', onPrev);
  right.addEventListener('click', onNext);

  return { left, right };
}
