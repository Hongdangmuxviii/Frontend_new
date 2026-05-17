export type UserProfile = {
  name: string;
  joinedDaysLabel: string;
  avatarSrc: string;
};

export type UserActivityStat = {
  id: string;
  label: string;
  value: string;
  iconSrc: string;
  iconVariant?: 'default' | 'darkOnWhite';
  href?: string;
};
