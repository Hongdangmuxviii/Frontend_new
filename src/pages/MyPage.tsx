import Footer from '../components/Footer';
import Header from '../components/Header';
import { fontifyApi } from '../api/fontifyApi';
import { mapDownloadToOwnedFont, mapMeToUserProfile, mapUserStats } from '../api/mappers';
import { useApiResource } from '../hooks/useApiResource';
import type { UserActivityStat } from '../types/user';
import type { UserOwnedFont } from '../types/font';

const fontPlusIconSrc = '/images/my-page/font-card-plus-icon.svg';

function StatCard({ stat }: { stat: UserActivityStat }) {
  const content = (
    <>
      <img
        className={`mypage__statIcon ${
          stat.iconVariant === 'darkOnWhite' ? 'mypage__statIcon--darkOnWhite' : ''
        }`}
        src={stat.iconSrc}
        alt=""
      />
      <div className="mypage__statLabel">{stat.label}</div>
      <div className="mypage__statValue">{stat.value}</div>
    </>
  );

  if (stat.href) {
    return (
      <a className="mypage__statCard mypage__statCard--link" href={stat.href}>
        {content}
      </a>
    );
  }

  return <div className="mypage__statCard">{content}</div>;
}

function FontCard({ font }: { font: UserOwnedFont }) {
  const kindClass = font.kind === '무료' ? 'mypage__fontKind--free' : 'mypage__fontKind--paid';

  return (
    <div className="mypage__fontCard">
      <div className="mypage__fontTop">
        <div className="mypage__fontSample" style={{ fontFamily: font.sampleFontFamily }}>
          {font.title}
        </div>
        <img className="mypage__fontPlus" src={fontPlusIconSrc} alt="" />
      </div>

      <div className="mypage__fontBottom">
        <div className={`mypage__fontKind ${kindClass}`}>{font.kind}</div>
        <div className="mypage__fontName">{font.title}</div>
        <div className="mypage__fontCompany">{font.company}</div>
      </div>
    </div>
  );
}

export default function MyPage() {
  const { data, isLoading, error } = useApiResource(
    {
      profile: {
        name: '',
        joinedDaysLabel: '',
        avatarSrc: '/images/my-page/profile-avatar.png',
      },
      stats: [],
      ownedFonts: [],
    },
    async () => {
      const [me, ratings, generations, downloads] = await Promise.all([
        fontifyApi.getMe(),
        fontifyApi.getMyRatings(),
        fontifyApi.getMyGenerations(),
        fontifyApi.getMyDownloads(),
      ]);

      return {
        profile: mapMeToUserProfile(me),
        stats: mapUserStats({
          ratingsCount: ratings.length,
          generationsCount: generations.length,
          downloadsCount: downloads.length,
        }),
        ownedFonts: downloads.map(mapDownloadToOwnedFont),
      };
    },
    [],
    'my-page',
  );

  return (
    <>
      <Header variant="home" activeNav="my" />

      <main className="main">
        <div className="mypage">
          <section className="mypage__profile">
            <div className="mypage__avatarWrap">
              <img className="mypage__avatar" src={data.profile.avatarSrc} alt="" />
            </div>

            <div className="mypage__name">{isLoading ? '불러오는 중...' : data.profile.name || '사용자'}</div>
            <div className="mypage__sub">
              {error
                ? '마이 페이지 정보를 불러오지 못했습니다.'
                : isLoading
                  ? '계정 정보를 불러오고 있습니다.'
                  : data.profile.joinedDaysLabel}
            </div>

            <button
              className="mypage__editBtn"
              type="button"
              onClick={() => {
                window.location.hash = '#/profile-edit';
              }}
            >
              프로필 수정
            </button>
          </section>

          <section className="mypage__section">
            <h2 className="mypage__sectionTitle">나의 활동</h2>

            <div className="mypage__cards3">
              {data.stats.length > 0 ? data.stats.map((stat) => <StatCard key={stat.id} stat={stat} />) : null}
            </div>
          </section>

          <section className="mypage__section">
            <div className="mypage__viewRow">
              <h2 className="mypage__sectionTitle mypage__sectionTitle--tight">보유 폰트</h2>
              <a className="mypage__viewAll" href="#/selected">
                전체보기
              </a>
            </div>

            <div className="mypage__grid4">
              {data.ownedFonts.map((font) => (
                <FontCard key={font.id} font={font} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
