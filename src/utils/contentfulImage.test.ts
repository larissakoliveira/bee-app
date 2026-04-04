import { describe, expect, it } from 'vitest';
import { getContentfulImageUrl, PRODUCT_CARD_IMAGE } from './contentfulImage';

describe('getContentfulImageUrl', () => {
  it('returns original URL for non-Contentful hosts', () => {
    const url = 'https://example.com/image.png';
    expect(getContentfulImageUrl(url)).toBe(url);
  });

  it('appends image API params for ctfassets.net', () => {
    const url = 'https://images.ctfassets.net/space/asset/image.jpg';
    const out = getContentfulImageUrl(url, { width: 320 });
    expect(out).toContain('w=320');
    expect(out).toContain('fm=webp');
  });

  it('supports fit and height for card-sized assets', () => {
    const url = 'https://images.ctfassets.net/space/asset/image.jpg';
    const out = getContentfulImageUrl(url, {
      width: PRODUCT_CARD_IMAGE.width,
      height: PRODUCT_CARD_IMAGE.height,
      fit: PRODUCT_CARD_IMAGE.fit,
      format: 'avif',
      quality: PRODUCT_CARD_IMAGE.qualityAvif,
    });
    expect(out).toContain(`w=${PRODUCT_CARD_IMAGE.width}`);
    expect(out).toContain(`h=${PRODUCT_CARD_IMAGE.height}`);
    expect(out).toContain(`fit=${PRODUCT_CARD_IMAGE.fit}`);
    expect(out).toContain('fm=avif');
  });
});
