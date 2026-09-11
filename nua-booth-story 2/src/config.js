// NUA 부스 태블릿 스토리 — 운영 상수
// 값만 여기서 조정한다. 매직넘버를 코드에 흩뿌리지 않는다.

// 기준 아트워크: 논리 크기 432×576pt (2x = 864×1152px). 3:4 세로.
export const LOGICAL_W = 432;
export const LOGICAL_H = 576;

// 무입력 후 1페이지로 리셋 (운영 중 조정 가능). README: 기본 60초.
export const IDLE_RESET_MS = 60_000;

// 페이지 목록 위치. 디자인팀은 이 파일과 pages/ 이미지만 건드리면 된다.
export const PAGES_URL = 'pages.json';
