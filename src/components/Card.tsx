import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import validator from "validator";
import Modal from "./Modal";

interface CardProps {
  productId: string;
  productName: string;
  productImage: string;
  description: string;
  isInStock: boolean;
  onNotify: (email: string, productId: string) => void;
}

const Card: React.FC<CardProps> = ({
  productId,
  productName,
  productImage,
  description,
  isInStock,
  onNotify,
}) => {
  const [email, setEmail] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { t } = useTranslation();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleNotifyClick = () => {
    if (email !== "" && validator.isEmail(email)) {
      onNotify(email, productId);
      setShowNotifyModal(false);
      setShowSuccessModal(true);
    }
  };

  const handleToggleInfoModal = () => setShowInfoModal(!showInfoModal);
  const handleToggleNotifyModal = () => {
    setShowNotifyModal(!showNotifyModal);
    setEmail("");
  };
  const handleToggleSuccessModal = () => setShowSuccessModal(false);

  const translatedName = t(`products.${productName}.name`, {
    defaultValue: productName,
  });
  const translatedDescription: React.ReactNode = t(
    `products.${productName}.description`,
    { defaultValue: description }
  );

  return (
    <div className="mt-12 w-full max-w-xs bg-opacity-80 bg-white p-4 rounded-lg shadow-md flex flex-col justify-between h-[465px]">
      <h2 className="text-lg font-bold text-center mb-2">{translatedName}</h2>
      <img
        src={productImage}
        alt={translatedName}
        className="w-full h-64 object-cover rounded-md mb-4"
        loading="lazy" 
      />
      <p className="text-center">
        <span
          className="text-yellow-500 text-center font-bold underline cursor-pointer"
          onClick={handleToggleInfoModal}
          tabIndex={0}
          aria-label={t("moreInfo")}
        >
          {t("moreInfo")}
        </span>
      </p>
      <div
        className={`flex items-center justify-center font-bold ${
          isInStock ? "text-green-500 text-xl mb-4" : "text-red-500"
        }`}
      >
        {isInStock ? (
          <div className="flex items-center space-x-2">
            <img src="/bee.png" loading="lazy" alt={t("inStock")} className="h-12 w-auto" />
            <span>{t("inStock")}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2">
              <img
                loading="lazy"
                src="/sad-bee.webp"
                alt={t("outOfStock")}
                className="h-12 w-auto"
              />
              <span className="text-xl">{t("outOfStock")}</span>
            </div>
            <button
              className="bg-custom-orange cursor-pointer text-white p-1 rounded-md hover:bg-brown-700 transition duration-300 w-full"
              onClick={handleToggleNotifyModal}
            >
              {t("notifyMe")}
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={showInfoModal}
        onClose={handleToggleInfoModal}
        title={translatedName}
      >
        <div className="text-gray-700">{translatedDescription}</div>
      </Modal>

      <Modal
        isOpen={showNotifyModal}
        onClose={handleToggleNotifyModal}
        title={t("notifyMe")}
      >
        <input
          type="email"
          placeholder={t("emailPlaceholder")}
          className={`border p-2 rounded-md w-full mb-0.5 ${
            email === "" || validator.isEmail(email)
              ? "border-green-500"
              : "border-red-500"
          }`}
          value={email}
          onChange={handleEmailChange}
        />
        {email !== "" && !validator.isEmail(email) && (
          <span className="text-red-500 text-sm p-1 font-semibold">
            {t("invalidEmail")}
            <span className="text-lg">&#128683;</span>
          </span>
        )}
        {email !== "" && validator.isEmail(email) && (
          <span className="text-green-500 text-sm p-1 font-semibold">
            {t("validEmail")}
            <span className="text-lg">&#128079;</span>
          </span>
        )}
        <button
          onClick={handleNotifyClick}
          disabled={email !== "" && !validator.isEmail(email)}
          className={`text-white p-2 mt-2 rounded-md transition duration-300 w-full ${
            email !== "" && !validator.isEmail(email)
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-custom-orange hover:bg-brown-700"
          }`}
        >
          {t("notifyMe")}
        </button>
      </Modal>

      <Modal
        isOpen={showSuccessModal}
        onClose={handleToggleSuccessModal}
        title={t("notifyTitle")}
      >
        <div className="text-center text-gray-700">
          {t(
            "notifyMessage",
            { email, productName }
          )}
        </div>
        <div className="relative h-48 mt-4">
          <img
            loading="lazy"
            src="/worker-bee.gif"
            alt="Happy Bee"
            className="h-full w-full object-none"
          />
        </div>
      </Modal>
    </div>
  );
};

export default Card;
