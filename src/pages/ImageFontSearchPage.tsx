import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

type MatchResult = {
  id: string;
  name: string;
  foundry: string;
  similarity: number;
  weight: string;
  slant: string;
  category: string;
  previewText: string;
  previewFamily: string;
  imageLabel: string;
  downloadUrl: string;
  demoUrl: string;
};

const matchResults: MatchResult[] = [
  {
    id: 'noto-sans-kr',
    name: 'Noto Sans KR',
    foundry: 'Google Fonts · Designed by Google',
    similarity: 98,
    weight: '굵게',
    slant: '0°',
    category: '일반',
    previewText: '폰티파이 Fontify',
    previewFamily: '"Noto Sans KR", "Pretendard", sans-serif',
    imageLabel: 'Sample',
    downloadUrl: 'https://fonts.google.com/noto/specimen/Noto+Sans+KR',
    demoUrl: '#/english-detail?fontName=Noto%20Sans%20KR',
  },
  {
    id: 'nanum-myeongjo',
    name: 'Nanum Myeongjo',
    foundry: 'Google Fonts · Designed by NAVER',
    similarity: 85,
    weight: '보통',
    slant: '0°',
    category: '세리프',
    previewText: '가나다라 Fontify',
    previewFamily: '"Nanum Myeongjo", Georgia, serif',
    imageLabel: 'A',
    downloadUrl: 'https://fonts.google.com/specimen/Nanum+Myeongjo',
    demoUrl: '#/english-detail?fontName=Nanum%20Myeongjo',
  },
  {
    id: 'pretendard',
    name: 'Pretendard',
    foundry: 'Google Fonts 스타일 매칭 샘플',
    similarity: 81,
    weight: '중간',
    slant: '2°',
    category: '산세리프',
    previewText: '이미지에서 찾은 Fontify',
    previewFamily: '"Pretendard", sans-serif',
    imageLabel: 'Font',
    downloadUrl: 'https://fonts.google.com/',
    demoUrl: '#/english-fonts',
  },
];

const processSteps = [
  {
    title: '이미지 업로드',
    desc: '폰트가 포함된 고해상도 이미지를 인식합니다.',
    icon: 'image',
  },
  {
    title: '특징 추출',
    desc: '글자의 굵기, 기울기, 자폭 등 세부 특징을 AI가 분석합니다.',
    icon: 'chart',
  },
  {
    title: 'Google Fonts 매칭',
    desc: '라이브러리 내 가장 유사한 서체를 추천합니다.',
    icon: 'cloud',
  },
] as const;

function ProcessIcon({ type }: { type: (typeof processSteps)[number]['icon'] }) {
  if (type === 'image') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="M7 16l4-4 3 3 3-2 0 3" />
      </svg>
    );
  }

  if (type === 'chart') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 18V6" />
        <path d="M9 18v-4" />
        <path d="M13 18V9" />
        <path d="M17 18V4" />
        <path d="M4 18h16" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 14.5A4.5 4.5 0 1 1 9.2 6" />
      <path d="M9 18h7a4 4 0 0 0 .8-7.92A5.5 5.5 0 0 0 7 11.2" />
      <path d="M9 14l3-3 3 3" />
    </svg>
  );
}

