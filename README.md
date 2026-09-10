# NUA 부스 태블릿 스토리 (Booth Story Kiosk)

오프라인 부스용 세로형 태블릿 홍보물. 화면을 탭하면 다음 페이지로 넘어가고,
상단 진행바가 현재 위치를 보여준다. (핸드오프 스펙: `../design_handoff_nua_booth_story/README.md`)

빌드 도구 없는 **바닐라 ES 모듈** 구현. 정적 서버 하나면 바로 돌아가고,
페이지 목록을 런타임에 읽으므로 **페이지 추가에 재빌드가 필요 없다.**

## 실행

정적 서버로 이 디렉터리를 서빙한다. 예:

```bash
python3 -m http.server 4173 --directory .
```

- 데스크톱 프리뷰: <http://localhost:4173/>  — 라운드 프레임 + 헤더 + 썸네일 레일
- 키오스크(풀스크린): <http://localhost:4173/?mode=kiosk>  — 프레임/헤더/레일 제거, 3:4 레터박스

> `?mode=preview` / `?mode=kiosk` 로 강제할 수 있고, 지정이 없으면
> PWA standalone(홈 화면 추가) 여부로 자동 판별한다.

## 조작

- 화면 우측 74% 탭 = 다음, 좌측 26% 탭 = 이전 (첫/마지막에서 멈춤, 순환 없음)
- 키보드(운영자 리모컨): `→` / `Space` = 다음, `←` = 이전
- 무입력 60초 → 1페이지로 자동 리셋 (`src/config.js` 의 `IDLE_RESET_MS`)

## 페이지 추가 (디자인팀)

1. 최종 아트워크 PNG(864×1152, 3:4)를 `pages/` 에 넣는다. **크롭·리사이즈 금지.**
2. `pages.json` 에 한 줄 추가한다:

```json
{ "src": "pages/03-newpage.png", "label": "설명" }
```

- 마지막 인덱스는 `pages.json` 길이에서 파생된다(상수 없음).
- 미니멀 구성이라 진행바·하단 힌트가 없다. (`bottomSafe` 필드는 지금은 무시된다 —
  하단 힌트를 다시 켤 때를 위한 호환용으로 남겨둠.)

새로고침이면 끝. 빌드 단계 없음.

## 태블릿 배치 (브라우저 UI 숨김)

- **iPad Safari**: 페이지를 홈 화면에 추가 → 아이콘 실행 (`apple-mobile-web-app-capable`).
- **Android**: PWA 설치(`display: standalone`) 또는 키오스크 브라우저.
- 확대·스크롤·선택·컨텍스트 메뉴 차단 + Wake Lock(화면 꺼짐 방지)은 기본 적용.

## 구조

```
index.html              메타(뷰포트/PWA) + 진입점
manifest.webmanifest    PWA standalone / portrait
pages.json              ← 페이지 목록 + 핫스팟 (디자인팀이 편집)
overlays.json           ← 오버레이 콘텐츠 맵 (id → 이미지/제목)
pages/*.png             ← 아트워크 (디자인팀이 추가)
overlays/*.png          ← 오버레이로 띄우는 상세 이미지
styles/tokens.css       Nuaa iOS 26 토큰 (셸에서 쓰는 값만)
styles/app.css          레이아웃 — 셸 UI 는 cqw 로 논리 px(432pt 기준) 스케일
src/config.js           운영 상수 (리셋 초 등)
src/pages.js            pages.json 로드/정규화
src/store.js            상태 (index / pages / overlay)
src/kiosk.js            무입력 리셋 · 키보드 · Wake Lock · 입력 하드닝
src/ui/                 stage / tapZones / overlaySheet
src/overlay/            (다음 단계) 신청 폼 전송 어댑터 스텁
```

## 오버레이 (핫스팟 → 바텀 시트)

아트워크 위 투명 히트영역을 탭하면 하단에서 이미지 시트가 올라온다.
현재 2페이지의 `mood reading` → 결과지 예시(파일3), `mood styling` → 퍼스널
컬러·골격진단(파일4)이 연결돼 있다.

**히트영역 추가** — `pages.json` 의 해당 페이지에 `hotspots` 를 넣는다 (좌표는 아트워크
대비 **%**, 최소 44×44pt):

```json
{ "id": "reading", "x": 36, "y": 18.5, "w": 28, "h": 16, "action": "openOverlay:reading" }
```

**오버레이 콘텐츠** — `overlays.json` 에서 id → 이미지/제목을 매핑한다:

```json
{ "reading": { "src": "overlays/reading.png", "title": "무드 리딩 — 결과지 예시" } }
```

- 이미지가 시트보다 길면 시트 안에서 세로 스크롤된다.
- 오버레이가 열려 있는 동안 좌우 탭 넘김은 잠긴다. 닫기는 시트의 닫기(×) 버튼(운영자는 `Esc`).
- 등장 300ms, 상단 라운드 34px, 시트 섀도 — 스펙값 그대로.

## 다음 단계 (신청 폼)

- `src/overlay/submitApplication.js` — 전송처 미정이라 어댑터 한 겹(현재 로컬 저장).
  실제 폼(이름·나이·연락처·지역·성별·프로그램·희망 일시)은 위 오버레이 시트 구조를
  재사용해 넣으면 된다. 개인정보 처리 시 **암호화·수집 동의·운영 종료 후 삭제** 필요
  (파일 상단 주석 참고).

## 스펙 대비 확인 (핸드오프 체크리스트)

- [x] 3:4 비율 유지, crop 없음 (letterbox)
- [x] 좌 26% / 우 74% 탭 영역, 겹침 없음
- [x] 크로스페이드 160ms, 다른 전환 효과 없음
- [x] 무입력 60초 리셋
- [~] 진행바 · 하단 힌트("탭해서 넘기기"/카운터) — **미니멀 디자인 요청으로 제거**
- [x] 확대·스크롤·선택 차단, 화면 꺼짐 방지
- [x] 페이지 추가가 이미지 + JSON 한 줄로 끝남
