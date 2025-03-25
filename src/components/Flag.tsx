import React from 'react';

interface FlagProps {
  src: string;
  alt: string;
  title: string;
  onClick: () => void;
  tabIndex?: number;
  role?: string;
  "aria-label"?: string;
}

const Flag: React.FC<FlagProps> = ({ src, alt, title, onClick }) => {
  return (
    <img
      src={src}
      alt={alt}
      className="h-8 w-8 object-contain cursor-pointer"
      title={title}
      onClick={onClick}
    />
  );
};

export default Flag;
