import { useEffect, useId, useState, type ChangeEvent } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';

const defaultAvatarSrc = '/images/my-page/profile-avatar.png';

export default function ProfileEditPage() {
  const [displayName, setDisplayName] = useState('폰티파이님');
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [avatarSrc, setAvatarSrc] = useState(defaultAvatarSrc);
  const [avatarObjectUrl, setAvatarObjectUrl] = useState<string | null>(null);
  const fileInputId = useId();

  useEffect(() => {
    return () => {
      if (avatarObjectUrl) {
        URL.revokeObjectURL(avatarObjectUrl);
      }
    };
  }, [avatarObjectUrl]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (avatarObjectUrl) {
      URL.revokeObjectURL(avatarObjectUrl);
    }

    const nextObjectUrl = URL.createObjectURL(file);
    setAvatarObjectUrl(nextObjectUrl);
    setAvatarSrc(nextObjectUrl);
  };

  return (
    <>
      <Header variant="home" activeNav="my" />

      <main className="main">
        <div className="profileEdit">
          <section className="profileEdit__card">
            <h1 className="profileEdit__title">프로필 수정</h1>

            <div className="profileEdit__avatarSection">
              <div className="profileEdit__avatarWrap">
                <img className="profileEdit__avatar" src={avatarSrc} alt="프로필 사진" />
              </div>

              <label className="profileEdit__avatarButton" htmlFor={fileInputId}>
                <span className="profileEdit__avatarIcon" aria-hidden="true">
                  ⊙
                </span>
              </label>

              <input
                id={fileInputId}
                className="profileEdit__photoInput"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="profileEdit__form">
              <label className="profileEdit__field">
                <span className="profileEdit__label">닉네임 변경</span>
                <input
                  className="profileEdit__input"
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </label>

              <label className="profileEdit__field">
                <span className="profileEdit__label">연동된 구글 이메일</span>
                <input
                  className="profileEdit__input profileEdit__input--readonly"
                  type="email"
                  value="conniefollow@tukorea.ac.kr"
                  readOnly
                  aria-readonly="true"
                />
              </label>

              <div className="profileEdit__consentRow">
                <div className="profileEdit__consentText">
                  <strong className="profileEdit__consentTitle">이메일 수신 동의</strong>
                  <p className="profileEdit__consentDesc">이벤트 및 혜택 정보를 이메일로 받으시겠습니까?</p>
                </div>

                <button
                  className={`profileEdit__switch ${
                    marketingOptIn ? 'profileEdit__switch--on' : ''
                  }`}
                  type="button"
                  aria-pressed={marketingOptIn}
                  onClick={() => setMarketingOptIn((current) => !current)}
                >
                  <span className="profileEdit__switchThumb" />
                </button>
              </div>

              <div className="profileEdit__actions">
                <a className="profileEdit__btn profileEdit__btn--ghost" href="#/my-page">
                  취소
                </a>
                <button className="profileEdit__btn profileEdit__btn--primary" type="button">
                  저장하기
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
