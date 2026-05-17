import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HandwritingPage() {
  return (
    <>
      <Header variant="handwriting" />

      <main className="main">
        <section className="container section handwriting">
          {/* Hero: 메인 헤드라인/서브카피 수정 지점 */}
          <div className="handwriting__hero">
            <h1 className="handwriting__title">
              <span>나만의 손글씨로</span>
              <span className="handwriting__titleAccent">세상에 하나뿐인 폰트를 만드세요</span>
            </h1>
            <p className="handwriting__desc">
              단 한 장의 양식지로 AI가 당신의 고유한 필체를 정밀 분석하여 <br />어디서든 사용할 수 있는
              고품질 디지털 폰트를 제작해 드립니다.
            </p>
          </div>

          {/* 3단계 프로세스 카드: 아이콘/문구/버튼 수정 지점 */}
          <section className="handwritingSteps">
            <article className="stepCard">
              <div className="stepCard__icon stepCard__icon--download" aria-hidden="true">⭳</div>
              <h2>01. 양식 다운로드</h2>
              <p>폰트 제작을 위한 전용 손글씨 가이드 라인이 포함된<br /> A4 양식지를 다운로드하세요.</p>
              <div className="stepCard__panel stepCard__panel--row">
                <span className="stepCard__badge">handwriting_form.pdf</span>
                <span className="stepCard__sub">Standard A4 Layout PDF</span>
              </div>
              <button className="stepCard__btn" type="button">
                양식지 받기
              </button>
            </article>

            <article className="stepCard">
              <div className="stepCard__icon stepCard__icon--write" aria-hidden="true">✎</div>
              <h2>02. 작성 및 업로드</h2>
              <p>정성껏 작성한 양식을 깨끗하게 촬영하거나 스캔하여 <br />이미지 파일로 업로드합니다.</p>
              <div className="stepCard__panel stepCard__panel--drop">이미지 업로드</div>
              <button className="stepCard__btn stepCard__btn--ghost" type="button">
                파일 업로드하기
              </button>
            </article>

            <article className="stepCard">
              <div className="stepCard__icon stepCard__icon--spark" aria-hidden="true">✦</div>
              <h2>03. AI 분석 및 생성</h2>
              <p>AI가 실시간으로 필체 특징을 학습하고 벡터화하여<br /> 디지털 폰트를 완성합니다.</p>
              <div className="stepCard__panel stepCard__panel--preview" aria-label="empty preview panel" />
            </article>
          </section>

          {/* 생성 폰트 미리보기 섹션: 대형 카드/소형 카드/하단 배너 수정 지점 */}
          <section className="handwritingPreviewSection">
            <div className="handwritingPreviewSection__head">
              <h2>최근 생성된 폰트 라이브러리</h2>
              <a href="#">전체 보기 →</a>
            </div>

            <div className="previewLayout">
              <article className="previewLayout__large">
                <div className="previewCard__top">
                  <div>
                    <span className="previewCard__label">대표 문장</span>
                    <h3>윤동주의 하늘과 바람과 별</h3>
                  </div>
                  <button type="button" aria-label="more">
                    ♡
                  </button>
                </div>
                <p className="previewCard__quote">죽는 날까지 하늘을 우러러 한 점 부끄럼이 없기를</p>
                <div className="previewCard__footer">
                  <span>제작자: 홍길동</span>
                  <span className="previewCard__dot" />
                  <span>12.4k Downloads</span>
                  <button type="button">TTF 다운로드</button>
                </div>
              </article>

              <div className="previewLayout__side">
                <article className="previewSmallCard">
                  <h4>감자꽃 필 무렵</h4>
                  <p>우리집 강아지는 복…</p>
                  <button type="button" aria-label="open">↯</button>
                </article>
                <article className="previewSmallCard">
                  <h4>여름밤의 멜로디</h4>
                  <p>반짝이는 별빛 아래 …</p>
                  <button type="button" aria-label="open">↯</button>
                </article>
              </div>
            </div>

            <article className="handwritingBanner">
              <div>
                <h3>폰트가 잘 만들어졌을까요?</h3>
                <p>지금 바로 라이브 에디터에서 직접 문장을 입력해보고 필체를 확인해 보세요.</p>
              </div>
              <button type="button">라이브 에디터 체험하기</button>
            </article>
          </section>
        </section>
      </main>

      <Footer />
    </>
  );
}
