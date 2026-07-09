import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type UIEvent as ReactUIEvent,
} from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { featuredFonts } from '../mocks/home';
import type { HomeFontCardData } from '../types/font';

const heroSlides = ['existing', 'figma', 'scan'] as const;
const heroSlideCount = heroSlides.length;
type HeroSlideKind = (typeof heroSlides)[number];
const COMMUNITY_BATCH_SIZE = 3;
const COMMUNITY_TILE_COUNT = 10;
const FEATURED_FONT_LIKES_STORAGE_KEY = 'fontify-featured-font-likes';

const bannerAvatar1 = '/images/my-page/activity-like-icon.svg';
const bannerAvatar2 = '/images/my-page/activity-owned-font-icon.svg';
const DEFAULT_FONT_PAGE_HASH = '#/english-fonts';

const heroPreviewCards = [
  {
    id: 'ubuntu',
    name: 'Ubuntu',
    sample: 'Sample text elementum',
    fontFamily: 'Ubuntu, sans-serif',
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    sample: 'Sample text ullamcorper',
    fontFamily: 'Merriweather, serif',
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    sample: 'Sample text condimentum',
    fontFamily: "'Playfair Display', serif",
  },
  {
    id: 'lato',
    name: 'Lato',
    sample: 'Sample text dignissim',
    fontFamily: 'Lato, sans-serif',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    sample: 'Sample text dolor sit amet',
    fontFamily: 'Montserrat, sans-serif',
  },
  {
    id: 'nanum-myeongjo',
    name: 'Nanum Myeongjo',
    sample: 'Sample text structure',
    fontFamily: '"Nanum Myeongjo", serif',
  },
  {
    id: 'nanum-pen-script',
    name: 'Nanum Pen Script',
    sample: 'Sample text handwriting',
    fontFamily: '"Nanum Pen Script", cursive',
  },
] as const;

const recommendationOffsets = [-2, -1, 0, 1, 2] as const;

const todaysFontRecommendations = [
  {
    id: 'rec-pretendard',
    eyebrow: 'TODAY PICK',
    title: 'Pretendard Bold',
    subtitle: 'NEW ARRIVAL',
    sample: '정돈된 구조 위에 힘 있게 올라가는 헤드라인',
    description: '인터페이스와 배너 타이틀에 모두 잘 맞는 균형형 산세리프.',
    fontFamily: '"Pretendard", sans-serif',
    cover: 'P',
    coverLabel: 'SANS',
  },
  {
    id: 'rec-myeongjo',
    eyebrow: 'EDITORIAL',
    title: 'Nanum Myeongjo',
    subtitle: 'SERIF MOOD',
    sample: '긴 문장에서도 분위기를 유지하는 안정적인 명조',
    description: '브랜드 스토리, 에디토리얼 카드, 감성형 상세 페이지에 적합.',
    fontFamily: '"Nanum Myeongjo", serif',
    cover: '문',
    coverLabel: 'SERIF',
  },
  {
    id: 'rec-blackhan',
    eyebrow: 'DISPLAY TYPE',
    title: 'Black Han Sans',
    subtitle: 'CENTER FOCUS',
    sample: '강한 첫인상이 필요한 순간을 위한 선명한 존재감',
    description: '프로모션, 이벤트, 썸네일처럼 임팩트가 필요한 영역에 어울림.',
    fontFamily: '"Black Han Sans", sans-serif',
    cover: 'B',
    coverLabel: 'DISPLAY',
  },
  {
    id: 'rec-pen',
    eyebrow: 'HANDWRITING',
    title: 'Nanum Pen Script',
    subtitle: 'PERSONAL NOTE',
    sample: '친근하고 가볍게 읽히는 손글씨 톤의 포인트 폰트',
    description: '메모, 후기, 큐레이션 카드처럼 감정을 실어 보여줄 때 적합.',
    fontFamily: '"Nanum Pen Script", cursive',
    cover: '손',
    coverLabel: 'SCRIPT',
  },
  {
    id: 'rec-playfair',
    eyebrow: 'LUXE SERIF',
    title: 'Playfair Display',
    subtitle: 'PRESTIGE',
    sample: '대비감 있는 획으로 완성하는 세련된 브랜드 무드',
    description: '패션, 뷰티, 프리미엄 큐레이션 영역에서 존재감이 강한 타입.',
    fontFamily: '"Playfair Display", serif',
    cover: 'P',
    coverLabel: 'LUXE',
  },
] as const;

type LikedFeaturedFont = Pick<
  HomeFontCardData,
  'id' | 'name' | 'source' | 'sample' | 'fontFamily' | 'description' | 'attribution'
