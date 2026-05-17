export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__brandCol">
          <div className="footer__brand">
            <img
              className="footer__logoImg"
              src="/images/brand/fontify-logo.png"
              alt="Fontify logo"
            />
          </div>

          <p className="footer__tagline">
            모든 프로젝트를 위한 완벽한 폰트
            <br />
            를 찾아보세요.
            <br />
            한글과 영문 폰트의 조화로운 발견.
          </p>

          <div className="social" aria-label="소셜 링크">
            <a className="social__btn" href="#" aria-label="Social 1" />
            <a className="social__btn" href="#" aria-label="Social 2" />
            <a className="social__btn" href="#" aria-label="Social 3" />
          </div>
        </div>

        <div className="footer__col">
          <div className="footer__head">Company</div>
          <a className="footer__link" href="#">
            About Service
          </a>
          <a className="footer__link" href="#">
            Settings
          </a>
          <a className="footer__link" href="#">
            Careers
          </a>
        </div>

        <div className="footer__col">
          <div className="footer__head">Support</div>
          <a className="footer__link" href="#">
            Help Center
          </a>
          <a className="footer__link" href="#">
            Terms of Service
          </a>
          <a className="footer__link" href="#">
            Privacy Policy
          </a>
        </div>

        <div className="footer__col">
          <div className="footer__head">Legal</div>
          <a className="footer__link" href="#">
            Copyright Information
          </a>
          <a className="footer__link" href="#">
            Licensing
          </a>
        </div>
      </div>

      <div className="container footer__bottom">
        <div className="footer__addr">
          서울특별시 강남구 테헤란로 123, 폰티파이 빌딩 4층
          <br />
          Contact: support@fontify.com | +82 2-1234-5678
        </div>
        <div className="footer__copy">© 2023 Fontify. All rights reserved.</div>
      </div>
    </footer>
  );
}

