import type { Product } from '../services/types';

export const PRODUCT_LANGUAGE_FIELDS = {
  nl: { name: 'productNameDutch', description: 'descriptionDutch' },
  en: { name: 'productNameEnglish', description: 'descriptionEnglish' },
  pt: { name: 'productNamePortuguese', description: 'descriptionPortuguese' },
  de: { name: 'productNameGerman', description: 'descriptionGerman' },
} as const;

export type AppLanguage = keyof typeof PRODUCT_LANGUAGE_FIELDS;

export function getProductLanguageKeys(lang: string) {
  const key = lang.split('-')[0] as AppLanguage;
  return PRODUCT_LANGUAGE_FIELDS[key] ?? PRODUCT_LANGUAGE_FIELDS.nl;
}

export function getLocalizedProductCopy(product: Product, lang: string) {
  const keys = getProductLanguageKeys(lang);
  const name = product[keys.name as keyof Product] as string;
  const description = product[keys.description as keyof Product] as string;
  return { name: name ?? '', description: description ?? '' };
}
