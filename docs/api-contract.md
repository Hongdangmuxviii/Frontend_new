# API Contract Draft

프론트엔드 화면 구현 기준으로 백엔드에 필요한 응답 필드 초안입니다.

## 작업 목록

### `GET /works`

현재 사용자에게 표시할 폰트 작업 목록을 반환합니다.

```json
{
  "works": [
    {
      "id": "neo-modernist-sans",
      "title": "Neo-Modernist Sans",
      "updatedAt": "최근 업데이트: 12분 전",
      "progressPercent": 62,
      "phase": "retraining",
      "statusLabel": "IN PROGRESS",
      "queueLabel": null,
      "sample": "Aa",
      "previewLetters": ["가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타", "파", "하"],
      "downloadUrl": null
    }
  ]
}
```

### `phase`

프론트엔드는 아래 상태값을 기준으로 UI를 분기합니다.

- `queued`: 작업 대기. 한글 미리보기 없음.
- `analyzing`: 영문 분석 중. 한글 미리보기 없음.
- `preview_ready`: 14자 미리보기 생성 완료.
- `retraining`: AI 재학습 중. 14자 미리보기와 재학습 안내 표시.
- `finalizing`: 2,350자 폰트 빌드 중.
- `completed`: 작업 완료. `downloadUrl`이 있으면 TTF 다운로드 버튼 표시.
- `failed`: 작업 실패. 실패 메시지와 재시도/취소 액션 표시 예정.

## 작업 로그

### `GET /works/:workId/logs`

작업 카드의 상세 타임라인에 표시할 로그를 반환합니다.

```json
{
  "logs": [
    {
      "id": "neo-log-1",
      "time": "14:08",
      "title": "영문 스타일 분석 완료",
      "detail": "획 두께, 곡률, 세리프 특징 128개 파라미터 추출이 완료되었습니다.",
      "state": "done"
    }
  ]
}
```

### `state`

- `done`: 완료된 로그
- `active`: 현재 진행 중인 로그
- `waiting`: 대기 중인 로그
- `failed`: 실패한 로그

## 작업 액션

### `POST /works/:workId/cancel`

사용자가 `작업 취소` 또는 `학습 중단`을 눌렀을 때 호출할 예정입니다.

```json
{
  "ok": true
}
```

## 프론트엔드 연결 위치

- 타입: `src/types/work.ts`
- 목데이터: `src/mocks/works.ts`
- 화면: `src/pages/MyWorksPage.tsx`

백엔드 연동 시 `src/mocks/works.ts`의 `mockWorkItems`를 API 응답으로 교체하면 됩니다.

---

## 마이페이지

### `GET /me/profile`

```json
{
  "name": "폰티파이님",
  "joinedDaysLabel": "Fontify와 함께한지 124일째",
  "avatarSrc": "/images/my-page/profile-avatar.png"
}
```

### `GET /me/activity-summary`

```json
{
  "stats": [
    {
      "id": "likes",
      "label": "좋아요",
      "value": "14",
      "iconSrc": "/images/my-page/activity-like-icon.svg"
    },
    {
      "id": "reviews",
      "label": "작성한 리뷰",
      "value": "28",
      "iconSrc": "/images/my-page/activity-review-icon.png",
      "href": "#/reviews"
    },
    {
      "id": "working-fonts",
      "label": "작업중인 폰트",
      "value": "1",
      "iconSrc": "/images/my-page/activity-owned-font-icon.svg",
      "iconVariant": "darkOnWhite",
      "href": "#/my-works"
    }
  ]
}
```

### `GET /me/fonts`

```json
{
  "fonts": [
    {
      "id": "bareun-gothic",
      "title": "Aa바른고딕",
      "kind": "무료",
      "company": "디자인스튜디오",
      "sampleFontFamily": "'WenQuanYi Zen Hei', sans-serif"
    }
  ]
}
```

프론트 연결 위치:

- 타입: `src/types/user.ts`, `src/types/font.ts`
- 목데이터: `src/mocks/user.ts`
- 화면: `src/pages/MyPage.tsx`

---

## 리뷰

### `GET /reviews/pending-fonts`

```json
{
  "fonts": [
    {
      "id": "gwendolyn-signature",
      "label": "최근 다운로드",
      "name": "Gwendolyn Signature",
      "tone": "primary",
      "mark": "quote"
    }
  ]
}
```

### `GET /me/reviews`

```json
{
  "reviews": [
    {
      "id": "modern-archive-mono",
      "title": "Modern Archive Mono",
      "rating": 5,
      "sample": "ABCDEFGHIJKLMN\n0123456789",
      "sampleClass": "reviewSample--mono",
      "body": "기술 문서에 완벽합니다.",
      "date": "2024년 10월 12일 작성"
    }
  ]
}
```

프론트 연결 위치:

- 타입: `src/types/review.ts`
- 목데이터: `src/mocks/reviews.ts`
- 화면: `src/pages/ReviewPage.tsx`

---

## 홈 폰트 카드

### `GET /fonts/home`

```json
{
  "popularFonts": [
    {
      "id": "ubuntu-popular",
      "name": "Ubuntu",
      "source": "구글",
      "sample": "merry ch…",
      "fontFamily": "Ubuntu, sans-serif",
      "description": "둥근 인상과 단단한 획이 어울려 서비스 타이틀과 배너에 쓰기 좋은 산세리프입니다."
    }
  ],
  "recommendedFonts": []
}
```

프론트 연결 위치:

- 타입: `src/types/font.ts`
- 목데이터: `src/mocks/home.ts`
- 화면: `src/pages/HomePage.tsx`

---

## 영어 폰트 목록

### `GET /fonts/english`

```json
{
  "fonts": [
    {
      "id": "montserrat",
      "name": "Montserrat Bold",
      "creator": "Julieta Ulanovsky",
      "previewFamily": "Montserrat, Pretendard, sans-serif",
      "type": "Sans Serif",
      "preview": "Font Preview",
      "tags": ["동글동글", "문서"]
    }
  ],
  "filters": ["Serif", "Sans Serif", "Handwriting", "Display"],
  "keywords": ["동글동글", "사무적인", "보고서", "날려쓰는", "게임틱한", "문서"]
}
```

프론트 연결 위치:

- 타입: `src/types/font.ts`
- 목데이터: `src/mocks/englishFonts.ts`
- 화면: `src/pages/EnglishFontsPage.tsx`

---

## Top10

### `GET /fonts/top10`

```json
{
  "fonts": [
    {
      "id": "ubuntu-6",
      "rank": 1,
      "preview": "식넴",
      "previewBackground": "#1f1f1f",
      "title": "Ubuntu 6",
      "creator": "구글 (Google Fonts)",
      "tags": [
        { "label": "둥글둥글", "tone": "pink" }
      ],
      "likes": 1240,
      "downloaded": false
    }
  ]
}
```

프론트 연결 위치:

- 타입: `src/types/font.ts`
- 목데이터: `src/mocks/topFonts.ts`
- 화면: `src/pages/Top10Page.tsx`
