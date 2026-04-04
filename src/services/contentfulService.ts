import client from './graphqlClient';
import { PRODUCTS_QUERY } from './queries';
import { Product, GraphQLResponse } from './types';

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const data = await client.request<GraphQLResponse>(PRODUCTS_QUERY);

    return data.productCollection.items.map((item) => ({
      id: item.sys.id,
      productNameEnglish: item.productNameEnglish,
      productNameDutch: item.productNameDutch,
      productNamePortuguese: item.productNamePortuguese,
      productNameGerman: item.productNameGerman,
      descriptionEnglish: item.descriptionEnglish,
      descriptionDutch: item.descriptionDutch,
      descriptionPortuguese: item.descriptionPortuguese,
      descriptionGerman: item.descriptionGerman,
      image: {
        url: item.image.url,
      },
      isInStock: item.inStock,
    }));
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
        'X-Contentful-Content-Type': 'emailRegistration',
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
