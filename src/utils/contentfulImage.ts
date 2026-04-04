/**
 * Appends Contentful Images API params for smaller, faster loads.
 * @see https://www.contentful.com/developers/docs/references/images-api/
 */
export type ContentfulImageFormat = 'webp' | 'avif' | 'jpg' | 'png';

export function getContentfulImageUrl(
  url: string,
  options: {
    width: number;
    height?: number;
    fit?: 'pad' | 'fill' | 'scale' | 'crop';
    quality?: number;
    format?: ContentfulImageFormat;
  } = { width: 300 }
): string {
  if (!url.includes('images.ctfassets.net') && !url.includes('ctfassets.net')) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  const q = options.quality ?? 80;
  const fm = options.format ?? 'webp';
  const params = [`w=${options.width}`, `fm=${fm}`, `q=${q}`];
  if (options.height != null) {
    params.push(`h=${options.height}`);
  }
  if (options.fit) {
    params.push(`fit=${options.fit}`);
  }
  return `${url}${separator}${params.join('&')}`;
}

/** Card grid: display ~300px wide; aggressive compression for Lighthouse / slow networks. */
export const PRODUCT_CARD_IMAGE = {
  width: 300,
  height: 225,
  fit: 'fill' as const,
  qualityAvif: 55,
  qualityWebp: 68,
};
