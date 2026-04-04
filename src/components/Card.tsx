import React, { useState, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import isEmail from 'validator/lib/isEmail.js';
import Modal from './Modal';
import { ProductImage } from './ProductImage';

interface CardProps {
  productId: string;
  productName: string;
  productImage: string;
  description: string;
  isInStock: boolean;
  onNotify: (email: string, productId: string) => void;
  /** First card can use higher image priority for LCP. */
  imageFetchPriority?: 'high' | 'low' | 'auto';
}

const CardComponent: React.FC<CardProps> = ({
  productId,
  productName,
  productImage,
  description,
  isInStock,
  onNotify,
  imageFetchPriority = 'low',
}) => {
  const [email, setEmail] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { t } = useTranslation();

  const handleEmailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }, []);

  const handleNotifyClick = () => {
    if (email !== '' && isEmail(email)) {
      onNotify(email, productId);
      setShowNotifyModal(false);
      setShowSuccessModal(true);
    }
  };

  const handleToggleInfoModal = () => setShowInfoModal((v) => !v);
  const handleToggleNotifyModal = () => {
    setShowNotifyModal((v) => !v);
    setEmail('');
  };
  const handleToggleSuccessModal = () => setShowSuccessModal(false);

  const translatedName = t(`products.${productName}.name`, {
    defaultValue: productName,
  });
  const translatedDescription: React.ReactNode = t(`products.${productName}.description`, {
    defaultValue: description,
  });

  return (
    <article className="mt-4 w-full max-w-xs bg-white p-5 rounded-xl shadow-lg border border-neutral-200 flex flex-col justify-between min-h-[465px]">
      <h2 className="text-lg font-bold text-neutral-900 text-center mb-2 line-clamp-2">{translatedName}</h2>
      <div className="relative w-full aspect-[4/3] mb-4 rounded-lg overflow-hidden bg-custom-brown/5">
        <ProductImage
          src={productImage}
          alt={String(translatedName)}
          fetchPriority={imageFetchPriority}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <p className="text-center">
        <button
          type="button"
          className="text-neutral-900 font-bold underline underline-offset-2 decoration-custom-brown decoration-2 hover:text-custom-brown focus:outline-none focus-visible:ring-2 focus-visible:ring-custom-brown rounded px-1"
          onClick={handleToggleInfoModal}
          aria-label={t('moreInfo')}
        >
          {t('moreInfo')}
        </button>
      </p>
      <div
        className={`flex items-center justify-center font-bold min-h-[5.5rem] ${
          isInStock ? 'text-green-900 text-xl mb-2' : 'text-red-900'
        }`}
      >
        {isInStock ? (
          <div className="flex items-center gap-2">
            <img src="/bee.png" loading="lazy" alt="" width={48} height={48} className="h-12 w-12 object-contain" />
            <span>{t('inStock')}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <img
                loading="lazy"
                src="/sad-bee.webp"
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <span className="text-xl">{t('outOfStock')}</span>
            </div>
            <button
              type="button"
              className="bg-custom-brown text-white py-2 px-3 rounded-lg hover:opacity-95 active:opacity-90 transition w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-custom-brown"
              onClick={handleToggleNotifyModal}
            >
              {t('notifyMe')}
            </button>
          </div>
        )}
      </div>

      <Modal isOpen={showInfoModal} onClose={handleToggleInfoModal} title={String(translatedName)}>
        <div className="text-gray-700 text-sm leading-relaxed">{translatedDescription}</div>
      </Modal>

      <Modal isOpen={showNotifyModal} onClose={handleToggleNotifyModal} title={t('notifyMe')}>
        <input
          type="email"
          autoComplete="email"
          placeholder={t('emailPlaceholder')}
          className={`border p-2 rounded-md w-full mb-0.5 ${
            email === '' || isEmail(email) ? 'border-green-500' : 'border-red-500'
          }`}
          value={email}
          onChange={handleEmailChange}
        />
        {email !== '' && !isEmail(email) && (
          <span className="text-red-900 text-sm p-1 font-semibold">
            {t('invalidEmail')}
            <span className="text-lg" aria-hidden>
              &#128683;
            </span>
          </span>
        )}
        {email !== '' && isEmail(email) && (
          <span className="text-green-900 text-sm p-1 font-semibold">
            {t('validEmail')}
            <span className="text-lg" aria-hidden>
              &#128079;
            </span>
          </span>
        )}
        <button
          type="button"
          onClick={handleNotifyClick}
          disabled={email !== '' && !isEmail(email)}
          className={`text-white p-2 mt-2 rounded-md transition w-full ${
            email !== '' && !isEmail(email)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-custom-brown hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-custom-brown'
          }`}
        >
          {t('notifyMe')}
        </button>
      </Modal>

      <Modal isOpen={showSuccessModal} onClose={handleToggleSuccessModal} title={t('notifyTitle')}>
        <div className="text-center text-gray-700">{t('notifyMessage', { email, productName })}</div>
        <div className="relative h-48 mt-4">
          <img loading="lazy" src="/worker-bee.gif" alt="" className="h-full w-full object-contain" />
        </div>
      </Modal>
    </article>
  );
};

const Card = memo(CardComponent);
export default Card;