export default function ImageFontSearchPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [visibleCount, setVisibleCount] = useState(2);

  const uploadedPreviewUrl = useMemo(
    () => (uploadedFile ? URL.createObjectURL(uploadedFile) : null),
    [uploadedFile],
  );

  useEffect(() => {
    return () => {
      if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl);
    };
  }, [uploadedPreviewUrl]);

  const visibleResults = useMemo(
    () => matchResults.slice(0, visibleCount),
    [visibleCount],
  );

  const handleOpenFilePicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setUploadedFile(nextFile);
    setVisibleCount(2);
  };

  return (
    <>
      <Header variant="english-fonts" activeNav="english" />

      <main className="main">
        <section className="imageFontSearch">
          <div className="imageFontSearch__inner">
            <header className="imageFontSearch__hero">
              <h1>이미지로 폰트 찾기</h1>
              <p>
                업로드한 이미지에서 서체 특징을 분석하여 <strong>방대한 Google Fonts 라이브러리</strong>에서
                <br />
                가장 유사한 무료 웹 폰트를 찾아드립니다.
              </p>
            </header>

            <section className="imageFontSearch__process" aria-labelledby="image-font-process-title">
              <h2 id="image-font-process-title">AI 분석 프로세스</h2>
              <div className="imageFontSearch__processGrid">
                {processSteps.map((step, index) => (
                  <div key={step.title} className="imageFontSearch__processItem">
                    <div className="imageFontSearch__processIcon">
                      <ProcessIcon type={step.icon} />
                    </div>
                    <strong>{step.title}</strong>
                    <p>{step.desc}</p>
                    {index < processSteps.length - 1 ? (
                      <span className="imageFontSearch__processArrow" aria-hidden="true">
                        →
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="imageFontSearch__uploadSection">
              <input
                ref={inputRef}
                className="imageFontSearch__input"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
              />

              <div className="imageFontSearch__uploadPanel">
                <div className="imageFontSearch__uploadIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 16V8" />
                    <path d="M8.5 11.5L12 8l3.5 3.5" />
                    <path d="M6 18h12" />
                    <path d="M8 4h5l3 3v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                  </svg>
                </div>
                <h2>찾고 싶은 폰트 이미지를 업로드하세요</h2>
                <p>JPG, PNG, WEBP (최대 10MB)</p>
                <button type="button" className="imageFontSearch__uploadButton" onClick={handleOpenFilePicker}>
                  파일 선택하기
                </button>
                {uploadedFile ? (
                  <div className="imageFontSearch__selectedFile">
                    <span>{uploadedFile.name}</span>
                    <button type="button" onClick={handleOpenFilePicker}>
                      다시 선택
                    </button>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="imageFontSearch__results">
              <div className="imageFontSearch__resultsHead">
                <div>
                  <h2>매칭 결과</h2>
                  <p>이미지 분석 결과, Google Fonts에서 총 3개의 유사 서체를 찾았습니다.</p>
                </div>
                <div className="imageFontSearch__sort">
                  <span>정렬 기준</span>
                  <button type="button">정확도순</button>
                </div>
              </div>

              <div className="imageFontSearch__resultList">
                {visibleResults.map((result) => (
                  <article key={result.id} className="imageFontSearch__resultCard">
                    <div className="imageFontSearch__thumb">
                      <span className="imageFontSearch__thumbLabel">업로드된 이미지</span>
                      <div className="imageFontSearch__thumbFrame">
                        {uploadedPreviewUrl ? (
                          <img src={uploadedPreviewUrl} alt="업로드한 폰트 샘플" />
                        ) : (
                          <span
                            className="imageFontSearch__thumbFallback"
                            style={{ fontFamily: result.previewFamily }}
                          >
                            {result.imageLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="imageFontSearch__resultBody">
                      <div className="imageFontSearch__resultMeta">
                        <div>
                          <div className="imageFontSearch__fontTitleRow">
                            <h3>{result.name}</h3>
                            <span>일치율 {result.similarity}%</span>
                          </div>
                          <p>{result.foundry}</p>
                        </div>

                        <dl className="imageFontSearch__stats">
                          <div>
                            <dt>두께</dt>
                            <dd>{result.weight}</dd>
                          </div>
                          <div>
                            <dt>기울기</dt>
                            <dd>{result.slant}</dd>
                          </div>
                          <div>
                            <dt>너비</dt>
                            <dd>{result.category}</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="imageFontSearch__previewCard" style={{ fontFamily: result.previewFamily }}>
                        {result.previewText}
                      </div>
                    </div>

                    <div className="imageFontSearch__actions">
                      <a href={result.demoUrl} className="imageFontSearch__actionButton imageFontSearch__actionButton--ghost">
                        <span aria-hidden="true">◌</span>
                        시연해보기
                      </a>
                      <a
                        href={result.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="imageFontSearch__actionButton imageFontSearch__actionButton--primary"
                      >
                        <span aria-hidden="true">↓</span>
                        Google Fonts에서 다운로드
                      </a>
                    </div>
                  </article>
                ))}
              </div>

              {visibleCount < matchResults.length ? (
                <div className="imageFontSearch__moreWrap">
                  <button
                    type="button"
                    className="imageFontSearch__moreButton"
                    onClick={() => setVisibleCount(matchResults.length)}
                  >
                    결과 더 불러오기
                  </button>
                </div>
              ) : null}
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
