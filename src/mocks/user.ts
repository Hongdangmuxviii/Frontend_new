import type { UserActivityStat, UserProfile } from '../types/user';
import type { UserOwnedFont } from '../types/font';

const statLikeIconSrc = '/images/my-page/activity-like-icon.svg';
const statReviewIconSrc = '/images/my-page/activity-review-icon.png';
const statOwnedIconSrc = '/images/my-page/activity-owned-font-icon.svg';

export const mockUserProfile: UserProfile = {
  name: '폰티파이님',
  joinedDaysLabel: 'Fontify와 함께한지 124일째',
  avatarSrc: '/images/my-page/profile-avatar.png',
};

export const mockUserActivityStats: UserActivityStat[] = [
  {
    id: 'likes',
    iconSrc: statLikeIconSrc,
    label: '좋아요',
    value: '14',
  },
  {
    id: 'reviews',
    iconSrc: statReviewIconSrc,
    label: '작성한 리뷰',
    value: '28',
    href: '#/reviews',
  },
  {
    id: 'working-fonts',
    iconSrc: statOwnedIconSrc,
    label: '작업중인 폰트',
    value: '1',
    iconVariant: 'darkOnWhite',
    href: '#/my-works',
  },
];

export const mockOwnedFonts: UserOwnedFont[] = [
  {
    id: 'bareun-gothic',
    title: 'Aa바른고딕',
    kind: '무료',
    company: '디자인스튜디오',
    sampleFontFamily: "'WenQuanYi Zen Hei', sans-serif",
  },
  {
    id: 'nanum-myeongjo',
    title: '나눔명조',
    kind: '무료',
    company: '네이버',
    sampleFontFamily: "'Nanum Myeongjo', serif",
  },
  {
    id: 'cafe24-ssurround',
    title: '카페24 써라운드',
    kind: '유료',
    company: '카페24',
    sampleFontFamily: "'Pretendard', sans-serif",
  },
  {
    id: 'lv1',
    title: 'Lv1',
    kind: '무료',
    company: 'NEXON',
    sampleFontFamily: "'Pretendard', sans-serif",
  },
];
