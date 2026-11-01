const baseUrl = import.meta.env.BASE_URL;

// 图片处理
export const FALLBACK_IMAGE_SRC = `${baseUrl}static/icons/not-found.svg`;
export const DEFAULT_IMAGE_SIDE = 256;
export const MIN_IMAGE_SIDE = 256;
export const LOCAL_IMAGE_CACHE_LIMIT = 256;
export const REMOTE_IMAGE_CACHE_LIMIT = 512;
export const PERSISTENT_DB_NAME = 'dataSourcesDB';
export const PERSISTENT_DB_VERSION = 1;
export const PERSISTENT_STORE_NAME = 'dataSources';
