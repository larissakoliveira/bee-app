/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTENTFUL_SPACE_ID: string;
  readonly VITE_CONTENTFUL_ACCESS_TOKEN_DELIVERY_API: string;
  readonly VITE_CONTENTFUL_ACCESS_TOKEN_MANAGEMENT: string;
  /** Contentful environment (`master`, `staging`, …). Default: master */
  readonly VITE_CONTENTFUL_ENVIRONMENT_ID?: string;
  /** Content type API identifier in Contentful (Query.<id>Collection). Default: product */
  readonly VITE_CONTENTFUL_PRODUCT_CONTENT_TYPE_ID?: string;
  /** E-mail registration content type id — must match webhook CONTENTFUL_EMAIL_REGISTRATION_CONTENT_TYPE_ID. Default: emailRegistration */
  readonly VITE_CONTENTFUL_EMAIL_REGISTRATION_CONTENT_TYPE_ID?: string;
  readonly VITE_CONTENTFUL_EMAIL_REGISTRATION_EMAIL_FIELD_ID?: string;
  readonly VITE_CONTENTFUL_EMAIL_REGISTRATION_LANGUAGE_FIELD_ID?: string;
  readonly VITE_CONTENTFUL_EMAIL_REGISTRATION_RELATED_PRODUCT_FIELD_ID?: string;
  /** Optional: built into index.html at build time for LCP preload (see .env.example). */
  readonly VITE_LCP_IMAGE_PRELOAD_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
