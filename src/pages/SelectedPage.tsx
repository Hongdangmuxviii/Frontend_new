import { useMemo, useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';

function ContentEditableDiv({
  className,
  value,
  onChange,
}: {
  className: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div
      className={className}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onInput={(e) => {
        const text = (e.currentTarget as HTMLDivElement).innerText;
        onChange(text);
      }}
    >
      {value}
    </div>
  );
}

export default function SelectedPage() {
  const [fontSize, setFontSize] = useState(34);

  const [latinUpper, setLatinUpper] = useState('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  const [latinLower, setLatinLower] = useState('abcdefghijklmnopqrstuvwxyz');
  const [krText, setKrText] = useState('가나다라마바사아자차카타파하');

  // Keep original CSS sizes as a base, then scale with slider.
  const previewStyle = useMemo(() => {
    const scale = fontSize / 34; // slider default is 34 in the export
    return {
      latinFontSize: `${Math.round(16 * scale)}px`,
      latinLineHeight: `${Math.round(24 * scale)}px`,
      krFontSize: `${Math.round(18 * scale)}px`,
      krLineHeight: `${Math.round(28 * scale)}px`,
    };
  }, [fontSize]);

  return (
    <>
      <Header variant="selected" />

      <main className="main">
        <section className="container detail">
          <h1 className="detail__title">Ubuntu 60</h1>

          <div className="detail__actions">
            <span className="badge">AI생성</span>
            <button className="btn btn--ghost btn--sm" type="button">
              한글 폰트 다운로드
            </button>
            <button className="btn btn--ghost btn--sm" type="button">
              영문 폰트 다운로드
            </button>
          </div>

          <div className="detail__divider" aria-hidden="true" />

          <div className="detail__grid">
            <div className="panel">
              <div className="panel__head">
                <div className="panel__title">생성된 폰트 미리보기</div>
                <div className="panel__controls">
                  <label className="seg" aria-label="크기">
                    <span className="seg__label">A</span>
                    <input
                      className="seg__range"
                      type="range"
                      min={16}
                      max={60}
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                    />
                    <span className="seg__label seg__label--lg">A</span>
                  </label>
                  <button className="icon-btn" aria-label="정렬" type="button" />
                </div>
              </div>

              <div className="preview">
                <div
                  style={{
                    fontSize: previewStyle.latinFontSize,
                    lineHeight: previewStyle.latinLineHeight,
                  }}
                >
                  <ContentEditableDiv
                    className="preview__latin"
                    value={latinUpper}
                    onChange={setLatinUpper}
                  />
                </div>

                <div
                  style={{
                    fontSize: previewStyle.latinFontSize,
                    lineHeight: previewStyle.latinLineHeight,
                  }}
                >
                  <ContentEditableDiv
                    className="preview__latin preview__latin--lower"
                    value={latinLower}
                    onChange={setLatinLower}
                  />
                </div>

                <div
                  style={{
                    fontSize: previewStyle.krFontSize,
                    lineHeight: previewStyle.krLineHeight,
                  }}
                >
                  <ContentEditableDiv
                    className="preview__kr"
                    value={krText}
                    onChange={setKrText}
                  />
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel__head">
                <div className="panel__title">유사도 분석 결과</div>
              </div>

              <div className="analysis">
                <div className="analysis__left">
                  <div className="ring">
                    <div className="ring__value">12%</div>
                    <div className="ring__label">유사도</div>
                  </div>

                  <div className="analysis__meta">
                    <div className="meta-row">
                      <span className="dot dot--ok" />
                      <span>일치율 낮음 - 유일함</span>
                    </div>
                    <div className="meta-sub">
                      유사도는 전체 폰트 특징을 기준으로 계산됩니다.
                    </div>
                  </div>
                </div>

                <div className="analysis__cards">
                  <div className="mini">
                    <div className="mini__k">ORIGINAL FONT</div>
                    <div className="mini__v">Abc 123</div>
                  </div>
                  <div className="mini">
                    <div className="mini__k">AI GENERATED FONT</div>
                    <div className="mini__v">Abc 123</div>
                  </div>
                </div>

                <div className="analysis__bars">
                  <div className="bar">
                    <div className="bar__name">굵기 (Weight)</div>
                    <div className="bar__track">
                      <div className="bar__fill" style={{ width: '15%' }} />
                    </div>
                    <div className="bar__val">15%</div>
                  </div>

                  <div className="bar">
                    <div className="bar__name">기울기 (Slant)</div>
                    <div className="bar__track">
                      <div className="bar__fill" style={{ width: '8%' }} />
                    </div>
                    <div className="bar__val">8%</div>
                  </div>

                  <div className="bar">
                    <div className="bar__name">획 대비 (Stroke)</div>
                    <div className="bar__track">
                      <div className="bar__fill" style={{ width: '12%' }} />
                    </div>
                    <div className="bar__val">12%</div>
                  </div>

                  <div className="bar">
                    <div className="bar__name">자간 (Spacing)</div>
                    <div className="bar__track">
                      <div className="bar__fill" style={{ width: '6%' }} />
                    </div>
                    <div className="bar__val">6%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="mockups">
            <h2 className="mockups__title">생성된 폰트 적용 디자인 보기</h2>
            <div className="mockups__grid">
              <div className="mock">
                <div className="mock__box" />
                <p className="mock__caption">티셔츠 목업 예시</p>
              </div>
              <div className="mock">
                <div className="mock__box" />
                <p className="mock__caption">영상 썸네일 자막 예시</p>
              </div>
            </div>
          </section>

          <section className="container section note">
            <div className="note__head">
              <span className="note__dot" />
              <h2 className="note__title">AI 폰트 생성에 관한 저작권 안내</h2>
            </div>
            <p className="note__body">
              Fontify는 생성된 폰트에 대한 저작권을 보장하지 않습니다. 상용 프로젝트에
              사용하기 전에는 원본 폰트의 라이선스를 확인하세요.
            </p>
          </section>

          <section className="container section reviews">
            <div className="reviews__head">
              <h2>만족도 리뷰</h2>
              <button className="btn btn--ghost btn--sm" type="button">
                리뷰쓰기
              </button>
            </div>

            <div className="review-card">
              <div className="review-card__score">
                <div className="score__num">4.9</div>
                <div className="score__stars" aria-label="별점 4.9">
                  <span className="star star--on" />
                  <span className="star star--on" />
                  <span className="star star--on" />
                  <span className="star star--on" />
                  <span className="star star--on" />
                </div>
                <div className="score__meta">based on 124 reviews</div>
              </div>

              <div className="review-card__list">
                <div className="row">
                  <span>5</span>
                  <div className="row__track">
                    <div className="row__fill" style={{ width: '84%' }} />
                  </div>
                  <span>84%</span>
                </div>
                <div className="row">
                  <span>4</span>
                  <div className="row__track">
                    <div className="row__fill" style={{ width: '12%' }} />
                  </div>
                  <span>12%</span>
                </div>
                <div className="row">
                  <span>3</span>
                  <div className="row__track">
                    <div className="row__fill" style={{ width: '3%' }} />
                  </div>
                  <span>3%</span>
                </div>
                <div className="row">
                  <span>2</span>
                  <div className="row__track">
                    <div className="row__fill" style={{ width: '1%' }} />
                  </div>
                  <span>1%</span>
                </div>
                <div className="row">
                  <span>1</span>
                  <div className="row__track">
                    <div className="row__fill" style={{ width: '0%' }} />
                  </div>
                  <span>0%</span>
                </div>
              </div>
            </div>

            <div className="user-reviews">
              <div className="user-review">
                <div className="user-review__left">
                  <div className="user-review__title">결과값</div>
                  <div className="user-review__date">2026.01.21</div>
                  <div className="user-review__text">폰트 너무 예뻐요</div>
                </div>
                <div className="user-review__right">
                  <div className="score__stars">
                    <span className="star star--on" />
                    <span className="star star--on" />
                    <span className="star star--on" />
                    <span className="star star--on" />
                    <span className="star star--on" />
                  </div>
                  <span className="pill pill--soft">유용해요</span>
                </div>
              </div>

              <div className="user-review">
                <div className="user-review__left">
                  <div className="user-review__title">결과값</div>
                  <div className="user-review__date">2026.01.21</div>
                  <div className="user-review__text">폰트 너무 마음에요</div>
                </div>
                <div className="user-review__right">
                  <div className="score__stars">
                    <span className="star star--on" />
                    <span className="star star--on" />
                    <span className="star star--on" />
                    <span className="star star--on" />
                    <span className="star star--on" />
                  </div>
                  <span className="pill pill--soft">유용해요</span>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </>
  );
}

