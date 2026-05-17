## Frontend (React + Vite)

Vite 기반 React 프론트엔드 프로젝트입니다.  
React Router 대신 해시 라우팅(`#/...`)으로 화면을 전환합니다.

---

## 실행 방법

```bash
cd GitHub/Frontend
npm install
npm run dev
```

브라우저 접속:

- 개발 서버: `http://localhost:5173/#/`

---

## 라우트

현재 프로젝트에서 사용하는 주요 해시 라우트입니다.

- `#/` : 메인(Home)
- `#/top10` : 인기 폰트 목록 페이지
- `#/english-fonts` : 영어 폰트 목록 페이지
- `#/english-detail` : 영어 폰트 상세 페이지
- `#/selected` : 선택 상세 페이지
- `#/handwriting` : 손글씨 제작 페이지
- `#/my-page` : 마이페이지
- `#/profile-edit` : 프로필 수정 페이지
- `#/reviews` : 리뷰 관리 페이지
- `#/login` : 로그인 페이지

라우트 로직은 `src/App.tsx`에서 해시 값을 읽어 각 페이지 컴포넌트를 선택하는 방식으로 동작합니다.

---

## 폴더 구조

### 루트 (`/`)

```text
Frontend/
├─ package.json
├─ package-lock.json
├─ vite.config.ts
├─ eslint.config.js
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ index.html
├─ src/
└─ public/
```

참고:

- `node_modules/` : `npm install` 후 생성되는 의존성 폴더
- `dist/` : `npm run build` 후 생성되는 빌드 결과 폴더

### 코드 (`src/`)

```text
src/
├─ main.tsx
├─ App.tsx
├─ pages/
│  ├─ HomePage.tsx
│  ├─ Top10Page.tsx
│  ├─ EnglishFontsPage.tsx
│  ├─ EnglishDetailPage.tsx
│  ├─ SelectedPage.tsx
│  ├─ HandwritingPage.tsx
│  ├─ MyPage.tsx
│  ├─ ProfileEditPage.tsx
│  ├─ ReviewPage.tsx
│  └─ LoginPage.tsx
├─ components/
│  ├─ Header.tsx
│  └─ Footer.tsx
└─ styles/
   ├─ globals.css
   └─ pages/
      ├─ home.css
      ├─ top10.css
      ├─ english-fonts.css
      ├─ english-detail.css
      ├─ selected.css
      ├─ handwriting.css
      ├─ my-page.css
      ├─ profile-edit.css
      ├─ review.css
      └─ login.css
```

### 정적 파일 (`public/`)

```text
public/
├─ favicon.svg
├─ icons.svg
└─ images/
   ├─ brand/
   ├─ common/
   └─ my-page/
```

---

## 참고

- 공통 레이아웃 요소는 `src/components/`에서 관리합니다.
- 페이지별 스타일은 `src/styles/pages/`에서 분리해 관리합니다.
- 이미지 및 아이콘은 `public/images/...` 경로를 기준으로 참조합니다.
