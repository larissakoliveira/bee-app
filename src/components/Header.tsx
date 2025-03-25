import React from 'react';
import { useTranslation } from 'react-i18next';
import Flag from './Flag';

interface HeaderProps {
  logoSrc: string;
  companyName: string;
}

const Header: React.FC<HeaderProps> = ({ logoSrc, companyName }) => {
  const { i18n } = useTranslation();

  const handleChangeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <header className="fixed z-10 top-0 w-full flex items-center justify-between p-3 bg-[rgba(90,30,13,0.85)] text-white">
      <div className="relative h-4 mt-2">
        <div className="absolute -top-1 -right-5 w-16 h-16 bee-animation">
          <a href="/">
            <img 
              src={logoSrc} 
              alt="Company Logo" 
              className="h-15 w-auto" 
            />
          </a>
        </div>
        <div className="absolute top-1 left-0 w-16 h-16 bee-animation">
          <a href="/">
            <img 
              src={logoSrc} 
              alt="Company Logo" 
              className="h-15 w-auto" 
            />
          </a>
        </div>
        <div className="absolute top-9 right-0 w-16 h-16 bee-animation">
          <a href="/">
            <img 
              src={logoSrc} 
              alt="Company Logo" 
              className="h-15 w-auto" 
            />
          </a>
        </div>
      </div>
      <a href="/">
        <h1 className="text-2xl font-bold flex-1 text-center">{companyName}</h1>
      </a>
      <div className="flex space-x-2">
        <Flag 
          src="/nl_flag.webp" 
          alt="Dutch" 
          title="Dutch" 
          onClick={() => handleChangeLanguage('nl')} 
          tabIndex={0}
          role="button"
          aria-label="Switch language to Dutch"
        />
        <Flag 
          src="/uk_flag.png" 
          alt="English" 
          title="English" 
          onClick={() => handleChangeLanguage('en')} 
        />
        <Flag 
          src="/br_flag.png" 
          alt="Portuguese" 
          title="Portuguese" 
          onClick={() => handleChangeLanguage('pt')} 
        />
        <Flag 
          src="/de_flag.png" 
          alt="German" 
          title="German" 
          onClick={() => handleChangeLanguage('de')} 
        />
      </div>
    </header>
  );
};

export default Header;
