import { gql } from 'graphql-request';

export const PRODUCTS_QUERY = gql`
  query {
    productCollection {
      items {
        sys {
          id
        }
        productNameDutch
        productNameEnglish
        productNamePortuguese
        productNameGerman
        descriptionDutch
        descriptionEnglish
        descriptionPortuguese
        descriptionGerman
        inStock
        image {
          url
        }
      }
    }
  }
`;
