/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTENTFUL_SPACE_ID: string;
  readonly VITE_CONTENTFUL_ACCESS_TOKEN_DELIVERY_API: string;
  readonly VITE_CONTENTFUL_ACCESS_TOKEN_MANAGEMENT: string;
  /** Content type API identifier in Contentful (Query.<id>Collection). Default: product */
  readonly VITE_CONTENTFUL_PRODUCT_CONTENT_TYPE_ID?: string;
  /** Optional: built into index.html at build time for LCP preload (see .env.example). */
  readonly VITE_LCP_IMAGE_PRELOAD_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
