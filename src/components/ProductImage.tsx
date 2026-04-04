import { getContentfulImageUrl, PRODUCT_CARD_IMAGE } from '../utils/contentfulImage';

type ProductImageProps = {
  src: string;
  alt: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  className?: string;
};

/**
 * AVIF → WebP → img for Contentful URLs; plain img for other hosts.
 */
export function ProductImage({ src, alt, fetchPriority, className }: ProductImageProps) {
  const isContentful = src.includes('ctfassets.net');
  const eager = fetchPriority === 'high';

  if (!isContentful) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={fetchPriority}
      />
    );
  }

  const { width, height, fit, qualityAvif, qualityWebp } = PRODUCT_CARD_IMAGE;
  const avif = getContentfulImageUrl(src, {
    width,
    height,
    fit,
    format: 'avif',
    quality: qualityAvif,
  });
  const webp = getContentfulImageUrl(src, {
    width,
    height,
    fit,
    format: 'webp',
    quality: qualityWebp,
  });
  const imgFallback = getContentfulImageUrl(src, {
    width,
    height,
    fit,
    format: 'webp',
    quality: 72,
  });

  return (
    <picture>
      <source type="image/avif" srcSet={avif} sizes="(max-width: 640px) 100vw, 300px" />
      <source type="image/webp" srcSet={webp} sizes="(max-width: 640px) 100vw, 300px" />
      <img
        src={imgFallback}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 640px) 100vw, 300px"
        className={className}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={fetchPriority}
      />
    </picture>
  );
}
