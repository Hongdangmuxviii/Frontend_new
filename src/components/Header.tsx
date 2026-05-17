type HeaderProps = {
  activeNav?: 'popular' | 'english' | 'my' | 'none';
  variant?: 'home' | 'english-detail' | 'selected' | 'top10' | 'english-fonts' | 'handwriting';
};

export default function Header({
  activeNav = 'none',
  variant = 'home',
}: HeaderProps) {
  const logoSrc =
    variant === 'handwriting'
      ? '/images/brand/fontify-handwriting-logo.png'
      : '/images/brand/fontify-logo-hd.png';

  const popularLinkClass =
    activeNav === 'popular' ? 'nav__link nav__link--active' : 'nav__link';
  const englishLinkClass =
    activeNav === 'english' ? 'nav__link nav__link--active' : 'nav__link';
  const myLinkClass =
    activeNav === 'my'
      ? 'nav__link nav__link--active'
      : 'nav__link nav__link--muted';

  return (
    <header className="header">
      <div className="container header__top">
        <a className="brand" href="#/">
          <img
            className={`brand__logoImg ${variant === 'handwriting' ? 'brand__logoImg--handwriting' : ''}`}
            src={logoSrc}
            alt="Fontify logo"
          />
        </a>

        <div className="search">
          <input className="search__input" placeholder="폰트명, 키워드로 폰트 검색" />
          <button className="search__icon" aria-label="검색" />
        </div>

        <a className="btn btn--outline" href="#/login">
          <span className="btn__icon" aria-hidden="true" />
          로그인
        </a>
      </div>

      <nav className="container header__nav">
        <div className="nav">
          <a className={popularLinkClass} href="#/top10">
            인기 폰트(다운로드 순)
          </a>
          <a className={englishLinkClass} href="#/english-fonts">
            영어 폰트
          </a>
          <a className="nav__link" href="#/handwriting">
            손글씨
          </a>
        </div>

        <a className={myLinkClass} href="#/my-page">
          마이 폰트
        </a>
      </nav>
    </header>
  );
}
