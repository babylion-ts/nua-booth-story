# 신청폼 → 구글 시트 연동 (무료, 서버 불필요)

Google Apps Script 웹앱을 만들어 폼 데이터를 구글 시트에 자동으로 쌓습니다.
5분이면 됩니다.

## 1. 구글 시트 만들기
- 브라우저에서 https://sheets.new 접속 → 빈 시트 생성 (이름 예: `NUA 신청`)

## 2. Apps Script 열기
- 시트 상단 메뉴 **확장 프로그램 → Apps Script**
- 기본 코드(`function myFunction(){}`)를 **전부 지우고**, 프로젝트의 **`apps-script.gs`** 내용을 **복사해 붙여넣기**
- 저장(💾 또는 Ctrl/⌘+S)

## 3. 웹앱으로 배포
1. 오른쪽 위 **배포 → 새 배포**
2. 톱니바퀴(유형 선택) → **웹 앱**
3. 설정:
   - 설명: 아무거나 (예: nua form)
   - **다음 사용자로 실행: 나**
   - **액세스 권한이 있는 사용자: 모든 사용자**
4. **배포** 클릭 → 처음이면 **권한 승인**(내 계정 선택 → "고급" → "안전하지 않음(이동)" → 허용)
5. 나오는 **웹 앱 URL** 복사 (형식: `https://script.google.com/macros/s/AKfycb.../exec`)

## 4. 폼에 URL 연결
- 파일 **`src/overlay/submitApplication.js`** 열기
- 맨 위 줄
  ```js
  const SHEET_URL = '';
  ```
  에 복사한 URL을 붙여넣기:
  ```js
  const SHEET_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
  ```

## 5. 재배포
- 수정한 파일을 GitHub에 올리면(교체 업로드/push) Vercel이 자동 재배포합니다.

## 확인
- 배포된 사이트에서 신청 폼을 제출 → 구글 시트 `신청` 탭에 행이 추가되면 성공.
- 컬럼: 접수시각 · 이름 · 나이 · 연락처 · 지역 · 희망 시간대 · 동의

## 참고
- 전송 실패(네트워크 등)해도 태블릿 브라우저 **localStorage에 백업**됩니다.
  (개발자도구 콘솔에서 `localStorage.getItem('nua.applications.v1')` 로 확인/복구 가능)
- 코드나 컬럼을 바꾸면 Apps Script에서 **배포 → 배포 관리 → 편집 → 새 버전**으로 다시 배포하세요.
  (URL은 그대로 유지됩니다)
- **개인정보**: 시트 공유 범위를 최소화하고, 이벤트 종료 후 데이터를 삭제하세요.
