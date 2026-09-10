# 🚀 [모여봐] Vercel 배포 및 실사용 가이드

본 가이드는 제작된 카카오톡 기반 일정 공유 & 빈 시간 찾기 앱 **모여봐(Moyeobwa)**를 **Vercel** 환경에 무료로 배포하고 실사용하기 위한 단계별 안내서입니다.

---

## 📌 1. Vercel 원클릭 배포 단계 (GitHub 연동)

### Step 1: GitHub 저장소 업로드
현재 완성된 프로젝트를 본인의 GitHub 계정에 푸시(Push)합니다.

```bash
git init
git add .
git commit -m "feat: 모여봐 카카오 캘린더 서비스 구축 완료"
git branch -M main
git remote add origin https://github.com/사용자계정/moyeobwa-calendar.git
git push -u origin main
```

### Step 2: Vercel 대시보드 연결
1. [Vercel 공식 사이트](https://vercel.com)에 로그인 (GitHub 계정으로 간편 로그인 권장).
2. **"Add New..."** → **"Project"** 클릭.
3. GitHub 저장소 목록에서 `moyeobwa-calendar` 선택 후 **"Import"** 클릭.
4. Framework Preset이 **Next.js**로 자동 감지됩니다.
5. **"Deploy"** 버튼 클릭 (약 1분 이내 배포 완료!).

---

## 🔑 2. 카카오 개발자 센터 API 키 설정 (실제 로그인/공유 연동)

배포된 도메인(예: `https://moyeobwa.vercel.app`)을 카카오 API와 연결하는 과정입니다.

1. [카카오 개발자 센터](https://developers.kakao.com) 접속 후 로그인.
2. **내 애플리케이션** → **애플리케이션 추가하기** (앱 이름: `모여봐`).
3. **[앱 키]** 메뉴에서 **'요약 정보'** 확인:
   - `JavaScript 키` (프론트엔드 카카오톡 공유용)
   - `REST API 키` (백엔드 카카오 로그인용)
4. **[플랫폼]** → **Web 플랫폼 등록**:
   - 사이트 도메인에 Vercel 도메인 등록 (예: `https://moyeobwa.vercel.app`, `http://localhost:3000`)
5. **[카카오 로그인]**:
   - 활성화 설정: `ON`
   - Redirect URI 등록: `https://moyeobwa.vercel.app/api/auth/kakao`
6. **Vercel 환경 변수(Environment Variables) 등록**:
   - Vercel 대시보드 → Project Settings → **Environment Variables**
   - 아래 변수를 추가 후 **Save**:
     ```env
     NEXT_PUBLIC_KAKAO_JS_KEY=발급받은_JavaScript_키
     KAKAO_REST_API_KEY=발급받은_REST_API_KEY
     NEXT_PUBLIC_APP_URL=https://본인앱.vercel.app
     ```
   - **Redeploy** 클릭으로 환경 변수 적용!

---

## 🗄️ 3. PostgreSQL 데이터베이스 연동 (선택 - 실사용 확장 시)

프로젝트에는 **Prisma ORM 스키마**(`prisma/schema.prisma`)와 인덱스 최적화가 포함되어 있습니다.

Vercel 또는 Supabase/Neon의 무료 PostgreSQL DB를 연동하려면:
1. Vercel 대시보드의 **Storage** 탭에서 **Postgres (Neon)** 또는 **Supabase** 생성 (무료).
2. 제공된 `DATABASE_URL`을 Vercel 환경 변수에 추가.
3. 로컬에서 아래 명령어로 마이그레이션 실행:
   ```bash
   npx prisma db push
   ```

---

## 📱 4. 모바일 PWA (홈 화면에 추가) 설정

이 앱은 PWA(Progressive Web App) 규격을 완벽히 지원합니다.
- **iOS (Safari)**: 공유 버튼 → `홈 화면에 추가` 클릭 시 네이티브 앱처럼 실행.
- **Android (Chrome)**: 상단 메뉴 → `앱 설치` 또는 `홈 화면에 추가` 클릭.

---

## ⚙️ 기능 요약
- **OAuth 2.0 / 카카오 SDK**: 카카오 간편 로그인 및 카카오톡 딥링크 초대 전송.
- **다중 캘린더**: 개인 캘린더 및 공유 그룹 캘린더 생성/관리.
- **비공개(Private) 일정 레벨 (EVENT-02)**: 타인에게는 `🔒 바쁨`으로만 표시.
- **빈 시간 찾기 엔진 (TIME-01/02)**: O(N) 구간 병합(Interval Merging) 알고리즘으로 겹침 없는 공통 가용 시간 자동 계산 및 1클릭 약속 등록.
