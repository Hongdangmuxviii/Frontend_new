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
    slant: '0도',
    category: '산세리프',
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
    slant: '0도',
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
    foundry: 'Fontify sample match',
    similarity: 81,
    weight: '중간',
    slant: '2도',
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
    desc: '글자의 굵기, 기울기, 자폭, 세리프 특징을 분석합니다.',
    icon: 'scan',
  },
  {
    title: 'Google Fonts 매칭',
    desc: '라이브러리에서 가장 유사한 서체를 추천합니다.',
    icon: 'match',
  },
] as const;

function ProcessIcon({ type }: { type: (typeof processSteps)[number]['icon'] }) {
  if (type === 'image') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="3" />
        <path d="M7 15.5l3.2-3.2 2.4 2.4 2.2-2.2L17 15.5" />
        <circle cx="9" cy="9" r="1.2" />
      </svg>
    );
  }

  if (type === 'scan') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 7V5.8A1.8 1.8 0 0 1 7.8 4h8.4A1.8 1.8 0 0 1 18 5.8V7" />
        <path d="M6 17v1.2A1.8 1.8 0 0 0 7.8 20h8.4a1.8 1.8 0 0 0 1.8-1.8V17" />
        <path d="M5 12h14" />
        <path d="M9 15l3-7 3 7" />
        <path d="M10.2 12.2h3.6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="M15 15l4 4" />
      <path d="M8.1 10.7l1.7 1.7 3.3-3.6" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15V8" />
      <path d="M8.8 11.2 12 8l3.2 3.2" />
      <rect x="5" y="4" width="14" height="16" rx="3" />
      <path d="M8 18h8" />
    </svg>
  );
}

function ActionIcon({ type }: { type: 'preview' | 'external' }) {
  if (type === 'preview') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M3.5 12s3.2-5 8.5-5 8.5 5 8.5 5-3.2 5-8.5 5-8.5-5-8.5-5Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 7H6.8A1.8 1.8 0 0 0 5 8.8v8.4A1.8 1.8 0 0 0 6.8 19h8.4a1.8 1.8 0 0 0 1.8-1.8V16" />
      <path d="M13 5h6v6" />
      <path d="M11 13 19 5" />
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

  const visibleResults = useMemo(() => matchResults.slice(0, visibleCount), [visibleCount]);

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
                업로드한 이미지에서 서체 특징을 분석하여 <strong>Google Fonts 라이브러리</strong>에서
                <br />
                가장 유사한 무료 영문 폰트를 찾아드립니다.
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
                  <UploadIcon />
                </div>
                <h2>찾고 싶은 폰트 이미지를 업로드하세요</h2>
                <p>JPG, PNG, WEBP 최대 10MB</p>
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
                            <dt>자획</dt>
                            <dd>{result.weight}</dd>
                          </div>
                          <div>
                            <dt>기울기</dt>
                            <dd>{result.slant}</dd>
                          </div>
                          <div>
                            <dt>분류</dt>
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
                        <ActionIcon type="preview" />
                        시연해보기
                      </a>
                      <a
                        href={result.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="imageFontSearch__actionButton imageFontSearch__actionButton--primary"
                      >
                        <ActionIcon type="external" />
                        Google Fonts에서 열기
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
