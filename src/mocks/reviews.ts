import type { FeaturedReview, PendingReviewFont, ReviewCard, ReviewImpact } from '../types/review';

export const mockPendingReviewFonts: PendingReviewFont[] = [
  {
    id: 'gwendolyn-signature',
    label: '최근 다운로드',
    name: 'Gwendolyn Signature',
    tone: 'primary',
    mark: 'quote',
  },
  {
    id: 'vogue-royale-serif',
    label: '프로젝트: 가을 컬렉션',
    name: 'Vogue Royale Serif',
    tone: 'soft',
    mark: 'lines',
  },
];

export const mockReviews: ReviewCard[] = [
  {
    id: 'modern-archive-mono',
    title: 'Modern Archive Mono',
    rating: 5,
    sample: 'ABCDEFGHIJKLMN\n0123456789',
    sampleClass: 'reviewSample--mono',
    body:
      '기술 문서에 완벽합니다. 작은 크기에서도 가독성이 타의 추종을 불허합니다. 개발자 포털 UI에 사용했는데 반응이 매우 좋았습니다.',
    date: '2024년 10월 12일 작성',
  },
  {
    id: 'whisper-script-pro-1',
    title: 'Whisper script Pro',
    rating: 4,
    sample: 'Ethereal Moments',
    sampleClass: 'reviewSample--script',
    body:
      '합자가 아름답지만 깔끔한 산세리프와 조합하기는 조금 까다로울 수 있습니다. 웨딩 초대장이나 럭셔리 브랜딩에 탁월합니다.',
    date: '2024년 9월 28일',
  },
  {
    id: 'whisper-script-pro-2',
    title: 'Whisper script Pro',
    rating: 4,
    sample: 'Ethereal Moments',
    sampleClass: 'reviewSample--script',
    body:
      '합자가 아름답지만 깔끔한 산세리프와 조합하기는 조금 까다로울 수 있습니다. 웨딩 초대장이나 럭셔리 브랜딩에 탁월합니다.',
    date: '2024년 9월 28일',
  },
];

export const mockReviewImpact: ReviewImpact = {
  reachedDesigners: 3422,
  avatarLabels: ['AA', 'BB', 'CC'],
  growthLabel: '+3.4k',
};

export const mockFeaturedReview: FeaturedReview = {
  fontName: 'Vogue Royale',
  label: 'EDITORIAL SAMPLE',
  title: '현대 에디토리얼 공간에서의 타이포그래피: Vogue Royale 리뷰.',
};
