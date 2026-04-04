import React, { useEffect, useId } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleModalClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  /** Portal to document.body so `position: fixed` covers the viewport. Ancestors with
   * `backdrop-filter` / `transform` (e.g. product cards) otherwise trap fixed overlays. */
  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-[2px] z-50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={handleModalClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id={titleId} className="text-lg font-semibold pr-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-red-500 font-bold cursor-pointer"
            aria-label="Close modal"
          >
            X
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
