# 배포 가이드 (GitHub → Vercel)

이 폴더(`nua-booth-story`)는 **빌드가 필요 없는 정적 사이트**입니다. 그대로 올리면 됩니다.

## 0. 로컬에서 미리보기 (선택)
```bash
python3 -m http.server 4173
# http://localhost:4173  (풀스크린 체험: http://localhost:4173/?mode=kiosk)
```

## 1. GitHub에 올리기

### A. 로컬 저장소 만들기 (이 폴더에서)
```bash
cd "nua-booth-story"
git init
git add .
git commit -m "NUA 부스 스토리 키오스크"
git branch -M main
```

### B. GitHub에 새 저장소 만들기
1. https://github.com/new 접속
2. Repository name 예) `nua-booth-story` 입력 → **Create repository** (README 등 체크 안 함)

### C. 원격 연결 후 푸시 (본인 계정/저장소명으로 바꾸기)
```bash
git remote add origin https://github.com/<본인아이디>/nua-booth-story.git
git push -u origin main
```
> 푸시 시 GitHub 로그인/토큰 필요. (비밀번호 대신 Personal Access Token)

## 2. Vercel에 배포

1. https://vercel.com 로그인 → **Add New… → Project**
2. **Import Git Repository** 에서 방금 만든 `nua-booth-story` 선택
3. 설정(대부분 자동 인식):
   - **Framework Preset**: `Other`
   - **Build Command**: 비움 (없음)
   - **Output Directory**: 비움 (루트 그대로)
   - **Root Directory**: `./` (저장소 루트가 곧 사이트 루트)
4. **Deploy** 클릭 → 잠시 후 `https://nua-booth-story-xxxx.vercel.app` 주소 발급

## 3. 공유

- 데스크톱 미리보기: `https://<주소>/`
- **풀스크린(부스 체험)**: `https://<주소>/?mode=kiosk`

## 이후 수정 반영
파일 수정 후:
```bash
git add . && git commit -m "수정" && git push
```
→ Vercel이 자동으로 다시 배포합니다.

## 참고
- 폰트(Pretendard)는 CDN에서 불러오므로 별도 설정 불필요.
- `.devserver.py`(로컬 무캐시 서버)와 `DEPLOY.md`는 `.vercelignore`로 배포에서 제외됨.
- 페이지 추가·이미지 교체는 파일만 바꾸고 다시 push 하면 됩니다(리빌드 없음).
