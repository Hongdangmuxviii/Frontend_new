import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { resolveApiAssetUrl } from '../api/client';
import type { ApiFontFileItem } from '../api/backendTypes';
import { fontifyApi } from '../api/fontifyApi';
import { saveStoredGenerationJob } from '../api/generationStorage';
import {
  getFontAssetPath,
  getFontDisplayName,
  getFontFamilyName,
  getFontVariantLabel,
  mapFontFileToEnglishFont,
  mapGenerationCreateResponseToStoredJob,
} from '../api/mappers';
import { useApiResource } from '../hooks/useApiResource';

const fallbackFont: ApiFontFileItem = {
  font_file_id: 0,
  name: 'Font Preview',
  file_url: '',
};

type DetailRouteParams = {
  family: string;
  fontId: string;
  fontName: string;
};

type DetailPageData = {
  selectedFont: ApiFontFileItem | null;
  variants: ApiFontFileItem[];
};

function readDetailParamsFromHash(): DetailRouteParams {
  const hash = window.location.hash || '';
  const queryIndex = hash.indexOf('?');
  if (queryIndex < 0) return { family: '', fontId: '', fontName: '' };
  const params = new URLSearchParams(hash.slice(queryIndex + 1));
  return {
    family: params.get('family') ?? '',
    fontId: params.get('fontId') ?? '',
    fontName: params.get('fontName') ?? '',
  };
}

function sortVariants(items: ApiFontFileItem[], selectedFontId?: number) {
  const preferredOrder = ['Regular', 'Medium', 'Book', 'Roman'];
  return [...items].sort((left, right) => {
    if (selectedFontId) {
      if (left.font_file_id === selectedFontId) return -1;
      if (right.font_file_id === selectedFontId) return 1;
    }

    const leftVariant = getFontVariantLabel(left);
    const rightVariant = getFontVariantLabel(right);
    const leftPriority = preferredOrder.indexOf(leftVariant);
    const rightPriority = preferredOrder.indexOf(rightVariant);

    if (leftPriority !== -1 || rightPriority !== -1) {
      const normalizedLeft = leftPriority === -1 ? Number.MAX_SAFE_INTEGER : leftPriority;
      const normalizedRight = rightPriority === -1 ? Number.MAX_SAFE_INTEGER : rightPriority;
      if (normalizedLeft !== normalizedRight) return normalizedLeft - normalizedRight;
    }

    return leftVariant.localeCompare(rightVariant);
  });
}

async function listAllFonts() {
  const apiPageSize = 100;
  const allItems: ApiFontFileItem[] = [];
  const seenIds = new Set<number>();
  const maxPages = 20;
  let currentPage = 1;

  while (currentPage <= maxPages) {
    const items = await fontifyApi.listFonts({ page: currentPage, limit: apiPageSize });
    const uniqueItems = items.filter((item) => {
      if (seenIds.has(item.font_file_id)) return false;
      seenIds.add(item.font_file_id);
      return true;
    });

    allItems.push(...uniqueItems);

    if (items.length < apiPageSize || uniqueItems.length === 0) break;
    currentPage += 1;
  }

  return allItems;
}

