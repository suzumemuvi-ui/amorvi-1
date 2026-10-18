import { getAppConfig } from './environment';

export const API_BASE_URL = getAppConfig().apiBaseUrl;

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const setApiBaseUrl = (baseUrl: string) => {
  const normalized = baseUrl.trim().replace(/\/$/, '');
  if (normalized) {
    (globalThis as any).__API_BASE_URL__ = normalized;
  }
};

export const setAppEnvironment = (environment: 'development' | 'staging' | 'production') => {
  (globalThis as any).__APP_ENV__ = environment;
};
