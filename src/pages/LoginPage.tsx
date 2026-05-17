export default function LoginPage() {
  return (
    <div className="figmaLogin">
      <a className="figmaLogin__backHome" href="#/">
        ← 홈으로 돌아가기
      </a>

      <main className="figmaLogin__main">
        <section className="figmaLogin__left">
          <span className="figmaLogin__eyebrow">SIGNATURE EDITORIAL</span>
          <h1 className="figmaLogin__title">
            <span className="figmaLogin__titleMorph" aria-label="we are fontify 안녕하세요 폰티파이입니다">
              <span className="figmaLogin__titleLayer figmaLogin__titleLayer--en">
                Hi.
                <br />
                we are fontify
              </span>
              <span className="figmaLogin__titleLayer figmaLogin__titleLayer--ko">
                안녕하세요
                <br />
                폰티파이입니다.
              </span>
              <span className="figmaLogin__titleShine" aria-hidden="true" />
            </span>
          </h1>
          <p className="figmaLogin__desc">
            오픈소스 영문 글꼴을 한글 디자인으로 만들거나,
            <br />
            새로운 필체를 등록해 나만의 글꼴로 만들어 보세요.
          </p>
          <div className="figmaLogin__dots" aria-hidden="true">
            <span className="is-active" />
            <span />
            <span />
          </div>
        </section>

        <section className="figmaLogin__right">
          <div className="figmaLogin__texture" aria-hidden="true">
            <span>TYPOGRAPHY CREATIVE</span>
            <span>FONTIFY YOUR STORY</span>
            <span>MODERN EDITORIAL</span>
            <span>DESIGN SYSTEM FONT</span>
          </div>
          <div className="figmaLogin__blur figmaLogin__blur--a" aria-hidden="true" />
          <div className="figmaLogin__blur figmaLogin__blur--b" aria-hidden="true" />

          <article className="figmaLogin__card" aria-label="로그인 카드">
            <h2>환영합니다</h2>
            <p>
              구글 로그인을 통해
              <br />
              Fontify의 서비스를 이용하실 수 있습니다
            </p>
            <button className="figmaLogin__googleButton" type="button">
              <span className="figmaLogin__googleIcon" aria-hidden="true">
                G
              </span>
              Continue with Google
            </button>
            <div className="figmaLogin__divider" aria-hidden="true" />
            <form className="figmaLogin__newsletter">
              <label htmlFor="newsletter-email">Fontify 뉴스레터</label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                placeholder="이메일 주소를 입력하세요"
                autoComplete="email"
              />
              <button className="figmaLogin__newsletterButton" type="submit">
                Fontify 뉴스레터 받아보기
              </button>
            </form>
          </article>

          <p className="figmaLogin__terms">
            BY SIGNING IN, YOU AGREE TO OUR TERMS OF SERVICE
            <br />
            AND PRIVACY POLICY.
          </p>
        </section>
      </main>

      <footer className="figmaLogin__footer">
        <div>
          <strong>Fontify</strong>
          <p>© 2024 Fontify. Crafted for the Editorial Script.</p>
        </div>
        <nav aria-label="푸터 메뉴">
          <a href="#">PRIVACY</a>
          <a href="#">TERMS</a>
          <a href="#">SUPPORT</a>
          <a href="#">TWITTER</a>
        </nav>
      </footer>
    </div>
  );
}
