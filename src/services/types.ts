export interface ProductImage {
    url: string;
    title?: string;
    description?: string;
  }
  
  export interface ProductDescription {
    json: unknown;
  }
  
  export interface ProductItem {
    sys: {
      id: string;
    };
    productNameDutch: string;
    productNameEnglish: string;
    productNamePortuguese: string;
    productNameGerman: string;
    descriptionDutch: string;
    descriptionEnglish: string;
    descriptionPortuguese: string;
    descriptionGerman: string;
    inStock: boolean;
    image: ProductImage;
    description: ProductDescription;
  }
  
  export interface ProductCollection {
    items: ProductItem[];
  }
  
  export interface GraphQLResponse {
    productCollection: ProductCollection;
  }
  
  export interface Product {
    id: string;
    productNameDutch: string;
    productNameEnglish: string;
    productNamePortuguese: string;
    productNameGerman: string;
    descriptionDutch: string;
    descriptionEnglish: string;
    descriptionPortuguese: string;
    descriptionGerman: string;
    image: ProductImage;
    isInStock: boolean;
  }
  