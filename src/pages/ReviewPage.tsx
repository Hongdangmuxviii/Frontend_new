import Header from '../components/Header';
import Footer from '../components/Footer';
import { fontifyApi } from '../api/fontifyApi';
import { mapDownloadToPendingReviewFont, mapRatingToReview } from '../api/mappers';
import { useApiResource } from '../hooks/useApiResource';
import {
  mockFeaturedReview,
  mockPendingReviewFonts,
  mockReviewImpact,
  mockReviews,
} from '../mocks/reviews';
import type { PendingReviewFont, ReviewCard } from '../types/review';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="reviewStars" aria-label={`${rating}점`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={index < rating ? 'reviewStars__star is-filled' : 'reviewStars__star'}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}

function PendingFontCard({ font }: { font: PendingReviewFont }) {
  return (
    <article className="pendingCard">
      <div className={`pendingCard__mark pendingCard__mark--${font.mark}`} aria-hidden="true" />
      <p className="pendingCard__label">{font.label}</p>
      <h3 className="pendingCard__name">{font.name}</h3>
      <button
        className={
          font.tone === 'primary'
            ? 'pendingCard__button pendingCard__button--primary'
            : 'pendingCard__button'
        }
        type="button"
      >
        리뷰 작성하기
        <span aria-hidden="true">→</span>
      </button>
    </article>
  );
}

function ReviewItem({ review }: { review: ReviewCard }) {
  return (
    <article className="reviewCard">
      <header className="reviewCard__header">
        <div>
          <h3 className="reviewCard__title">{review.title}</h3>
          <StarRating rating={review.rating} />
        </div>
        <button className="reviewCard__more" type="button" aria-label="리뷰 메뉴">
          ⋮
        </button>
      </header>

      <div className="reviewCard__content">
        <div className={`reviewSample ${review.sampleClass ?? ''}`}>
          {review.sample.split('\n').map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <p className="reviewCard__body">{review.body}</p>
      </div>

      <footer className="reviewCard__footer">
        <span>{review.date}</span>
        <div className="reviewCard__actions">
          <button type="button">수정</button>
          <button className="is-danger" type="button">
            삭제
          </button>
        </div>
      </footer>
    </article>
  );
}

export default function ReviewPage() {
  const { data } = useApiResource(
    {
      pendingReviewFonts: mockPendingReviewFonts,
      reviews: mockReviews,
    },
    async () => {
      const [downloads, ratings] = await Promise.all([
        fontifyApi.getMyDownloads(),
        fontifyApi.getMyRatings(),
      ]);

      return {
        pendingReviewFonts: downloads.slice(0, 2).map(mapDownloadToPendingReviewFont),
        reviews: ratings.map(mapRatingToReview),
      };
    },
    [],
    'review-page',
  );

  return (
    <>
      <Header />
      <main className="reviewPage">
        <section className="reviewHero container">
          <div className="reviewHero__heading">
            <p className="reviewEyebrow">대기 중인 피드백</p>
            <h1>리뷰 대기중인 작업</h1>
          </div>
          <p className="reviewHero__desc">
            최근 사용하신 서체에 대한 소중한 의견을 공유하여 주세요.
          </p>
        </section>

        <section className="reviewPending container" aria-label="리뷰 대기중인 서체">
          <div className="reviewPending__cards">
            {data.pendingReviewFonts.map((font) => (
              <PendingFontCard key={font.id} font={font} />
            ))}
            <article className="reviewStatsCard">
              <strong>{String(data.pendingReviewFonts.length).padStart(2, '0')}</strong>
              <span>피드백 대기 중인 서체</span>
              <div className="reviewStatsCard__bar" aria-hidden="true">
                <i />
              </div>
            </article>
          </div>
        </section>

        <section className="reviewManage container">
          <header className="reviewManage__header">
            <h2>나의 리뷰 관리</h2>
            <div className="reviewManage__tools">
              <button className="reviewToolBtn" type="button">
                최신순
                <span aria-hidden="true">⌄</span>
              </button>
              <button className="reviewIconBtn" type="button" aria-label="필터">
                <span />
              </button>
            </div>
          </header>

          <div className="reviewMasonry">
            <ReviewItem review={data.reviews[0] ?? mockReviews[0]} />
            <article className="reviewImpactCard">
              <div className="reviewImpactCard__spark" aria-hidden="true">
                ✦
              </div>
              <h3>리뷰의 영향력</h3>
              <p>
                회원님의 리뷰가 <strong>{mockReviewImpact.reachedDesigners}명 이상의 디자이너</strong>의 프로젝트에 맞는
                서체를 선택하는 데 도움을 주었습니다.
              </p>
              <div className="reviewImpactCard__avatars" aria-hidden="true">
                {mockReviewImpact.avatarLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
                <strong>{mockReviewImpact.growthLabel}</strong>
              </div>
            </article>
            {data.reviews.slice(1).map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
            <article className="reviewFeatureCard">
              <div>
                <strong>{mockFeaturedReview.fontName}</strong>
                <span>{mockFeaturedReview.label}</span>
              </div>
              <footer>
                <p>추천 리뷰</p>
                <h3>{mockFeaturedReview.title}</h3>
              </footer>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
