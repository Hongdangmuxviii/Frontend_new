# Fontify 디자인 시스템

## 기준 파일

- 전역 디자인 토큰의 기준 파일은 [src/styles/globals.css](../src/styles/globals.css) 입니다.
- 각 페이지 스타일은 `src/styles/globals.css`를 통해 전역 토큰을 공유합니다.
- 페이지별 CSS에서 별도의 `:root`를 다시 정의하는 방식은 지양합니다.

## 운영 원칙

- 배경, 텍스트, 보더, 기본 버튼처럼 반복되는 UI 색상은 전역 토큰을 우선 사용합니다.
- 기능 성격을 드러내는 강조색은 필요할 때 별도 토큰으로 분리합니다.
- 두 개 이상 페이지에서 반복되는 리터럴 색상은 가능한 한 전역 토큰으로 승격합니다.
- 일러스트, 히어로 그래픽, 목업용 그라디언트처럼 장식 목적이 강한 색상은 페이지 로컬 값으로 유지할 수 있습니다.

## 주요 토큰 분류

### 브랜드 / 기본 액션

- `--primary`: 기본 액션 블루
- `--primary-hover`: 호버 및 강조 상태 블루
- `--primary-strong`: 더 강한 포인트 블루
- `--primary-soft`: 연한 블루 배경
- `--primary-soft-alt`: 보조 블루 톤 배경
- `--primary-soft-border`: 연한 블루 보더

### 강조색

- `--accent-pink`, `--accent-pink-strong`
- `--accent-purple`, `--accent-purple-strong`
- `--accent-indigo`, `--accent-indigo-soft`
- `--accent-green`, `--accent-green-strong`
- `--accent-orange`
- `--accent-yellow-strong`
- `--accent-handwriting-pink`, `--accent-handwriting-purple`
- `--accent-google-red`

### 텍스트

- `--text`, `--text-strong`
- `--text-heading`
- `--text-body`, `--text-body-2`, `--text-body-strong`
- `--text-dim`, `--text-soft`
- `--text-warm`, `--text-plum`
- `--title`
- `--muted`, `--muted-2`, `--muted-3`, `--muted-4`
- `--ink`

### 배경 / 서피스

- `--bg`
- `--surface-base`
- `--surface-muted`
- `--surface-subtle`
- `--surface-soft`
- `--surface-tint`
- `--surface-hero`
- `--surface-blue-soft`
- `--surface-blue-soft-2`
- `--surface-blue-soft-3`
- `--surface-blue-soft-4`
- `--surface-blue-soft-5`
- `--surface-line`
- `--surface-line-2`
- `--bg-soft`
- `--bg-softer`
- `--pill-bg`

### 보더

- `--border`
- `--border-soft`
- `--border-subtle`
- `--border-strong`
- `--border-emphasis`
- `--border-2`
- `--border-faint`
- `--card-border`

### 상태 / 보조 토큰

- `--info-soft`, `--info-soft-2`, `--info-soft-3`
- `--danger`, `--danger-soft`
- `--warning`
- `--focus-ring-soft`
- `--texture-line`, `--texture-stripe`

### 태그 배경

- `--tag-blue-bg`
- `--tag-purple-bg`
- `--tag-green-bg`
- `--tag-orange-bg`
- `--tag-pink-bg`
- `--tag-indigo-bg`
- `--tag-yellow-bg`
- `--tag-gray-bg`

### 라운드 / 그림자 / 레이아웃

- Radius: `--r-6`, `--r-8`, `--r-12`, `--r-16`, `--r-20`, `--r-24`, `--r-28`, `--r-32`, `--r-full`
- Shadow: `--shadow-1`, `--shadow-2`, `--shadow-3`
- Layout: `--max`

## 현재 적용 상태

- `english-fonts`, `english-detail`, `image-font-search`, `my-page`, `my-works`, `profile-edit`, `review`, `selected`, `top10` 페이지는 공용 UI 색상을 전역 토큰으로 참조하도록 정리되었습니다.
- `home.css`는 전체적으로 토큰 기반이지만, 히어로 비주얼과 장식 그래픽 일부는 의도적으로 로컬 색상을 유지합니다.
- `index.css`에는 예전 토큰 세트가 남아 있지만, 현재 페이지 스타일의 기준 토큰 파일은 `globals.css`입니다.

## 새 UI 작업 시 규칙

1. 먼저 기존 텍스트, 배경, 보더, 기본 액션 토큰 안에서 해결합니다.
2. 새로운 강조색이 여러 곳에서 재사용될 가능성이 있으면 `globals.css`에 이름 있는 토큰으로 추가합니다.
3. 한 페이지에서만 쓰이는 일러스트/장식 색이면 해당 페이지 CSS에 로컬로 둡니다.
4. 버튼, 카드, 입력창, 태그, 상태 UI에 새 hex 값을 바로 넣기 전에 토큰화 여부를 먼저 검토합니다.
