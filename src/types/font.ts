export type HomeFontCardData = {
  id: string;
  name: string;
  source: string;
  sample: string;
  fontFamily: string;
  description: string;
  attribution?: string;
  previewGlyph?: string;
  previewGlyphSecondary?: string;
  previewDisplay?: string;
  sampleScale?: 'default' | 'large';
  visualVariant?: 'paper' | 'sunrise' | 'mist' | 'gradient';
  quoteLines?: string[];
};

export type UserFontKind = '무료' | '유료';

export type UserOwnedFont = {
  id: string;
  title: string;
  kind: UserFontKind;
  company: string;
  sampleFontFamily?: string;
};

export type FontFilterKey = 'Serif' | 'Sans Serif' | 'Handwriting' | 'Display';
export type FontSortKey = 'popular' | 'latest';
export type FontViewMode = 'grid' | 'list';
export type FontKeywordKey =
  | '동글동글'
  | '사무적인'
  | '보고서'
  | '날려쓰는'
  | '게임틱한'
  | '문서';

export type EnglishFontCard = {
  id: string;
  name: string;
  creator: string;
  previewFamily: string;
  type: FontFilterKey;
  preview: string;
  tags: FontKeywordKey[];
};

export type TagTone = 'pink' | 'blue' | 'green' | 'purple' | 'yellow' | 'gray';

export type TopFont = {
  id: string;
  rank: number;
  preview: string;
  previewBackground: string;
  title: string;
  creator: string;
  tags: { label: string; tone: TagTone }[];
  likes: number;
  downloaded?: boolean;
};