export default function EnglishDetailPage() {
  const [inputText, setInputText] = useState('');
  const [routeParams, setRouteParams] = useState<DetailRouteParams>(() => readDetailParamsFromHash());
  const [creatingFontId, setCreatingFontId] = useState<string>('');
  const [loadedPreviewFamilies, setLoadedPreviewFamilies] = useState<Record<number, string>>({});
  const [previewScale, setPreviewScale] = useState(40);

  useEffect(() => {
    const handleHashChange = () => {
      setRouteParams(readDetailParamsFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const { family, fontId, fontName } = routeParams;

  const { data, isLoading, error } = useApiResource<DetailPageData>(
    { selectedFont: family || fontId || fontName ? fallbackFont : null, variants: [] },
    async () => {
      const items = await listAllFonts();

      if (family) {
        const normalizedFamily = family.trim().toLowerCase();
        const variants = items.filter(
          (item) => getFontFamilyName(item).trim().toLowerCase() === normalizedFamily,
        );
        return {
          selectedFont: variants[0] ?? null,
          variants: sortVariants(variants),
        };
      }

      if (fontId) {
        const numericFontId = Number(fontId);
        const selectedFont =
          items.find((item) => item.font_file_id === numericFontId) ??
          (await fontifyApi.getFont(fontId).catch(() => null));
        const variants = selectedFont
          ? items.filter(
              (item) =>
                getFontFamilyName(item).trim().toLowerCase() ===
                getFontFamilyName(selectedFont).trim().toLowerCase(),
            )
          : [];
        return {
          selectedFont,
          variants: sortVariants(variants.length > 0 ? variants : selectedFont ? [selectedFont] : [], selectedFont?.font_file_id),
        };
      }

      if (!fontName) return { selectedFont: null, variants: [] };

      const normalizedTarget = fontName.trim().toLowerCase();
      const selectedFont =
        items.find((item) => getFontDisplayName(item).trim().toLowerCase() === normalizedTarget) ??
        null;
      const variants = selectedFont
        ? items.filter(
            (item) =>
              getFontFamilyName(item).trim().toLowerCase() ===
              getFontFamilyName(selectedFont).trim().toLowerCase(),
          )
        : [];
      return {
        selectedFont,
        variants: sortVariants(variants, selectedFont?.font_file_id),
      };
    },
    [family, fontId, fontName],
  );

  const selectedFont = data.selectedFont;
  const variants = data.variants;
  const familyName = getFontFamilyName(selectedFont);

  useEffect(() => {
    setLoadedPreviewFamilies({});

    if (variants.length === 0 || typeof FontFace === 'undefined' || !document.fonts) {
      return;
    }

    let cancelled = false;
    const fontFaces: FontFace[] = [];

    Promise.allSettled(
      variants.map(async (variant) => {
        const sourceUrl = resolveApiAssetUrl(getFontAssetPath(variant));
        if (!sourceUrl) return null;
        const previewFamily = `fontify-preview-${variant.font_file_id}`;
        const fontFace = new FontFace(previewFamily, `url(${JSON.stringify(sourceUrl)})`);
        const loadedFontFace = await fontFace.load();
        if (cancelled) return null;
        document.fonts.add(loadedFontFace);
        fontFaces.push(loadedFontFace);
        return { fontFileId: variant.font_file_id, previewFamily };
      }),
    ).then((results) => {
      if (cancelled) return;
      const nextFamilies: Record<number, string> = {};
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          nextFamilies[result.value.fontFileId] = result.value.previewFamily;
        }
      });
      setLoadedPreviewFamilies(nextFamilies);
    });

    return () => {
      cancelled = true;
      fontFaces.forEach((fontFace) => {
        try {
          document.fonts.delete(fontFace);
        } catch {
          // Ignore cleanup failures from browsers that keep the face internally.
        }
      });
    };
  }, [variants]);

  const sampleText = inputText || 'Type here to preview text hello~!';
  const previewFontSize = `${18 + previewScale * 0.18}px`;

  const handleCreateGeneration = async (targetFont: ApiFontFileItem) => {
    const selectedId = String(targetFont.font_file_id);

    try {
      setCreatingFontId(selectedId);
      const created = await fontifyApi.createGoogleGeneration(targetFont.font_file_id);
      const mappedFont = mapFontFileToEnglishFont(targetFont);
      saveStoredGenerationJob(mapGenerationCreateResponseToStoredJob(created, mappedFont));
      window.location.hash = '#/my-works';
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : '생성 요청을 시작하지 못했습니다.';
      window.alert(message);
    } finally {
      setCreatingFontId('');
    }
  };

  return (
    <>
      <Header variant="english-detail" activeNav="english" />

      <main className="main">
        <section className="container eng-detail">
          <header className="eng-detail__head">
            <div>
              <p className="eng-detail__eyebrow">English Font</p>
              <h1 className="eng-detail__title">{familyName || 'Select a font'}</h1>
            </div>

            <div className="eng-detail__mainActions">
              <button className="btn eng-detail__badge" type="button">
                {selectedFont ? `${variants.length} variants` : 'No font selected'}
              </button>
              <a
                className="btn btn--ghost btn--sm"
                href={resolveApiAssetUrl(getFontAssetPath(selectedFont))}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!getFontAssetPath(selectedFont)}
              >
                Source file
              </a>
              <button
                className="btn btn--ghost btn--sm eng-detail__primary"
                type="button"
                onClick={() => selectedFont && handleCreateGeneration(selectedFont)}
                disabled={!selectedFont || creatingFontId !== ''}
              >
                {creatingFontId ? 'Starting...' : 'Generate font'}
              </button>
            </div>
          </header>

          {!family && !fontId && !fontName ? (
            <section className="eng-detail__notice">
              <header className="eng-detail__noticeHead">
                <span className="eng-detail__noticeIcon" aria-hidden="true" />
                <h2>No font selected</h2>
              </header>
              <p>Open this page from the font list so it can receive a font family.</p>
            </section>
          ) : null}

          {!isLoading && !error && !selectedFont ? (
            <section className="eng-detail__notice">
              <header className="eng-detail__noticeHead">
                <span className="eng-detail__noticeIcon" aria-hidden="true" />
                <h2>Font not found</h2>
              </header>
              <p>The selected font family could not be matched with the backend font list.</p>
            </section>
          ) : null}

          {error ? (
            <section className="eng-detail__notice">
              <header className="eng-detail__noticeHead">
                <span className="eng-detail__noticeIcon" aria-hidden="true" />
                <h2>Failed to load font</h2>
              </header>
              <p>{error}</p>
            </section>
          ) : null}

          <section className="eng-detail__input">
            <div className="eng-detail__inputTop">
              <input
                className="eng-detail__inputField"
                placeholder="Type here to preview the selected font"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <div className="eng-detail__inputControls" aria-hidden="true">
                <span className="eng-detail__aa">
                  A<span className="eng-detail__aa--big">A</span>
                </span>

                <input
                  className="eng-detail__slider"
                  type="range"
                  min="0"
                  max="100"
                  value={previewScale}
                  onChange={(event) => setPreviewScale(Number(event.target.value))}
                  aria-label="Preview size"
                />

                <button className="eng-detail__alignBtn" type="button" aria-label="Change align" />
              </div>
            </div>
          </section>

          <section className="eng-detail__list">
            {isLoading ? (
              <article className="eng-row">
                <div className="eng-row__meta">
                  <span className="eng-row__name">Loading...</span>
                </div>
                <p className="eng-row__sample">{sampleText}</p>
              </article>
            ) : null}

            {!isLoading
              ? variants.map((variant) => (
                  <article className="eng-row" key={variant.font_file_id}>
                    <div className="eng-row__meta">
                      <span className="eng-row__name">{getFontVariantLabel(variant)}</span>
                    </div>
                    <p
                      className="eng-row__sample"
                      style={{
                        fontFamily: loadedPreviewFamilies[variant.font_file_id]
                          ? `"${loadedPreviewFamilies[variant.font_file_id]}", Pretendard, sans-serif`
                          : `${getFontDisplayName(variant)}, Pretendard, sans-serif`,
                        fontSize: previewFontSize,
                      }}
                    >
                      {sampleText}
                    </p>
                    <button
                      className="eng-row__action"
                      type="button"
                      onClick={() => handleCreateGeneration(variant)}
                      disabled={creatingFontId !== ''}
                    >
                      {creatingFontId === String(variant.font_file_id) ? 'Generating...' : 'Generate'}
                    </button>
                  </article>
                ))
              : null}
          </section>
        </section>
      </main>

      <Footer />
    </>
  );
}
