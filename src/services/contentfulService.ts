import client from './graphqlClient';
import { buildProductsQuery, getProductCollectionFieldName } from './queries';
import { Product, ProductCollection, ProductItem } from './types';

const productContentTypeId =
  import.meta.env.VITE_CONTENTFUL_PRODUCT_CONTENT_TYPE_ID?.trim() || 'product';

/** Must match Content model → Email registration → API identifier (same as webhook `CONTENTFUL_EMAIL_REGISTRATION_CONTENT_TYPE_ID`). */
const emailRegistrationContentTypeId =
  import.meta.env.VITE_CONTENTFUL_EMAIL_REGISTRATION_CONTENT_TYPE_ID?.trim() || 'emailRegistration';

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

  const registerEmailContentfulUrl = `https://api.contentful.com/spaces/${spaceId}/environments/master/entries`;

  try {
    const response = await fetch(registerEmailContentfulUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessTokenPost}`,
        'Content-Type': 'application/vnd.contentful.management.v1+json',
        'X-Contentful-Content-Type': emailRegistrationContentTypeId,
      },
      body: JSON.stringify({
        fields: {
          email: {
            'en-US': email,
          },
          language: {
            'en-US': language,
          },
          relatedProduct: {
            'en-US': {
              sys: {
                type: "Link",
                linkType: "Entry",
                id: productId,
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create email: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error creating email:', error);
  }
};