>;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readLikedFeaturedFonts(): LikedFeaturedFont[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(FEATURED_FONT_LIKES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LikedFeaturedFont[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLikedFeaturedFonts(fonts: LikedFeaturedFont[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(FEATURED_FONT_LIKES_STORAGE_KEY, JSON.stringify(fonts));
}

function HomeFontCard({
  font,
  liked,
  onToggleLike,
}: {
  font: HomeFontCardData;
  liked: boolean;
  onToggleLike: (font: HomeFontCardData) => void;
}) {
  return (
    <article className="featureFontCard">
      <button
        className={liked ? 'featureFontCard__favorite is-active' : 'featureFontCard__favorite'}
        type="button"
        aria-label={liked ? `${font.name} 좋아요 취소` : `${font.name} 좋아요`}
        aria-pressed={liked}
        onClick={() => onToggleLike(font)}
      >
        <svg
          className="featureFontCard__favoriteIcon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M12 21s-6.716-4.31-9.193-8.145C1.094 10.21 1.5 6.72 4.433 5.14A5.35 5.35 0 0 1 12 7.186 5.35 5.35 0 0 1 19.567 5.14c2.933 1.58 3.34 5.07 1.626 7.715C18.716 16.69 12 21 12 21Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        className={`featureFontCard__preview ${
          font.description.includes('\n') ? 'featureFontCard__preview--multiline' : ''
        }`}
      >
        <div className="featureFontCard__previewInner">
          <div
            className={`featureFontCard__glyph ${
              font.previewDisplay ? 'featureFontCard__glyph--wordmark' : ''
            }`}
            style={{ fontFamily: font.fontFamily }}
          >
            {font.previewDisplay ? (
              <span>{font.previewDisplay}</span>
            ) : (
              <>
                <span>{font.previewGlyph ?? '?'}</span>
                <span>{font.previewGlyphSecondary ?? '?'}</span>
              </>
            )}
          </div>
          <p
            className={`featureFontCard__headline ${
              font.sampleScale === 'large' ? 'featureFontCard__headline--large' : ''
            }`}
            style={{ fontFamily: font.fontFamily }}
          >
            {font.sample}
          </p>
          <p className="featureFontCard__copy" style={{ fontFamily: font.fontFamily }}>
            {font.description}
          </p>
        </div>
      </div>

      <div className="featureFontCard__body">
        <div className="featureFontCard__meta">
          <div>
            <strong>{font.name}</strong>
            <p>{font.attribution ?? 'Fontify Mock'}</p>
          </div>
          <span>{font.source}</span>
        </div>

        <div className="featureFontCard__actions">
          <a
            className="featureFontCard__download featureFontCard__download--icon"
            href={`#/english-detail?fontName=${encodeURIComponent(font.name)}`}
            aria-label={`${font.name} 상세 보기`}
          >
            <svg
              className="featureFontCard__downloadIcon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M12 4v10m0 0 4-4m-4 4-4-4M5 18h14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}

function StepIcon({ type }: { type: 'select' | 'convert' | 'download' }) {
  if (type === 'select') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="4" y="5" width="16" height="14" rx="3" />
        <path d="M8 10h8" />
        <path d="M8 14h5" />
      </svg>
    );
  }

  if (type === 'convert') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7 7h7a3 3 0 0 1 3 3v.5" />
        <path d="M17 7l2 2-2 2" />
        <path d="M17 17h-7a3 3 0 0 1-3-3v-.5" />
        <path d="M7 17l-2-2 2-2" />
        <path d="M10 11h4" />
        <path d="M12 9v4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 4v10" />
      <path d="M8.5 10.5 12 14l3.5-3.5" />
      <rect x="5" y="17" width="14" height="3" rx="1.5" />
    </svg>
  );
}

export default function HomePage() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [slidePhase, setSlidePhase] = useState<'idle' | 'enter'>('idle');
  const [previousSlideIndex, setPreviousSlideIndex] = useState<number | null>(null);
  const [recommendationIndex, setRecommendationIndex] = useState(0);
  const [recommendationPreviousIndex, setRecommendationPreviousIndex] = useState(0);
  const [recommendationDirection, setRecommendationDirection] = useState<'next' | 'prev'>('next');
  const [featuredPage, setFeaturedPage] = useState(0);
  const [featuredDirection, setFeaturedDirection] = useState<'next' | 'prev'>('next');
  const [visibleCommunityCount, setVisibleCommunityCount] = useState(0);
  const [likedFeaturedFontIds, setLikedFeaturedFontIds] = useState<string[]>(
    () => readLikedFeaturedFonts().map((font) => font.id),
  );
  const communityRef = useRef<HTMLElement | null>(null);
  const heroSlideEnterTimerRef = useRef<number | null>(null);
  const heroPreviewScrollerRef = useRef<HTMLDivElement | null>(null);
  const heroPreviewScrollRafRef = useRef<number | null>(null);
  const heroPreviewInitialScrollRef = useRef(false);
  const [heroPreviewScrollProgress, setHeroPreviewScrollProgress] = useState(0);
  const featuredPageSize = 3;
  const HERO_SLIDE_ENTER_MS = 1080;
  const featuredPages = Array.from(
    { length: Math.ceil(featuredFonts.length / featuredPageSize) },
    (_, pageIndex) =>
      featuredFonts.slice(pageIndex * featuredPageSize, pageIndex * featuredPageSize + featuredPageSize),
  );

  const clearHeroSlideTimers = () => {
    if (heroSlideEnterTimerRef.current !== null) {
      window.clearTimeout(heroSlideEnterTimerRef.current);
      heroSlideEnterTimerRef.current = null;
    }
  };

  const startHeroSlideEnter = (nextIndex: number, direction: 'next' | 'prev') => {
    if (nextIndex === slideIndex && slidePhase === 'idle') return;

    clearHeroSlideTimers();
    setSlideDirection(direction);
    setPreviousSlideIndex(slideIndex);
    setSlideIndex(nextIndex);
    setSlidePhase('enter');

    heroSlideEnterTimerRef.current = window.setTimeout(() => {
      setSlidePhase('idle');
      setPreviousSlideIndex(null);
      heroSlideEnterTimerRef.current = null;
    }, HERO_SLIDE_ENTER_MS);
  };

  const goToPrevSlide = () => {
    startHeroSlideEnter((slideIndex - 1 + heroSlideCount) % heroSlideCount, 'prev');
  };

  const goToNextSlide = () => {
    startHeroSlideEnter((slideIndex + 1) % heroSlideCount, 'next');
  };

  const goToImageFontSearch = () => {
    window.location.hash = '#/image-font-search';
  };

  const goToPrevRecommendation = () => {
    setRecommendationDirection('prev');
    setRecommendationPreviousIndex(recommendationIndex);
    setRecommendationIndex((prev) => (prev - 1 + todaysFontRecommendations.length) % todaysFontRecommendations.length);
  };

  const goToNextRecommendation = () => {
    setRecommendationDirection('next');
    setRecommendationPreviousIndex(recommendationIndex);
    setRecommendationIndex((prev) => (prev + 1) % todaysFontRecommendations.length);
  };

  const rerollRecommendation = () => {
    const availableIndexes = todaysFontRecommendations
      .map((_, idx) => idx)
      .filter((idx) => idx !== recommendationIndex);
    const nextIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)] ?? recommendationIndex;

    setRecommendationDirection(nextIndex > recommendationIndex ? 'next' : 'prev');
    setRecommendationPreviousIndex(recommendationIndex);
    setRecommendationIndex(nextIndex);
  };

  const goToPrevFeaturedPage = () => {
    setFeaturedDirection('prev');
    setFeaturedPage((prev) => (prev - 1 + featuredPages.length) % featuredPages.length);
  };

  const goToNextFeaturedPage = () => {
    setFeaturedDirection('next');
    setFeaturedPage((prev) => (prev + 1) % featuredPages.length);
  };

  const toggleFeaturedFontLike = (font: HomeFontCardData) => {
    setLikedFeaturedFontIds((current) => {
      const isLiked = current.includes(font.id);
      const nextIds = isLiked
        ? current.filter((id) => id !== font.id)
        : [...current, font.id];

      const currentSaved = readLikedFeaturedFonts();
      const nextSaved = isLiked
        ? currentSaved.filter((item) => item.id !== font.id)
        : [
            {
              id: font.id,
              name: font.name,
              source: font.source,
              sample: font.sample,
              fontFamily: font.fontFamily,
              description: font.description,
              attribution: font.attribution,
            },
            ...currentSaved.filter((item) => item.id !== font.id),
          ];

      writeLikedFeaturedFonts(nextSaved);
      return nextIds;
    });
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      startHeroSlideEnter((slideIndex + 1) % heroSlideCount, 'next');
    }, 8000);
    return () => window.clearInterval(timer);
  }, [slideIndex, slidePhase]);

  const visibleRecommendations = todaysFontRecommendations.map((data, itemIndex) => {
    const rawOffset =
      (itemIndex - recommendationIndex + todaysFontRecommendations.length) % todaysFontRecommendations.length;
    const normalizedOffset =
      rawOffset > Math.floor(todaysFontRecommendations.length / 2)
        ? rawOffset - todaysFontRecommendations.length
        : rawOffset;
    const previousRawOffset =
      (itemIndex - recommendationPreviousIndex + todaysFontRecommendations.length) % todaysFontRecommendations.length;
    const previousNormalizedOffset =
      previousRawOffset > Math.floor(todaysFontRecommendations.length / 2)
        ? previousRawOffset - todaysFontRecommendations.length
        : previousRawOffset;
    const offset = normalizedOffset as (typeof recommendationOffsets)[number];

    return {
      offset,
      data,
      isActive: offset === 0,
      isJumpReset: Math.abs(previousNormalizedOffset - normalizedOffset) > 2,
    };
  });

  const getHeroDotDirection = (targetIndex: number): 'next' | 'prev' => {
    const forwardDistance = (targetIndex - slideIndex + heroSlideCount) % heroSlideCount;
    const backwardDistance = (slideIndex - targetIndex + heroSlideCount) % heroSlideCount;
    return forwardDistance <= backwardDistance ? 'next' : 'prev';
  };

  const updateHeroPreviewScrollProgress = (scroller: HTMLDivElement) => {
    const firstCard = scroller.querySelector<HTMLElement>('.pv--glass');
    const secondCard = firstCard?.nextElementSibling as HTMLElement | null;
    const itemStep = firstCard && secondCard
      ? Math.max(1, secondCard.offsetTop - firstCard.offsetTop)
      : 122;

    if (!firstCard) return;

    const scrollerCenter = scroller.scrollTop + scroller.clientHeight / 2;
    const firstCardCenter = firstCard.offsetTop + firstCard.offsetHeight / 2;
    setHeroPreviewScrollProgress((scrollerCenter - firstCardCenter) / itemStep);
  };

  const handleHeroPreviewScroll = (event: ReactUIEvent<HTMLDivElement>) => {
    const scroller = event.currentTarget;
    if (heroPreviewScrollRafRef.current !== null) {
      window.cancelAnimationFrame(heroPreviewScrollRafRef.current);
    }

    heroPreviewScrollRafRef.current = window.requestAnimationFrame(() => {
      updateHeroPreviewScrollProgress(scroller);
      heroPreviewScrollRafRef.current = null;
    });
  };

  useEffect(() => {
    const scroller = heroPreviewScrollerRef.current;
    if (!scroller || heroPreviewInitialScrollRef.current) return;

    const frame = window.requestAnimationFrame(() => {
      const firstCard = scroller.querySelector<HTMLElement>('.pv--glass');
      const secondCard = firstCard?.nextElementSibling as HTMLElement | null;
      const itemStep = firstCard && secondCard
        ? Math.max(1, secondCard.offsetTop - firstCard.offsetTop)
        : 130;

      const firstCardCenter = firstCard
        ? firstCard.offsetTop + firstCard.offsetHeight / 2
        : 0;
      scroller.scrollTop = Math.max(0, firstCardCenter + itemStep - scroller.clientHeight / 2);
      setHeroPreviewScrollProgress(1);
      heroPreviewInitialScrollRef.current = true;
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    return () => {
      clearHeroSlideTimers();
      if (heroPreviewScrollRafRef.current !== null) {
        window.cancelAnimationFrame(heroPreviewScrollRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateCommunityReveal = () => {
      const sectionEl = communityRef.current;
      if (!sectionEl) return;

      const rect = sectionEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const triggerLine = viewportHeight * 0.85;

      if (rect.top > triggerLine) {
        setVisibleCommunityCount(0);
        return;
      }

      const progress = Math.max(0, triggerLine - rect.top);
      const stepSize = Math.max(320, viewportHeight * 0.6);
      const totalBatches = Math.ceil(COMMUNITY_TILE_COUNT / COMMUNITY_BATCH_SIZE);
      const revealedBatches = Math.min(totalBatches, 1 + Math.floor(progress / stepSize));
      setVisibleCommunityCount(revealedBatches * COMMUNITY_BATCH_SIZE);
    };

    updateCommunityReveal();
    window.addEventListener('scroll', updateCommunityReveal, { passive: true });
    window.addEventListener('resize', updateCommunityReveal);

    return () => {
      window.removeEventListener('scroll', updateCommunityReveal);
      window.removeEventListener('resize', updateCommunityReveal);
    };
  }, []);

  const currentSlide = heroSlides[slideIndex];
  const previousSlide = previousSlideIndex !== null ? heroSlides[previousSlideIndex] : null;
  const themeSlide = currentSlide;

  const renderHeroSlideContent = (slide: HeroSlideKind) => {
    if (slide === 'existing') {
      return (
        <div className="hero__grid hero__grid--existing">
          <div className="hero__copy">
            <span className="hero__tag">GOOGLE FONTS CONVERT</span>
            <h1 className="hero__titleTwoLine">
              <span>A에서 ㅎ까지,</span>
              <span className="hero__accentLine">디자인은 끊기지 않아야 하니까.</span>
            </h1>

            <p className="hero__desc">
              한글 생성 가능한 영어 폰트를 탐색하고,
              <br />
              <span className="nowrap">당신의 프로젝트에 딱 맞는 스타일을 찾아보세요.</span>
              <br />
            </p>

            <div className="hero__actions">
              <button
                className="heroPromo__btn heroPromo__btn--primary heroPromo__btn--primaryBlue"
                type="button"
              >
                구글 폰트에서 시작하기
              </button>
            </div>

            <div className="heroPromo__social">
              <div className="heroPromo__avatars">
                <img src={bannerAvatar1} alt="" />
                <img src={bannerAvatar2} alt="" />
                <div className="heroPromo__avatarsMore">+2k</div>
              </div>
              <p>12,400+ 명의 작가가 이미 폰트를 만들었습니다.</p>
            </div>
          </div>

          <div className="hero__cards" aria-label="스크롤 가능한 폰트 미리보기">
            <div
              ref={heroPreviewScrollerRef}
              className="heroPreviewScroller"
              tabIndex={0}
              onScroll={handleHeroPreviewScroll}
            >
              {heroPreviewCards.map((card, index) => {
                const distance = index - heroPreviewScrollProgress;
                const depth = Math.min(3, Math.abs(distance));
                const scale = 1.14 - depth * 0.14;
                const x = -depth * 46;
                const y = distance * -8;
                const rotate = Math.max(-7, Math.min(7, distance * -3.2));
                const opacity = 1 - Math.min(0.42, depth * 0.15);

                return (
                  <a
                    key={card.id}
                    className={`pv pv--glass ${depth < 0.48 ? 'pv--focus' : ''}`}
                    href={DEFAULT_FONT_PAGE_HASH}
                    style={
                      {
                        opacity,
                        transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`,
                        zIndex: 20 - Math.round(depth * 4),
                      } as CSSProperties
                    }
                  >
                    <header className="pv__top">
                      <span className="pv__name">{card.name}</span>
                    </header>
                    <div className="pv__sample" style={{ fontFamily: card.fontFamily }}>
                      {card.sample}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (slide === 'figma') {
      return (
        <div className="heroPromo">
          <div className="heroPromo__left">
            <span className="heroPromo__tag">INK &amp; PIXEL EDITORIAL</span>

            <h1 className="heroPromo__title">
              당신의 손글씨가
              <br />
              <span className="heroPromo__line">
                <span className="heroPromo__accent">영원한 폰트</span>가 되는 순간
              </span>
            </h1>

            <p className="heroPromo__desc">
              세상에 단 하나뿐인 당신의 기록을 디지털로 숨 쉬게 하세요.
              <br />
              가장 따뜻한 기술로 완성하는 나만의 서체 라이브러리.
            </p>

            <div className="heroPromo__actions">
              <button
                className="heroPromo__btn heroPromo__btn--primary"
                type="button"
                onClick={() => {
                  window.location.hash = '#/handwriting';
                }}
              >
                나만의 폰트 만들기
              </button>
              <button className="heroPromo__btn heroPromo__btn--ghost" type="button">
                샘플 둘러보기
              </button>
            </div>

            <div className="heroPromo__social">
              <div className="heroPromo__avatars">
                <img src={bannerAvatar1} alt="" />
                <img src={bannerAvatar2} alt="" />
                <div className="heroPromo__avatarsMore">+2k</div>
              </div>
              <p>12,400+ 명의 작가가 이미 폰트를 만들었습니다.</p>
            </div>
          </div>

          <div className="heroPromo__right">
            <div className="heroPromo__card">
              <p className="heroPromo__cardEyebrow">PREVIEW MODE</p>
              <h3 className="heroPromo__cardTitle">Digital Ink Engine</h3>
              <div className="heroPromo__handword">사랑</div>
              <div className="heroPromo__cardFooter">
                <span className="heroPromo__cardDot" />
                <span>Editorial Choice</span>
                <span className="heroPromo__version">VER. 2.0</span>
              </div>
            </div>

            <div className="heroPromo__floating heroPromo__floating--badge">AI ACCURACY 99.8%</div>
            <div className="heroPromo__floating heroPromo__floating--chip">Real-time Rendering</div>
          </div>
        </div>
      );
    }

    return (
      <div className="heroPromo heroPromo--scan">
        <div className="heroPromo__left heroPromo__left--scan">
          <span className="heroPromo__tag heroPromo__tag--scan">FONT SEARCH EDITORIAL</span>

          <h1 className="heroPromo__title heroPromo__title--scan">
            당신이 마주친
            <br />
            <span className="heroPromo__accent heroPromo__accent--blue">모든 폰트</span>
          </h1>

          <p className="heroPromo__desc heroPromo__desc--scan">
            마음에 들던 그 폰트, 캡처한 이미지 한장으로
            <br />
            비슷한 폰트나 해당 폰트를 찾아드려요.
          </p>

          <div className="heroPromo__actions heroPromo__actions--scan">
            <button
              className="heroPromo__btn heroPromo__btn--primary heroPromo__btn--primaryBlue"
              type="button"
              onClick={goToImageFontSearch}
            >
              이미지 업로드하기
            </button>
            <button className="heroPromo__btn heroPromo__btn--ghost" type="button" onClick={goToImageFontSearch}>
              사용 방법 보기
            </button>
          </div>

          <div className="heroPromo__social heroPromo__social--scan">
            <div className="heroPromo__avatars">
              <img src={bannerAvatar1} alt="" />
              <img src={bannerAvatar2} alt="" />
              <div className="heroPromo__avatarsMore">+12k</div>
            </div>
            <p>12,400+ 명의 사용자가 이미 폰트를 찾았습니다.</p>
          </div>
        </div>

        <div className="heroPromo__right heroPromo__right--scan">
          <div className="scanScene" aria-hidden="true">
            <div className="scanScene__card scanScene__card--engine">
              <span>ANALYSIS ENGINE</span>
              <strong>OCR_SCAN_085</strong>
            </div>

            <div className="scanScene__card scanScene__card--processing">
              <span>• PROCESSING</span>
              <strong>Vectorizing glyphs...</strong>
            </div>

            <div className="scanScene__glyphWrap">
              <div className="scanScene__gridLine scanScene__gridLine--verticalLeft" />
              <div className="scanScene__gridLine scanScene__gridLine--verticalRight" />
              <div className="scanScene__gridLine scanScene__gridLine--mid" />
              <div className="scanScene__glyph">가</div>
              <div className="scanScene__laser" />
            </div>

            <div className="scanScene__card scanScene__card--match">
              <span>MATCH FOUND</span>
              <strong>High Confidence</strong>
            </div>

            <div className="scanScene__card scanScene__card--probability">
              <div className="scanScene__metricRow">
                <span>PROBABILITY</span>
                <strong>99.82%</strong>
              </div>
              <div className="scanScene__metricRow scanScene__metricRow--family">
                <span>FONT FAMILY</span>
                <strong>Pretendard Bold</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header variant="home" />

      <main className="main">
        <section
          className={`hero hero--banner container ${
            themeSlide === 'figma'
              ? 'hero--bannerAlt'
              : themeSlide === 'scan'
                ? 'hero--bannerScan'
                : ''
          }`}
        >
          <div className="hero__bg" aria-hidden="true">
            <span className="hero__blob hero__blob--a" />
            <span className="hero__blob hero__blob--b" />
            <span className="hero__blob hero__blob--c" />
          </div>

          <div className="heroSlideFrame">
            <div className="heroSlideStack">
            {previousSlide !== null ? (
              <>
                <div className={`heroSlideMotion heroSlideMotion--layer heroSlideMotion--out heroSlideMotion--${slideDirection}`}>
                  {renderHeroSlideContent(previousSlide)}
                </div>
                <div className={`heroSlideMotion heroSlideMotion--layer heroSlideMotion--in heroSlideMotion--${slideDirection}`}>
                  {renderHeroSlideContent(currentSlide)}
                </div>
              </>
            ) : (
              <div className="heroSlideMotion heroSlideMotion--layer heroSlideMotion--current">
                {renderHeroSlideContent(currentSlide)}
              </div>
            )}
            {false && (
            currentSlide === 'existing' ? (
              <div className="hero__grid hero__grid--existing">
                <div className="hero__copy">
                  <span className="hero__tag">GOOGLE FONTS CONVERT</span>
                  <h1 className="hero__titleTwoLine">
                    <span>A에서 ㅎ까지,</span>
                    <span className="hero__accentLine">디자인은 끊기지 않아야 하니까.</span>
                  </h1>

                  <p className="hero__desc">
                    한글 생성 가능한 영어 폰트를 탐색하고,
                    <br />
                    <span className="nowrap">당신의 프로젝트에 딱 맞는 스타일을 찾아보세요.</span>
                    <br />
                  </p>

                  <div className="hero__actions">
                    <button
                      className="heroPromo__btn heroPromo__btn--primary heroPromo__btn--primaryBlue"
                      type="button"
                    >
                      구글 폰트에서 시작하기
                    </button>
                  </div>

                  <div className="heroPromo__social">
                    <div className="heroPromo__avatars">
                      <img src={bannerAvatar1} alt="" />
                      <img src={bannerAvatar2} alt="" />
                      <div className="heroPromo__avatarsMore">+2k</div>
                    </div>
                    <p>12,400+ 명의 작가가 이미 폰트를 만들었습니다.</p>
                  </div>
                </div>

                <div className="hero__cards" aria-label="미리보기">
                  <a className="pv" href="#/english-detail?fontName=Ubuntu">
                    <header className="pv__top">
                      <span className="pv__name">Ubuntu</span>
                      <span className="pv__tag">구글</span>
                    </header>
                    <div className="pv__sample" style={{ fontFamily: 'Ubuntu, sans-serif' }}>
                      Hello, World!
                    </div>
                  </a>

                  <a className="pv" href="#/english-detail?fontName=Merriweather">
                    <header className="pv__top">
                      <span className="pv__name">Merriweather</span>
                      <span className="pv__tag">구글</span>
                    </header>
                    <div className="pv__sample" style={{ fontFamily: 'Merriweather, serif' }}>
                      merry christmas
                    </div>
                  </a>

                  <a className="pv" href="#/english-detail?fontName=Playfair">
                    <header className="pv__top">
                      <span className="pv__name">Playfair</span>
                      <span className="pv__tag">구글</span>
                    </header>
                    <div className="pv__sample" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Hello, World!
                    </div>
                  </a>

                  <a className="pv" href="#/english-detail?fontName=Lato">
                    <header className="pv__top">
                      <span className="pv__name">Lato</span>
                      <span className="pv__tag">구글</span>
                    </header>
                    <div className="pv__sample" style={{ fontFamily: 'Lato, sans-serif' }}>
                      Hello, World!
                    </div>
                  </a>

                  <article className="pv pv--dim" aria-hidden="true">
                    <header className="pv__top">
                      <span className="pv__name">Ubuntu</span>
                      <span className="pv__tag">구글</span>
                    </header>
                    <div className="pv__skeleton" />
                  </article>

                  <article className="pv pv--dim" aria-hidden="true">
                    <header className="pv__top">
                      <span className="pv__name">Ubuntu</span>
                      <span className="pv__tag">구글</span>
                    </header>
                    <div className="pv__skeleton" />
                  </article>
                </div>
              </div>
            ) : currentSlide === 'figma' ? (
              <div className="heroPromo">
                <div className="heroPromo__left">
                  <span className="heroPromo__tag">INK &amp; PIXEL EDITORIAL</span>

                  <h1 className="heroPromo__title">
                    당신의 손글씨가
                    <br />
                    <span className="heroPromo__line">
                      <span className="heroPromo__accent">영원한 폰트</span>가 되는 순간
                    </span>
                  </h1>

                  <p className="heroPromo__desc">
                    세상에 단 하나뿐인 당신의 기록을 디지털로 숨 쉬게 하세요.
                    <br />
                    가장 따뜻한 기술로 완성하는 나만의 서체 라이브러리.
                  </p>

                  <div className="heroPromo__actions">
                    <button
                      className="heroPromo__btn heroPromo__btn--primary"
                      type="button"
                      onClick={() => {
                        window.location.hash = '#/handwriting';
                      }}
                    >
                      나만의 폰트 만들기
                    </button>
                    <button className="heroPromo__btn heroPromo__btn--ghost" type="button">
                      샘플 둘러보기
                    </button>
                  </div>

                  <div className="heroPromo__social">
                    <div className="heroPromo__avatars">
                      <img src={bannerAvatar1} alt="" />
                      <img src={bannerAvatar2} alt="" />
                      <div className="heroPromo__avatarsMore">+2k</div>
                    </div>
                    <p>12,400+ 명의 작가가 이미 폰트를 만들었습니다.</p>
                  </div>
                </div>

                <div className="heroPromo__right">
                  <div className="heroPromo__card">
                    <p className="heroPromo__cardEyebrow">PREVIEW MODE</p>
                    <h3 className="heroPromo__cardTitle">Digital Ink Engine</h3>
                    <div className="heroPromo__handword">사랑</div>
                    <div className="heroPromo__cardFooter">
                      <span className="heroPromo__cardDot" />
                      <span>Editorial Choice</span>
                      <span className="heroPromo__version">VER. 2.0</span>
                    </div>
                  </div>

                  <div className="heroPromo__floating heroPromo__floating--badge">AI ACCURACY 99.8%</div>
                  <div className="heroPromo__floating heroPromo__floating--chip">Real-time Rendering</div>
                </div>
              </div>
            ) : (
              <div className="heroPromo heroPromo--scan">
                <div className="heroPromo__left heroPromo__left--scan">
                  <span className="heroPromo__tag heroPromo__tag--scan">FONT SEARCH EDITORIAL</span>

                  <h1 className="heroPromo__title heroPromo__title--scan">
                    당신이 마주친
                    <br />
                    <span className="heroPromo__accent heroPromo__accent--blue">모든 폰트</span>
                  </h1>

                  <p className="heroPromo__desc heroPromo__desc--scan">
                    마음에 들던 그 폰트, 캡처한 이미지 한장으로
                    <br />
                    비슷한 폰트나 해당 폰트를 찾아드려요.
                  </p>

                  <div className="heroPromo__actions heroPromo__actions--scan">
                    <button
                      className="heroPromo__btn heroPromo__btn--primary heroPromo__btn--primaryBlue"
                      type="button"
                      onClick={goToImageFontSearch}
                    >
                      이미지 업로드하기
                    </button>
                    <button
                      className="heroPromo__btn heroPromo__btn--ghost"
                      type="button"
                      onClick={goToImageFontSearch}
                    >
                      사용 방법 보기
                    </button>
                  </div>

                  <div className="heroPromo__social heroPromo__social--scan">
                    <div className="heroPromo__avatars">
                      <img src={bannerAvatar1} alt="" />
                      <img src={bannerAvatar2} alt="" />
                      <div className="heroPromo__avatarsMore">+12k</div>
                    </div>
                    <p>12,400+ 명의 사용자가 이미 폰트를 찾았습니다.</p>
                  </div>
                </div>

                <div className="heroPromo__right heroPromo__right--scan">
                  <div className="scanScene" aria-hidden="true">
                    <div className="scanScene__card scanScene__card--engine">
                      <span>ANALYSIS ENGINE</span>
                      <strong>OCR_SCAN_085</strong>
                    </div>

                    <div className="scanScene__card scanScene__card--processing">
                      <span>• PROCESSING</span>
                      <strong>Vectorizing glyphs...</strong>
                    </div>

                    <div className="scanScene__glyphWrap">
                      <div className="scanScene__gridLine scanScene__gridLine--verticalLeft" />
                      <div className="scanScene__gridLine scanScene__gridLine--verticalRight" />
                      <div className="scanScene__gridLine scanScene__gridLine--mid" />
                      <div className="scanScene__glyph">가</div>
                      <div className="scanScene__laser" />
                    </div>

                    <div className="scanScene__card scanScene__card--match">
                      <span>MATCH FOUND</span>
                      <strong>High Confidence</strong>
                    </div>

                    <div className="scanScene__card scanScene__card--probability">
                      <div className="scanScene__metricRow">
                        <span>PROBABILITY</span>
                        <strong>99.82%</strong>
                      </div>
                      <div className="scanScene__metricRow scanScene__metricRow--family">
                        <span>FONT FAMILY</span>
                        <strong>Pretendard Bold</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
            )}
            </div>
          </div>

          <div className="heroBanner__dots" aria-label="메인 광고 슬라이드 인디케이터">
            <button
              type="button"
              className="heroBanner__arrow heroBanner__arrow--left"
              onClick={goToPrevSlide}
              aria-label="이전 배너"
            >
              ‹
            </button>
            {heroSlides.map((slide, idx) => (
              <button
                key={slide}
                type="button"
                className={`heroBanner__dot ${idx === slideIndex ? 'heroBanner__dot--active' : ''}`}
                onClick={() => {
                  if (idx === slideIndex) return;
                  startHeroSlideEnter(idx, getHeroDotDirection(idx));
                }}
                aria-label={`${idx + 1}번 슬라이드`}
              />
            ))}
            <button
              type="button"
              className="heroBanner__arrow heroBanner__arrow--right"
              onClick={goToNextSlide}
              aria-label="다음 배너"
            >
              ›
            </button>
          </div>
        </section>

        <section id="popular" className="container section section--popularFonts">
          <div className="section__head">
            <div className="section__title">
              <h2>인기 폰트</h2>
              <span>(다운로드 순)</span>
            </div>
            <div className="featureFontsToolbar">
              <div className="featureFontsPager" aria-label="인기 폰트 넘기기">
                <button
                  type="button"
                  className="featureFontsPager__button"
                  onClick={goToPrevFeaturedPage}
                  aria-label="이전 인기 폰트"
                >
                  ‹
                </button>
                <span className="featureFontsPager__status">
                  {featuredPage + 1} / {featuredPages.length}
                </span>
                <button
                  type="button"
                  className="featureFontsPager__button"
                  onClick={goToNextFeaturedPage}
                  aria-label="다음 인기 폰트"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          <div
            key={`${featuredPage}-${featuredDirection}`}
            className={`featureFontsGrid featureFontsGrid--threeUp featureFontsGrid--animated featureFontsGrid--${featuredDirection}`}
          >
            {featuredPages[featuredPage].map((font) => (
              <HomeFontCard
                key={font.id}
                font={font}
                liked={likedFeaturedFontIds.includes(font.id)}
                onToggleLike={toggleFeaturedFontLike}
              />
            ))}
          </div>
        </section>

        <section className="container section recommendationShowcase">
          <div className="recommendationShowcase__head">
            <div>
              <p className="recommendationShowcase__eyebrow">TODAY&apos;S PICK</p>
              <h2 className="recommendationShowcase__title">오늘의 추천 폰트</h2>
              <p className="recommendationShowcase__desc">당신의 디자인을 더욱 돋보이게 할 특별한 큐레이션</p>
            </div>

            <div className="recommendationShowcase__actions">
              <button
                type="button"
                className="recommendationShowcase__actionButton"
                onClick={rerollRecommendation}
                aria-label="새 추천 폰트 뽑기"
              >
                새로 뽑기
              </button>
            </div>
          </div>

          <div className={`recommendationDeck recommendationDeck--${recommendationDirection}`}>
            <div className="recommendationDeck__stage">
              {visibleRecommendations.map(({ offset, data, isActive, isJumpReset }) => (
                <article
                  key={data.id}
                  className={[
                    'recommendationCard',
                    `recommendationCard--offset-${offset}`,
                    isActive ? 'is-active' : '',
                    isJumpReset ? 'is-jump-reset' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="recommendationCard__inner">
                    <div className="recommendationCard__face recommendationCard__face--front">
                      <div className="recommendationCard__media" aria-hidden="true" />
                      <div className="recommendationCard__content">
                        <span className="recommendationCard__eyebrow">{data.eyebrow}</span>
                        <h3 className="recommendationCard__name">{data.title}</h3>
                        <p className="recommendationCard__sample" style={{ fontFamily: data.fontFamily }}>
                          {data.sample}
                        </p>
                        <p className="recommendationCard__description">{data.description}</p>
                      </div>
                      <div className="recommendationCard__footer">
                        <span>{data.subtitle}</span>
                        <span>★ ★ ★</span>
                      </div>
                    </div>

                    <div className="recommendationCard__face recommendationCard__face--back">
                      <div className="recommendationCard__backLabel">{data.coverLabel}</div>
                      <div className="recommendationCard__backGlyph" style={{ fontFamily: data.fontFamily }}>
                        {data.cover}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="recommendationDeck__controls">
              <div className="recommendationDeck__nav" aria-label="추천 폰트 넘기기">
                <button
                  type="button"
                  className="recommendationShowcase__navButton"
                  onClick={goToPrevRecommendation}
                  aria-label="이전 추천 폰트"
                >
                  ←
                </button>
                <div className="recommendationDeck__dots" aria-label="추천 폰트 인디케이터">
                  {todaysFontRecommendations.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`recommendationDeck__dot ${idx === recommendationIndex ? 'is-active' : ''}`}
                      onClick={() => {
                        setRecommendationDirection(idx > recommendationIndex ? 'next' : 'prev');
                        setRecommendationPreviousIndex(recommendationIndex);
                        setRecommendationIndex(idx);
                      }}
                      aria-label={`${item.title} 보기`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="recommendationShowcase__navButton"
                  onClick={goToNextRecommendation}
                  aria-label="다음 추천 폰트"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </section>

<section className="howto">
          <div className="howto__blur" aria-hidden="true" />

          <div className="container howto__inner">
            <p className="howto__eyebrow">How It Works</p>
            <h2 className="howto__title">작동 방식</h2>

            <div className="howtoFlow">
              <div className="howtoSteps" role="list" aria-label="작동 방식 단계">
                <div className="howtoStep" role="listitem">
                  <div className="howtoStep__icon">
                    <StepIcon type="select" />
                  </div>
                  <div className="howtoStep__body">
                    <span className="howtoStep__number">01</span>
                    <h3>구글 폰트 선택</h3>
                    <p>마음에 드는 영문 폰트를 선택하세요.</p>
                  </div>
                </div>

                <div className="howtoStep howtoStep--active" role="listitem">
                  <div className="howtoStep__icon">
                    <StepIcon type="convert" />
                  </div>
                  <div className="howtoStep__body">
                    <span className="howtoStep__number">02</span>
                    <h3>AI 스타일 분석 및 변환</h3>
                    <p>
                      AI가 선택한 폰트의 특징을 분석하여
                      <br />
                      어울리는 한글 글꼴을 생성합니다.
                    </p>
                  </div>
                </div>

                <div className="howtoStep" role="listitem">
                  <div className="howtoStep__icon">
                    <StepIcon type="download" />
                  </div>
                  <div className="howtoStep__body">
                    <span className="howtoStep__number">03</span>
                    <h3>폰트 다운로드</h3>
                    <p>생성된 한글 폰트를 즉시 다운로드하세요.</p>
                  </div>
                </div>

                <div className="howtoSteps__line" aria-hidden="true" />
              </div>

              <div className="howtoPanels">
                <article className="howtoPanel">
                  <span className="howtoPanel__eyebrow">STEP 01</span>
                  <div className="howtoPanel__select">
                    <span>Lora</span>
                    <span className="howtoPanel__caret" aria-hidden="true">⌄</span>
                  </div>
                  <p className="howtoPanel__caption">Google Fonts에서 원하는 영문 폰트를 선택합니다.</p>
                </article>

                <article className="howtoPanel">
                  <span className="howtoPanel__eyebrow">STEP 02</span>
                  <div className="howtoPanel__transform">
                    <span className="howtoPanel__fontSample howtoPanel__fontSample--latin">Lora</span>
                    <span className="howtoPanel__connector" aria-hidden="true" />
                    <div className="howtoPanel__loader" aria-hidden="true">
                      <div className="howtoPanel__loaderSpin">
                        <span className="howtoPanel__loaderCore">Φ</span>
                      </div>
                    </div>
                    <span className="howtoPanel__connector" aria-hidden="true" />
                    <span className="howtoPanel__fontSample howtoPanel__fontSample--korean">안녕</span>
                  </div>
                  <p className="howtoPanel__caption">AI가 폰트의 특징과 비율, 개성을 분석하여 어울리는 한글 글꼴을 생성합니다.</p>
                </article>

                <article className="howtoPanel">
                  <span className="howtoPanel__eyebrow">STEP 03</span>
                  <div className="howtoPanel__download">
                    <span className="howtoPanel__fontSample howtoPanel__fontSample--korean">안녕</span>
                    <button type="button" className="howtoPanel__downloadButton">
                      <span className="howtoPanel__downloadIcon" aria-hidden="true">↓</span>
                      TTF 다운로드
                    </button>
                  </div>
                  <p className="howtoPanel__caption">생성된 한글 폰트를 확인하고 TTF 파일로 다운로드합니다.</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="container section recommendationShowcase recommendationShowcaseDuplicate">
          <div className="recommendationShowcase__head">
            <div>
              <p className="recommendationShowcase__eyebrow">TODAY&apos;S PICK</p>
              <h2 className="recommendationShowcase__title">오늘의 추천 폰트</h2>
              <p className="recommendationShowcase__desc">당신의 디자인을 더욱 돋보이게 할 특별한 큐레이션</p>
            </div>

            <div className="recommendationShowcase__actions">
              <button
                type="button"
                className="recommendationShowcase__actionButton"
                onClick={rerollRecommendation}
                aria-label="새 추천 폰트 뽑기"
              >
                새로 뽑기
              </button>
            </div>
          </div>

          <div className={`recommendationDeck recommendationDeck--${recommendationDirection}`}>
            <div className="recommendationDeck__stage">
              {visibleRecommendations.map(({ offset, data, isActive, isJumpReset }) => (
                <article
                  key={data.id}
                  className={[
                    'recommendationCard',
                    `recommendationCard--offset-${offset}`,
                    isActive ? 'is-active' : '',
                    isJumpReset ? 'is-jump-reset' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="recommendationCard__inner">
                    <div className="recommendationCard__face recommendationCard__face--front">
                      <div className="recommendationCard__media" aria-hidden="true" />
                      <div className="recommendationCard__content">
                        <span className="recommendationCard__eyebrow">{data.eyebrow}</span>
                        <h3 className="recommendationCard__name">{data.title}</h3>
                        <p className="recommendationCard__sample" style={{ fontFamily: data.fontFamily }}>
                          {data.sample}
                        </p>
                        <p className="recommendationCard__description">{data.description}</p>
                      </div>
                      <div className="recommendationCard__footer">
                        <span>{data.subtitle}</span>
                        <span>★ ★ ★</span>
                      </div>
                    </div>

                    <div className="recommendationCard__face recommendationCard__face--back">
                      <div className="recommendationCard__backLabel">{data.coverLabel}</div>
                      <div className="recommendationCard__backGlyph" style={{ fontFamily: data.fontFamily }}>
                        {data.cover}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="recommendationDeck__controls">
              <div className="recommendationDeck__nav" aria-label="추천 폰트 넘기기">
                <button
                  type="button"
                  className="recommendationShowcase__navButton"
                  onClick={goToPrevRecommendation}
                  aria-label="이전 추천 폰트"
                >
                  ←
                </button>
                <div className="recommendationDeck__dots" aria-label="추천 폰트 인디케이터">
                  {todaysFontRecommendations.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`recommendationDeck__dot ${idx === recommendationIndex ? 'is-active' : ''}`}
                      onClick={() => {
                        setRecommendationDirection(idx > recommendationIndex ? 'next' : 'prev');
                        setRecommendationPreviousIndex(recommendationIndex);
                        setRecommendationIndex(idx);
                      }}
                      aria-label={`${item.title} 보기`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="recommendationShowcase__navButton"
                  onClick={goToNextRecommendation}
                  aria-label="다음 추천 폰트"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="container section section--popularFonts section--popularFontsDuplicate">
          <div className="section__head">
            <div className="section__title">
              <h2>인기 폰트</h2>
              <span>(다운로드 순)</span>
            </div>
            <div className="featureFontsToolbar">
              <div className="featureFontsPager" aria-label="인기 폰트 넘기기">
                <button
                  type="button"
                  className="featureFontsPager__button"
                  onClick={goToPrevFeaturedPage}
                  aria-label="이전 인기 폰트"
                >
                  ←
                </button>
                <span className="featureFontsPager__status">
                  {featuredPage + 1} / {featuredPages.length}
                </span>
                <button
                  type="button"
                  className="featureFontsPager__button"
                  onClick={goToNextFeaturedPage}
                  aria-label="다음 인기 폰트"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          <div
            key={`${featuredPage}-${featuredDirection}`}
            className={`featureFontsGrid featureFontsGrid--threeUp featureFontsGrid--animated featureFontsGrid--${featuredDirection}`}
          >
            {featuredPages[featuredPage].map((font) => (
              <HomeFontCard
                key={font.id}
                font={font}
                liked={likedFeaturedFontIds.includes(font.id)}
                onToggleLike={toggleFeaturedFontLike}
              />
            ))}
          </div>
        </section>

        <section ref={communityRef} className="container section community">
          <div className="section__head">
            <div>
              <h2 className="community__title">커뮤니티 / 리뷰</h2>
              <p className="community__desc">다른 사용자들이 생성한 놀라운 폰트들을 확인해보세요.</p>
            </div>
            <a className="link-more" href="#">
              더 보기 <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className={`gallery gallery--reveal gallery--count-${visibleCommunityCount}`}>
            <article className="tile tile--blue tile--h256">
              <div className="tile__center">
                <div className="tile__big">
                  안녕하세요
                  <br />
                  폰티파이
                </div>
              </div>
              <footer className="tile__footer tile__footer--light">
                <span>안녕가득</span>
                <span className="stat stat--light">♥ 79</span>
              </footer>
            </article>

            <article className="tile tile--dark tile--h320">
              <div className="tile__center">
                <div className="tile__big" style={{ fontSize: '30px', lineHeight: '36px' }}>
                  안녕하세요
                </div>
                <div className="tile__sub">우아한 명조체</div>
              </div>
              <footer className="tile__footer">
                <span>designer_k</span>
                <span className="stat stat--red">♥ 124</span>
              </footer>
            </article>

            <article className="tile tile--white tile--h160">
              <div className="tile__center">
                <div className="tile__mid">안녕하세요</div>
              </div>
              <footer className="tile__footer tile__footer--muted">
                <span>user_12</span>
                <span className="dot" />
              </footer>
            </article>

            <article className="tile tile--soft tile--h192">
              <div className="tile__center">
                <div className="tile__code">Code_Font</div>
              </div>
              <footer className="tile__footer tile__footer--muted">
                <span>dev_lee</span>
                <span className="dot" />
              </footer>
            </article>

            <article className="tile tile--black tile--h224">
              <div className="tile__center">
                <div className="tile__big">기울임체</div>
              </div>
              <footer className="tile__footer">
                <span>italic_lover</span>
                <span className="stat stat--red">♥ 32</span>
              </footer>
            </article>

            <article className="tile tile--white tile--h256">
              <div className="tile__center">
                <div className="tile__display">Fontify</div>
              </div>
              <footer className="tile__footer tile__footer--muted">
                <span>Cursive_Style</span>
                <span className="stat stat--pink">♥ 89</span>
                <span className="stat">★ 5</span>
              </footer>
            </article>

            <article className="tile tile--accent tile--h192">
              <div className="tile__center">
                <div className="tile__popular">POPULAR</div>
              </div>
              <footer className="tile__footer tile__footer--accent">
                <span>trend_setter</span>
                <span className="dot dot--accent" />
              </footer>
            </article>

            <article className="tile tile--white tile--h256 tile--kanji">
              <div className="tile__center">
                <div className="tile__ghost">A</div>
                <div className="tile__kanji">가</div>
              </div>
              <footer className="tile__footer tile__footer--muted">
                <span>Graphic_Kr</span>
                <span className="stat stat--red">♥ 67</span>
              </footer>
            </article>

            <article className="tile tile--night tile--h208">
              <div className="tile__center">
                <div className="tile__mid" style={{ color: '#e5e7eb', fontWeight: 300 }}>
                  여 백
                </div>
              </div>
              <footer className="tile__footer">
                <span>minimalist</span>
                <span className="stat">★ 2</span>
              </footer>
            </article>

            <article className="tile tile--white tile--h176">
              <div className="tile__center">
                <div className="tile__mid">폰티파이</div>
              </div>
              <footer className="tile__footer tile__footer--muted">
                <span>Bold_Sans</span>
                <span className="stat stat--salmon">♥ 45</span>
              </footer>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
