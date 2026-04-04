import client from './graphqlClient';
import { buildProductsQuery, getProductCollectionFieldName } from './queries';
import { Product, ProductCollection, ProductItem } from './types';

const productContentTypeId =
  import.meta.env.VITE_CONTENTFUL_PRODUCT_CONTENT_TYPE_ID?.trim() || 'product';

/** Must match Content model → Email registration → API identifier (same as webhook `CONTENTFUL_EMAIL_REGISTRATION_CONTENT_TYPE_ID`). */
const emailRegistrationContentTypeId =
  import.meta.env.VITE_CONTENTFUL_EMAIL_REGISTRATION_CONTENT_TYPE_ID?.trim() || 'emailRegistration';

/** Field API ids from Content model → E-mail registration (defaults match typical camelCase ids). */
const emailFieldId = import.meta.env.VITE_CONTENTFUL_EMAIL_REGISTRATION_EMAIL_FIELD_ID?.trim() || 'email';
const languageFieldId = import.meta.env.VITE_CONTENTFUL_EMAIL_REGISTRATION_LANGUAGE_FIELD_ID?.trim() || 'language';
const relatedProductFieldId =
  import.meta.env.VITE_CONTENTFUL_EMAIL_REGISTRATION_RELATED_PRODUCT_FIELD_ID?.trim() || 'relatedProduct';

if (import.meta.env.DEV && !import.meta.env.VITE_CONTENTFUL_PRODUCT_CONTENT_TYPE_ID?.trim()) {
  console.warn(
    '[Contentful] VITE_CONTENTFUL_PRODUCT_CONTENT_TYPE_ID is not set; using "product". ' +
      'If you see "Cannot query field productCollection", set it to your Product content type API identifier (Content model → Product).'
  );
}

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const collectionField = getProductCollectionFieldName(productContentTypeId);
    const query = buildProductsQuery(collectionField);
    const data = await client.request<Record<string, ProductCollection>>(query);
    const collection = data[collectionField];
    if (!collection?.items) {
      console.error('Unexpected GraphQL response shape for', collectionField);
      return [];
    }

    return collection.items.map((item: ProductItem) => {
      const nameEn = item.productNameEnglish ?? '';
      const nameNl = item.productNameDutch ?? '';
      const descEn = item.descriptionEnglish ?? '';
      const descNl = item.descriptionDutch ?? '';
      return {
        id: item.sys.id,
        productNameEnglish: nameEn,
        productNameDutch: nameNl,
        productNamePortuguese: nameEn,
        productNameGerman: nameEn,
        descriptionEnglish: descEn,
        descriptionDutch: descNl,
        descriptionPortuguese: descEn,
        descriptionGerman: descEn,
        image: {
          url: item.image.url,
        },
        isInStock: item.inStock,
      };
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const registerEmailContentful = async (email: string, productId: string, language: string): Promise<void> => {
  const spaceId = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
  const accessTokenPost = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN_MANAGEMENT;

  if (!spaceId?.trim() || !accessTokenPost?.trim()) {
    throw new Error('Missing VITE_CONTENTFUL_SPACE_ID or VITE_CONTENTFUL_ACCESS_TOKEN_MANAGEMENT in .env');
  }

  const registerEmailContentfulUrl = `https://api.contentful.com/spaces/${spaceId}/environments/master/entries`;

  const locale = 'en-US';
  const fields: Record<string, Record<string, unknown>> = {
    [emailFieldId]: { [locale]: email },
    [languageFieldId]: { [locale]: language },
    [relatedProductFieldId]: {
      [locale]: {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: productId,
        },
      },
    },
  };

  const response = await fetch(registerEmailContentfulUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessTokenPost}`,
      'Content-Type': 'application/vnd.contentful.management.v1+json',
      'X-Contentful-Content-Type': emailRegistrationContentTypeId,
    },
    body: JSON.stringify({ fields }),
  });

  const bodyText = await response.text();
  if (!response.ok) {
    console.error('[registerEmailContentful] CMA rejected create', response.status, bodyText);
    throw new Error(`Contentful ${response.status}: ${bodyText.slice(0, 400)}`);
  }
};
