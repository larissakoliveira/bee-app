/**
 * GraphQL selection must use field API IDs that exist on your Product content type.
 * The collection root is `{contentTypeApiId}Collection` — set via VITE_CONTENTFUL_PRODUCT_CONTENT_TYPE_ID.
 *
 * Only Dutch + English are required in Contentful. Portuguese/German are optional in the CMS;
 * the app maps them from English when absent (see contentfulService).
 */
const PRODUCT_FIELDS = `
  items {
    sys {
      id
    }
    productNameDutch
    productNameEnglish
    descriptionDutch
    descriptionEnglish
    inStock
    image {
      url
    }
  }
`;

/** Contentful GraphQL: Query.<apiIdentifier>Collection */
export function getProductCollectionFieldName(contentTypeApiId: string): string {
  const id = contentTypeApiId.trim();
  if (!id) {
    throw new Error('VITE_CONTENTFUL_PRODUCT_CONTENT_TYPE_ID is empty');
  }
  return `${id}Collection`;
}

export function buildProductsQuery(collectionFieldName: string): string {
  return `
  query {
    ${collectionFieldName} {
      ${PRODUCT_FIELDS}
    }
  }
`;
}
