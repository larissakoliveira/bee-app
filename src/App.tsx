import { Suspense, lazy, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import i18n from './i18n';

const RoutesPath = lazy(() => import('./routes'));

function App() {
  useEffect(() => {
    const syncHtmlLang = () => {
      document.documentElement.lang = i18n.language.split('-')[0] || 'nl';
    };
    syncHtmlLang();
    i18n.on('languageChanged', syncHtmlLang);
    return () => {
      i18n.off('languageChanged', syncHtmlLang);
    };
  }, []);

  return (
    <div className="App">
      <Header logoSrc="/bee.png" companyName="Jeroen's bees" />
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="min-h-[40vh] pt-28 flex items-center justify-center" role="status" aria-live="polite">
              <div className="flex flex-col items-center gap-3 text-custom-brown">
                <div className="h-10 w-10 rounded-full border-2 border-custom-orange border-t-transparent animate-spin" />
                <span className="text-sm font-medium">Loading…</span>
              </div>
            </div>
          }
        >
          <RoutesPath />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default App;
