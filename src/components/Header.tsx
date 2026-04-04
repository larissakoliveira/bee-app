import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ensureLanguageLoaded } from '../i18n';
import Flag from './Flag';

interface HeaderProps {
  logoSrc: string;
  companyName: string;
}

const Header: React.FC<HeaderProps> = ({ logoSrc, companyName }) => {
  const { i18n } = useTranslation();

  const handleChangeLanguage = (lang: string) => {
    void (async () => {
      await ensureLanguageLoaded(lang);
      await i18n.changeLanguage(lang);
    })();
  };

  return (
    <header className="fixed z-10 top-0 w-full flex items-center justify-between gap-3 px-4 py-3 bg-[rgba(90,30,13,0.92)] backdrop-blur-sm text-white shadow-md">
      <Link
        to="/"
        aria-label={`${companyName} — home`}
        className="shrink-0 bee-animation flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full p-1"
      >
        <img
          src={logoSrc}
          alt=""
          width={56}
          height={56}
          className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
          decoding="async"
          fetchPriority="high"
        />
      </Link>
      <Link
        to="/"
        className="min-w-0 flex-1 text-center px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
      >
        <h1 className="text-xl sm:text-2xl font-bold truncate">{companyName}</h1>
      </Link>
      <nav className="flex shrink-0 gap-1.5 sm:gap-2" aria-label="Language">
        <Flag
          src="/nl_flag.webp"
          alt=""
          title="Nederlands"
          onClick={() => handleChangeLanguage('nl')}
          aria-label="Switch language to Dutch"
        />
        <Flag
          src="/uk_flag.png"
          alt=""
          title="English"
          onClick={() => handleChangeLanguage('en')}
          aria-label="Switch language to English"
        />
        <Flag
          src="/br_flag.png"
          alt=""
          title="Português"
          onClick={() => handleChangeLanguage('pt')}
          aria-label="Switch language to Portuguese"
        />
        <Flag
          src="/de_flag.png"
          alt=""
          title="Deutsch"
          onClick={() => handleChangeLanguage('de')}
          aria-label="Switch language to German"
        />
      </nav>
    </header>
  );
};

export default Header;
