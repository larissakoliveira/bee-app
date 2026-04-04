import React from 'react';

interface FlagProps {
  src: string;
  alt: string;
  title: string;
  onClick: () => void;
  tabIndex?: number;
  role?: string;
  'aria-label'?: string;
}

const Flag: React.FC<FlagProps> = ({
  src,
  alt,
  title,
  onClick,
  tabIndex = 0,
  role = 'button',
  'aria-label': ariaLabel,
}) => {
  const label = ariaLabel ?? `${title} — switch language`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className="h-8 w-8 object-contain cursor-pointer rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(90,30,13,0.85)]"
      title={title}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      role={role}
      aria-label={label}
    />
  );
};

export default Flag;
