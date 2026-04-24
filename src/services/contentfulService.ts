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

if (!import.meta.env.VITE_CONTENTFUL_PRODUCT_CONTENT_TYPE_ID?.trim()) {
  console.warn(
    '[Contentful] VITE_CONTENTFUL_PRODUCT_CONTENT_TYPE_ID is not set; defaulting to "product" → GraphQL field productCollection. ' +
      'If that field does not exist in your space, set this variable on Vercel (name must include the VITE_ prefix) to the Product content type API identifier from Contentful → Content model → your product type → API identifier, then redeploy.'
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
    const text = error instanceof Error ? error.message : String(error);
    if (text.includes('Cannot query field') && text.includes('Collection')) {
      console.error(
        `[Contentful] No GraphQL collection for content type "${productContentTypeId}". ` +
          'Set VITE_CONTENTFUL_PRODUCT_CONTENT_TYPE_ID to the exact API identifier of your product content type (not the display name), redeploy, and confirm the delivery token can read that environment.'
      );
    }
    return [];
  }
};

export const registerEmailContentful = async (email: string, productId: string, language: string): Promise<void> => {
  const registerApiUrl = import.meta.env.VITE_EMAIL_REGISTER_API_URL?.trim();

  if (registerApiUrl) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const shared = import.meta.env.VITE_EMAIL_REGISTER_SHARED_SECRET?.trim();
    if (shared) {
      headers['X-Bee-Register-Secret'] = shared;
    }
    const response = await fetch(registerApiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, productId, language }),
    });
    const bodyText = await response.text();
    if (!response.ok) {
      console.error('[registerEmailContentful] register API rejected', response.status, bodyText);
      let detail = bodyText.slice(0, 400);
      try {
        const parsed = JSON.parse(bodyText) as { detail?: string; message?: string };
        if (parsed.detail) detail = parsed.detail;
        else if (parsed.message) detail = parsed.message;
      } catch {
        /* use raw */
      }
      throw new Error(detail);
    }
    return;
  }

  const spaceId = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
  const accessTokenPost = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN_MANAGEMENT;

  if (!spaceId?.trim() || !accessTokenPost?.trim()) {
    throw new Error(
      'Missing VITE_CONTENTFUL_SPACE_ID or VITE_CONTENTFUL_ACCESS_TOKEN_MANAGEMENT in .env, or set VITE_EMAIL_REGISTER_API_URL to your webhook register endpoint (see .env.example).'
    );
  }

  const envId = import.meta.env.VITE_CONTENTFUL_ENVIRONMENT_ID?.trim() || 'master';
  const registerEmailContentfulUrl = `https://api.contentful.com/spaces/${spaceId}/environments/${encodeURIComponent(envId)}/entries`;

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
