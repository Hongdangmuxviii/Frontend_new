import { useEffect, useMemo, useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import type { ApiFontFileItem } from '../api/backendTypes';
import { fontifyApi } from '../api/fontifyApi';
import { saveStoredGenerationJob } from '../api/generationStorage';
import {
  getFontFamilyName,
  getFontVariantLabel,
  mapFontFileToEnglishFont,
  mapGenerationCreateResponseToStoredJob,
} from '../api/mappers';
import { useApiResource } from '../hooks/useApiResource';
import { fontFilters, mockEnglishFonts } from '../mocks/englishFonts';
import type { FontFilterKey, FontSortKey, FontViewMode } from '../types/font';

const planeIcon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%2323c3e6' d='M0 185c0-21 14-40 35-46L471 1c27-8 52 17 44 44L377 477c-6 21-25 35-46 35-24 0-45-16-51-39l-59-189L32 236C13 231 0 214 0 193v-8z'/%3E%3Cpath fill='%2336a2e6' d='M221 284l294-239-138 432c-6 21-25 35-46 35-24 0-45-16-51-39l-59-189z'/%3E%3C/svg%3E";

type EnglishFontFamilyCard = {
  id: string;
  familyKey: string;
  familyName: string;
  creator: string;
  previewFamily: string;
  preview: string;
  type: FontFilterKey;
  representativeFont: ApiFontFileItem;
  variants: ApiFontFileItem[];
};

function sortVariants(items: ApiFontFileItem[]) {
  const preferredOrder = ['Regular', 'Medium', 'Book', 'Roman'];
  return [...items].sort((left, right) => {
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

function groupFontsByFamily(items: ApiFontFileItem[]) {
  const groups = new Map<string, ApiFontFileItem[]>();

  items.forEach((item) => {
    const familyKey = getFontFamilyName(item).trim().toLowerCase();
    const current = groups.get(familyKey) ?? [];
    current.push(item);
    groups.set(familyKey, current);
  });

  return Array.from(groups.entries()).map(([familyKey, variants]): EnglishFontFamilyCard => {
    const sortedVariants = sortVariants(variants);
    const representativeFont = sortedVariants[0];
    const representativeCard = mapFontFileToEnglishFont(representativeFont);

    return {
      id: familyKey,
      familyKey,
      familyName: getFontFamilyName(representativeFont),
      creator: representativeCard.creator,
      previewFamily: representativeCard.previewFamily,
      preview: representativeCard.preview,
      type: representativeCard.type,
      representativeFont,
      variants: sortedVariants,
    };
  });
}

function buildMockFamilyCards(): EnglishFontFamilyCard[] {
  return mockEnglishFonts.map((font, index) => {
    const mockFont: ApiFontFileItem = {
      font_file_id: -(index + 1),
      name: font.name,
      file_url: '',
    };

    return {
      id: `mock-${font.id}`,
      familyKey: font.name.trim().toLowerCase(),
      familyName: font.name,
      creator: font.creator,
      previewFamily: font.previewFamily,
      preview: font.preview,
      type: font.type,
      representativeFont: mockFont,
      variants: [mockFont],
    };
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

export default function EnglishFontsPage() {
  const { data: fonts, error } = useApiResource<ApiFontFileItem[]>([], listAllFonts, []);
  const [selectedFilters, setSelectedFilters] = useState<FontFilterKey[]>([]);
  const [sortBy, setSortBy] = useState<FontSortKey>('popular');
  const [page, setPage] = useState(1);
  const [previewInput, setPreviewInput] = useState('');
  const [previewScale, setPreviewScale] = useState(43);
  const [viewMode, setViewMode] = useState<FontViewMode>('grid');
  const [creatingFontId, setCreatingFontId] = useState<string>('');
  const pageSize = 15;

  const familyCards = useMemo(
    () => (error ? buildMockFamilyCards() : groupFontsByFamily(fonts)),
    [error, fonts],
  );

  const filteredFonts = useMemo(() => {
    const next = familyCards.filter((font) =>
      selectedFilters.length === 0 ? true : selectedFilters.includes(font.type),
    );

    return [...next].sort((left, right) =>
      sortBy === 'popular'
        ? left.familyName.localeCompare(right.familyName)
        : right.familyName.localeCompare(left.familyName),
    );
  }, [familyCards, selectedFilters, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredFonts.length / pageSize));
  const visibleFonts = filteredFonts.slice((page - 1) * pageSize, page * pageSize);
  const maxVisiblePageButtons = 5;
  const pageGroupStart = Math.max(
    1,
    Math.min(page - Math.floor(maxVisiblePageButtons / 2), totalPages - maxVisiblePageButtons + 1),
  );
  const pageGroupEnd = Math.min(totalPages, pageGroupStart + maxVisiblePageButtons - 1);
  const pageNumbers = Array.from(
    { length: pageGroupEnd - pageGroupStart + 1 },
    (_, index) => pageGroupStart + index,
  );
  const previewText = previewInput.trim() || 'Font Preview';

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const toggleFilter = (filter: FontFilterKey) => {
    setPage(1);
    setSelectedFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter],
    );
  };

  const toggleViewMode = (nextMode: FontViewMode) => {
    setViewMode(nextMode);
    setSortBy(nextMode === 'grid' ? 'popular' : 'latest');
    setPage(1);
  };

  const handleCreateGeneration = async (card: EnglishFontFamilyCard) => {
    const selectedFont = card.representativeFont;
    const selectedFontId = String(selectedFont.font_file_id);

    try {
      setCreatingFontId(selectedFontId);
      const created = await fontifyApi.createGoogleGeneration(selectedFont.font_file_id);
      const mappedFont = mapFontFileToEnglishFont(selectedFont);
      saveStoredGenerationJob(mapGenerationCreateResponseToStoredJob(created, mappedFont));
      window.location.hash = '#/my-works';
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '생성 요청을 시작하지 못했습니다.';
      window.alert(message);
    } finally {
      setCreatingFontId('');
    }
  };

  return (
    <>
      <Header variant="english-fonts" activeNav="english" />

      <main className="main">
        <section className="englishFonts">
          <div className="englishFonts__inner">
            <aside className="englishFonts__sidebar">
              <div className="englishFonts__sidebarBlock">
                <h2 className="englishFonts__sidebarTitle">FILTER</h2>
                <div className="englishFonts__filterList">
                  {fontFilters.map((filter) => (
                    <label key={filter} className="englishFonts__checkRow">
                      <input
                        type="checkbox"
                        checked={selectedFilters.includes(filter)}
                        onChange={() => toggleFilter(filter)}
                      />
                      <span>{filter}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            <div className="englishFonts__content">
              <div className="englishFonts__head">
                <div className="englishFonts__titleRow">
                  <h1 className="englishFonts__title">영어 폰트 목록</h1>
                  <span className="englishFonts__count">{filteredFonts.length}개</span>
                </div>
              </div>

              <div className="englishFonts__inputBar" aria-label="Font preview input">
                <input
                  className="englishFonts__inputField"
                  type="text"
                  value={previewInput}
                  onChange={(event) => setPreviewInput(event.target.value)}
                  placeholder="원하는 영어 문구를 미리 써보세요"
                />

                <div className="englishFonts__inputTools">
                  <div className="englishFonts__inputDivider" aria-hidden="true" />
                  <span className="englishFonts__inputScale" aria-hidden="true">
                    <span className="englishFonts__inputScaleSmall">A</span>
                    <span className="englishFonts__inputScaleLarge">A</span>
                  </span>
                  <div className="englishFonts__sliderWrap">
                    <input
                      className="englishFonts__slider"
                      type="range"
                      min="0"
                      max="100"
                      value={previewScale}
                      onChange={(event) => setPreviewScale(Number(event.target.value))}
                      aria-label="Preview size"
                    />
                  </div>
                  <button
                    type="button"
                    className={
                      viewMode === 'grid'
                        ? 'englishFonts__viewToggle englishFonts__viewToggle--active'
                        : 'englishFonts__viewToggle'
                    }
                    onClick={() => toggleViewMode('grid')}
                    aria-label="세로형 보기"
                  >
                    <span className="englishFonts__iconGrid" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                      <span />
                    </span>
                  </button>
                  <button
                    type="button"
                    className={
                      viewMode === 'list'
                        ? 'englishFonts__viewToggle englishFonts__viewToggle--active'
                        : 'englishFonts__viewToggle'
                    }
                    onClick={() => toggleViewMode('list')}
                    aria-label="가로형 보기"
                  >
                    <span className="englishFonts__iconList" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                  </button>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="englishFonts__grid">
                  {visibleFonts.map((font) => (
                    <a
                      key={font.id}
                      className="englishFonts__card"
                      href={`#/english-detail?family=${encodeURIComponent(font.familyKey)}`}
                    >
                      <div
                        className="englishFonts__preview"
                        style={{
                          fontFamily: font.previewFamily,
                          fontSize: `${18 + previewScale * 0.18}px`,
                        }}
                      >
                        {previewText}
                      </div>

                      <div className="englishFonts__cardFooter">
                        <div>
                          <strong className="englishFonts__fontName">{font.familyName}</strong>
                          <p className="englishFonts__fontMeta">{font.variants.length} variants</p>
                        </div>
                        <img
                          className="englishFonts__planeIcon"
                          src={planeIcon}
                          alt=""
                          aria-hidden="true"
                        />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="englishFonts__list">
                  {visibleFonts.map((font) => (
                    <div key={font.id} className="englishFonts__listCard">
                      <div className="englishFonts__listMeta">
                        <strong className="englishFonts__listName">{font.familyName}</strong>
                        <p className="englishFonts__listCreator">
                          {font.variants.map((variant) => getFontVariantLabel(variant)).join(', ')}
                        </p>
                      </div>

                      <div className="englishFonts__listPreviewWrap">
                        <div
                          className="englishFonts__listPreview"
                          style={{
                            fontFamily: font.previewFamily,
                            fontSize: `${18 + previewScale * 0.18}px`,
                          }}
                        >
                          {previewText}
                        </div>
                      </div>

                      <div className="englishFonts__listActions">
                        <a
                          className="englishFonts__actionBtn englishFonts__actionBtn--ghost"
                          href={`#/english-detail?family=${encodeURIComponent(font.familyKey)}`}
                        >
                          상세 페이지
                        </a>
                        <button
                          type="button"
                          className="englishFonts__actionBtn englishFonts__actionBtn--primary"
                          onClick={() => handleCreateGeneration(font)}
                          disabled={creatingFontId === String(font.representativeFont.font_file_id)}
                        >
                          {creatingFontId === String(font.representativeFont.font_file_id)
                            ? '요청 중...'
                            : '변환하기'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="englishFonts__pagination">
                <button
                  type="button"
                  className="englishFonts__pageBtn"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  {'<<'}
                </button>
                <button
                  type="button"
                  className="englishFonts__pageBtn"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                >
                  {'<'}
                </button>
                {pageNumbers.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={
                      value === page
                        ? 'englishFonts__pageBtn englishFonts__pageBtn--active'
                        : 'englishFonts__pageBtn'
                    }
                    onClick={() => setPage(value)}
                  >
                    {value}
                  </button>
                ))}
                <button
                  type="button"
                  className="englishFonts__pageBtn"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                >
                  {'>'}
                </button>
                <button
                  type="button"
                  className="englishFonts__pageBtn"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                >
                  {'>>'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
