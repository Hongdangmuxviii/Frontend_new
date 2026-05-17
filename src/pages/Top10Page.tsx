import { useEffect, useMemo, useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { fontifyApi } from '../api/fontifyApi';
import { mapGeneratedFontToTopFont } from '../api/mappers';
import { mockTopFonts } from '../mocks/topFonts';
import type { TopFont } from '../types/font';

const downloadIconSrc = '/images/common/download-icon.svg';

type FontRowProps = {
  font: TopFont;
  liked: boolean;
  onToggleLike: (id: string) => void;
  onDownload: (id: string) => void;
};

function FontRow({ font, liked, onToggleLike, onDownload }: FontRowProps) {
  return (
    <article className="top10__row">
      <div className={`top10__rank ${font.rank === 1 ? 'top10__rank--active' : ''}`}>
        {font.rank}
      </div>

      <a className="top10__previewCol top10__previewCol--link" href="#/selected">
        <div className="top10__preview" style={{ background: font.previewBackground }}>
          {font.preview}
        </div>
      </a>

      <div className="top10__info">
        <h3 className="top10__fontName">
          <a className="top10__fontLink" href="#/selected">
            {font.title}
          </a>
        </h3>
        <p className="top10__fontMeta">{font.creator}</p>
      </div>

      <div className="top10__tags">
        {font.tags.map((tag) => (
          <span key={tag.label} className={`top10__tag top10__tag--${tag.tone}`}>
            {tag.label}
          </span>
        ))}
      </div>

      <button
        className={`top10__likesButton ${liked ? 'top10__likesButton--active' : ''}`}
        type="button"
        aria-label={liked ? `${font.title} 좋아요 취소` : `${font.title} 좋아요`}
        onClick={() => onToggleLike(font.id)}
      >
        <span className="top10__likeIcon" aria-hidden="true">
          {liked ? '♥' : '♡'}
        </span>
        <span>{font.likes.toLocaleString('ko-KR')}</span>
      </button>

      <button
        className={`top10__download ${font.downloaded ? 'top10__download--done' : ''}`}
        type="button"
        aria-label={`${font.title} 다운로드`}
        onClick={() => onDownload(font.id)}
      >
        {font.downloaded ? (
          '완료'
        ) : (
          <img className="top10__downloadIcon" src={downloadIconSrc} alt="" aria-hidden="true" />
        )}
      </button>
    </article>
  );
}

export default function Top10Page() {
  const [fonts, setFonts] = useState<TopFont[]>(mockTopFonts);
  const [visibleCount, setVisibleCount] = useState(5);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const visibleFonts = useMemo(() => fonts.slice(0, visibleCount), [fonts, visibleCount]);
  const hasMore = visibleCount < fonts.length;

  useEffect(() => {
    let isMounted = true;
    fontifyApi
      .listGeneratedFonts({ limit: 10 })
      .then((items) => {
        if (isMounted && items.length > 0) {
          setFonts(items.map(mapGeneratedFontToTopFont));
        }
      })
      .catch(() => {
        if (isMounted) setFonts(mockTopFonts);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleLike = (id: string) => {
    setFonts((current) =>
      current.map((font) => {
        if (font.id !== id) return font;
        const isLiked = likedIds.includes(id);
        return { ...font, likes: font.likes + (isLiked ? -1 : 1) };
      }),
    );
    setLikedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const handleDownload = (id: string) => {
    setFonts((current) =>
      current.map((font) => (font.id === id ? { ...font, downloaded: true } : font)),
    );
  };

  const handleMore = () => {
    setVisibleCount((current) => Math.min(current + 3, fonts.length));
  };

  return (
    <>
      <Header variant="top10" activeNav="popular" />

      <main className="main">
        <section className="top10">
          <div className="top10__container">
            <header className="top10__hero">
              <h1 className="top10__title">TOP 10</h1>
              <p className="top10__desc">
                성공적인 한글 폰트 생성으로
                <br />
                가장 많은 사랑을 받고 있는 한글 폰트를
                <br />
                TOP 10에서 만나보세요
              </p>
            </header>

            <div className="top10__tableHead" aria-hidden="true">
              <span>순위</span>
              <span>미리보기</span>
              <span>폰트 정보</span>
              <span>태그</span>
              <span>좋아요</span>
              <span>다운로드</span>
            </div>

            <div className="top10__list">
              {visibleFonts.map((font) => (
                <FontRow
                  key={font.id}
                  font={font}
                  liked={likedIds.includes(font.id)}
                  onToggleLike={toggleLike}
                  onDownload={handleDownload}
                />
              ))}
            </div>

            <div className="top10__moreWrap">
              <button
                className="top10__more"
                type="button"
                onClick={handleMore}
                disabled={!hasMore}
              >
                {hasMore ? '더 보기' : '모두 확인했어요'}
                <span className="top10__moreArrow" aria-hidden="true">
                  {hasMore ? '▾' : '✓'}
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
