import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { resolveApiAssetUrl } from '../api/client';
import type { ApiGeneratedFontItem } from '../api/backendTypes';
import { fontifyApi } from '../api/fontifyApi';

type SelectedRouteParams = {
  generatedFontId: string;
  sourceFontId: string;
  family: string;
};

function readSelectedParamsFromHash(): SelectedRouteParams {
  const hash = window.location.hash || '';
  const queryIndex = hash.indexOf('?');
  if (queryIndex < 0) return { generatedFontId: '', sourceFontId: '', family: '' };
  const params = new URLSearchParams(hash.slice(queryIndex + 1));

  return {
    generatedFontId:
      params.get('generatedFontId') ?? params.get('generated_font_id') ?? params.get('id') ?? '',
    sourceFontId: params.get('sourceFontId') ?? params.get('originalFontId') ?? params.get('fontId') ?? '',
    family: params.get('family') ?? '',
  };
}

function getGeneratedFontTitle(font: ApiGeneratedFontItem | null) {
  if (!font) return '완성된 폰트';
  return font.name?.trim() || `Generated Font #${font.generated_font_id}`;
}

function getFileNameFromUrl(url: string, fallback: string) {
  try {
    const pathname = new URL(url).pathname;
    return decodeURIComponent(pathname.split('/').pop() || fallback);
  } catch {
    return fallback;
  }
}

