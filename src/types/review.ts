export type PendingReviewFont = {
  id: string;
  label: string;
  name: string;
  tone: 'primary' | 'soft';
  mark: 'quote' | 'lines';
};

export type ReviewCard = {
  id: string;
  title: string;
  rating: number;
  sample: string;
  sampleClass?: string;
  body: string;
  date: string;
  featured?: boolean;
};

export type ReviewImpact = {
  reachedDesigners: number;
  avatarLabels: string[];
  growthLabel: string;
};

export type FeaturedReview = {
  fontName: string;
  label: string;
  title: string;
};
