/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_NINJAS_KEY: string;
  readonly VITE_UNSPLASH_ACCESS_KEY: string;
  readonly VITE_IUCN_API_KEY: string;
  readonly VITE_EBIRD_API_KEY: string;
  readonly VITE_THE_DOG_API_KEY: string;
  readonly VITE_THE_CAT_API_KEY: string;
  readonly VITE_XENO_CANTO_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