function ContentEditableDiv({
  className,
  value,
  onChange,
  style,
}: {
  className: string;
  value: string;
  onChange: (next: string) => void;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      style={style}
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
  const [params, setParams] = useState<SelectedRouteParams>(() => readSelectedParamsFromHash());
  const [generatedFont, setGeneratedFont] = useState<ApiGeneratedFontItem | null>(null);
  const [loadedFontFamily, setLoadedFontFamily] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [latinUpper, setLatinUpper] = useState('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  const [latinLower, setLatinLower] = useState('abcdefghijklmnopqrstuvwxyz');
  const [krText, setKrText] = useState('가나다라마바사아자차카타파하');

  useEffect(() => {
    const handleHashChange = () => setParams(readSelectedParamsFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadGeneratedFont() {
      setIsLoading(true);
      setLoadError('');

      try {
        if (params.generatedFontId) {
          const font = await fontifyApi.getGeneratedFont(params.generatedFontId);
          if (!cancelled) setGeneratedFont(font);
          return;
        }

        const fonts = await fontifyApi.listGeneratedFonts({ page: 1, limit: 1 });
        if (!cancelled) setGeneratedFont(fonts[0] ?? null);
      } catch (error) {
        if (!cancelled) {
          setGeneratedFont(null);
          setLoadError(error instanceof Error ? error.message : '완성된 폰트를 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadGeneratedFont();

    return () => {
      cancelled = true;
    };
  }, [params.generatedFontId]);

  useEffect(() => {
    setLoadedFontFamily('');

    const sourceUrl = resolveApiAssetUrl(generatedFont?.file_url);
    if (!sourceUrl || typeof FontFace === 'undefined' || !document.fonts) return;

    let cancelled = false;
    const previewFamily = `fontify-generated-${generatedFont?.generated_font_id ?? 'preview'}`;
    const fontFace = new FontFace(previewFamily, `url(${JSON.stringify(sourceUrl)})`);

    fontFace
      .load()
      .then((loadedFontFace) => {
        if (cancelled) return;
        document.fonts.add(loadedFontFace);
        setLoadedFontFamily(previewFamily);
      })
      .catch(() => {
        if (!cancelled) setLoadedFontFamily('');
      });

    return () => {
      cancelled = true;
      try {
        document.fonts.delete(fontFace);
      } catch {
        // Ignore cleanup failures from browsers that keep the face internally.
      }
    };
  }, [generatedFont]);

  const fontTitle = getGeneratedFontTitle(generatedFont);
  const generatedFontUrl = resolveApiAssetUrl(generatedFont?.file_url);
  const originalFontHref = params.sourceFontId
    ? `#/english-detail?fontId=${encodeURIComponent(params.sourceFontId)}`
    : params.family
      ? `#/english-detail?family=${encodeURIComponent(params.family)}`
      : '#/english-fonts';
  const previewFontFamily = loadedFontFamily
    ? `"${loadedFontFamily}", Pretendard, sans-serif`
    : 'Pretendard, system-ui, sans-serif';

  const previewStyle = useMemo(() => {
    const scale = fontSize / 34;
    return {
      latinFontSize: `${Math.round(18 * scale)}px`,
      latinLineHeight: `${Math.round(30 * scale)}px`,
      krFontSize: `${Math.round(22 * scale)}px`,
      krLineHeight: `${Math.round(36 * scale)}px`,
    };
  }, [fontSize]);

  const handleDownload = async () => {
    if (!generatedFont) {
      window.alert('다운로드할 폰트 파일 URL이 없습니다.');
      return;
    }

    try {
      setIsDownloading(true);
      const download = await fontifyApi.downloadGeneratedFont(generatedFont.generated_font_id);
      const downloadUrl = resolveApiAssetUrl(download.file_url) ?? generatedFontUrl;
      if (!downloadUrl) throw new Error('download url missing');

      const filename = getFileNameFromUrl(downloadUrl, `${fontTitle}.ttf`);
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('download failed');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      if (generatedFontUrl) {
        window.open(generatedFontUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.alert('폰트 다운로드에 실패했습니다.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Header variant="selected" />

      <main className="main">
        <section className="container detail">
          <h1 className="detail__title">{isLoading ? '완성된 폰트 불러오는 중' : fontTitle}</h1>

          <div className="detail__actions">
            <span className="badge">AI 생성</span>
            <button
              className="btn btn--sm detail__downloadBtn"
              type="button"
              onClick={handleDownload}
              disabled={!generatedFont || isDownloading}
            >
              {isDownloading ? '다운로드 중...' : '한글 폰트 다운로드'}
            </button>
            <a className="btn btn--ghost btn--sm" href={originalFontHref}>
              원본 폰트 페이지 가기
            </a>
          </div>

          {loadError ? <p className="detail__status">{loadError}</p> : null}
          {!loadError && !generatedFont && !isLoading ? (
            <p className="detail__status">아직 표시할 완성 폰트가 없습니다.</p>
          ) : null}

          <div className="detail__divider" aria-hidden="true" />

          <div className="detail__grid">
            <div className="panel">
              <div className="panel__head">
                <div className="panel__title">생성된 폰트 미리보기</div>
                <div className="panel__controls">
                  <label className="seg" aria-label="미리보기 크기">
                    <span className="seg__label">A</span>
                    <input
                      className="seg__range"
                      type="range"
                      min={16}
                      max={72}
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                    />
                    <span className="seg__label seg__label--lg">A</span>
                  </label>
                  <button className="icon-btn" aria-label="정렬" type="button" />
                </div>
              </div>

              <div className="preview" style={{ fontFamily: previewFontFamily }}>
                <ContentEditableDiv
                  className="preview__latin"
                  value={latinUpper}
                  onChange={setLatinUpper}
                  style={{
                    fontSize: previewStyle.latinFontSize,
                    lineHeight: previewStyle.latinLineHeight,
                  }}
                />

                <ContentEditableDiv
                  className="preview__latin preview__latin--lower"
                  value={latinLower}
                  onChange={setLatinLower}
                  style={{
                    fontSize: previewStyle.latinFontSize,
                    lineHeight: previewStyle.latinLineHeight,
                  }}
                />

                <ContentEditableDiv
                  className="preview__kr"
                  value={krText}
                  onChange={setKrText}
                  style={{
                    fontSize: previewStyle.krFontSize,
                    lineHeight: previewStyle.krLineHeight,
                  }}
                />
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
                      <span>일치율 낮음 - 유니크함</span>
                    </div>
                    <div className="meta-sub">유사도는 전체 폰트 특징을 기준으로 계산합니다.</div>
                  </div>
                </div>

                <div className="analysis__cards">
                  <div className="mini">
                    <div className="mini__k">ORIGINAL FONT</div>
                    <div className="mini__v">Abc 123</div>
                  </div>
                  <div className="mini">
                    <div className="mini__k">AI GENERATED FONT</div>
                    <div className="mini__v" style={{ fontFamily: previewFontFamily }}>
                      Abc 123
                    </div>
                  </div>
                </div>

                <div className="analysis__bars">
                  {[
                    ['굵기 (Weight)', '15%'],
                    ['기울기 (Slant)', '8%'],
                    ['획 대비 (Stroke)', '12%'],
                    ['자간 (Spacing)', '6%'],
                  ].map(([label, value]) => (
                    <div className="bar" key={label}>
                      <div className="bar__name">{label}</div>
                      <div className="bar__track">
                        <div className="bar__fill" style={{ width: value }} />
                      </div>
                      <div className="bar__val">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <section className="mockups">
            <h2 className="mockups__title">생성된 폰트 적용 디자인 보기</h2>
            <div className="mockups__grid">
              <div className="mock">
                <div className="mock__box" />
                <p className="mock__caption">굿즈 목업 예시</p>
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
              <h2 className="note__title">AI 폰트 생성과 저작권 안내</h2>
            </div>
            <p className="note__body">
              Fontify는 생성된 폰트에 대한 저작권을 보장하지 않습니다. 상용 프로젝트에 사용하기 전에 원본 폰트의
              라이선스를 확인하세요.
            </p>
          </section>
        </section>
      </main>

      <Footer />
    </>
  );
}
