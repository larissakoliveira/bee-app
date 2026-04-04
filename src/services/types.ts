export interface ProductImage {
    url: string;
    title?: string;
    description?: string;
  }
  
  export interface ProductDescription {
    json: unknown;
  }
  
  /** GraphQL item: NL+EN from CMS; PT/DE are filled in the service layer from English. */
  export interface ProductItem {
    sys: {
      id: string;
    };
    productNameDutch: string;
    productNameEnglish: string;
    inStock: boolean;
    image: ProductImage;
    description: ProductDescription;
    descriptionDutch: string;
    descriptionEnglish: string;
  }
  
  export interface ProductCollection {
    items: ProductItem[];
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
  