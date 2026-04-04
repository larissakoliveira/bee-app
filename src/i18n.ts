import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import nlTranslation from './locales/nl/translation.json';

export type AppLocale = 'nl' | 'en' | 'pt' | 'de';

const localeImports: Record<Exclude<AppLocale, 'nl'>, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import('./locales/en/translation.json'),
  pt: () => import('./locales/pt/translation.json'),
  de: () => import('./locales/de/translation.json'),
};

void i18n.use(initReactI18next).init({
  resources: {
    nl: { translation: nlTranslation },
  },
  lng: 'nl',
  fallbackLng: 'nl',
  supportedLngs: ['nl', 'en', 'pt', 'de'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

/**
 * Loads locale JSON on demand so initial JS excludes en/pt/de bundles (smaller main-thread parse).
 */
export async function ensureLanguageLoaded(lng: string): Promise<void> {
  const code = lng.split('-')[0] as AppLocale;
  if (code === 'nl' || i18n.hasResourceBundle(code, 'translation')) {
    return;
  }
  const loader = localeImports[code as Exclude<AppLocale, 'nl'>];
  if (!loader) {
    return;
  }
  const mod = await loader();
  i18n.addResourceBundle(code, 'translation', mod.default, true, true);
}

export default i18n;
