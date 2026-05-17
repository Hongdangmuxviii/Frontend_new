import { useEffect, useMemo, useState } from 'react';
import HomePage from './pages/HomePage';
import EnglishDetailPage from './pages/EnglishDetailPage';
import SelectedPage from './pages/SelectedPage';
import MyPage from './pages/MyPage';
import HandwritingPage from './pages/HandwritingPage';
import LoginPage from './pages/LoginPage';
import ReviewPage from './pages/ReviewPage';
import ProfileEditPage from './pages/ProfileEditPage';
import Top10Page from './pages/Top10Page';
import EnglishFontsPage from './pages/EnglishFontsPage';
import MyWorksPage from './pages/MyWorksPage';
import ImageFontSearchPage from './pages/ImageFontSearchPage';

type Route =
  | 'home'
  | 'english-detail'
  | 'selected'
  | 'my-page'
  | 'handwriting'
  | 'login'
  | 'reviews'
  | 'profile-edit'
  | 'top10'
  | 'english-fonts'
  | 'my-works'
  | 'image-font-search';

function routeFromHash(hash: string): Route {
  const normalized = (hash || '').trim();
  if (!normalized || normalized === '#' || normalized === '#/') return 'home';

  // Route format: "#/english-detail" | "#/selected" | "#/my-page"
  if (normalized.startsWith('#/')) {
    const path = normalized
      .slice(2)
      .split('#')[0]
      .split('?')[0]; // strip "#/...", query string, and any extra fragment
    if (path === '' || path === '/') return 'home';
    if (path === 'english-detail') return 'english-detail';
    if (path === 'selected') return 'selected';
    if (path === 'my-page') return 'my-page';
    if (path === 'handwriting') return 'handwriting';
    if (path === 'login') return 'login';
    if (path === 'reviews') return 'reviews';
    if (path === 'profile-edit') return 'profile-edit';
    if (path === 'top10') return 'top10';
    if (path === 'english-fonts') return 'english-fonts';
    if (path === 'my-works') return 'my-works';
    if (path === 'image-font-search') return 'image-font-search';
    return 'home';
  }

  // In-page anchors (e.g. "#popular") should still show Home.
  return 'home';
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => routeFromHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const page = useMemo(() => {
    if (route === 'english-detail') return <EnglishDetailPage />;
    if (route === 'selected') return <SelectedPage />;
    if (route === 'my-page') return <MyPage />;
    if (route === 'handwriting') return <HandwritingPage />;
    if (route === 'login') return <LoginPage />;
    if (route === 'reviews') return <ReviewPage />;
    if (route === 'profile-edit') return <ProfileEditPage />;
    if (route === 'top10') return <Top10Page />;
    if (route === 'english-fonts') return <EnglishFontsPage />;
    if (route === 'my-works') return <MyWorksPage />;
    if (route === 'image-font-search') return <ImageFontSearchPage />;
    return <HomePage />;
  }, [route]);

  useEffect(() => {
    // Ensure the new page is visible from the top.
    window.scrollTo(0, 0);
  }, [route]);

  return page;
}
