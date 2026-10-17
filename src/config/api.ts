import { Platform } from 'react-native';

const resolveApiBaseUrl = () => {
  const envUrl =
    (typeof process !== 'undefined' && process.env && process.env.API_BASE_URL) ||
    (typeof globalThis !== 'undefined' && (globalThis as any).API_BASE_URL) ||
    null;

  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000';
  }

  return 'http://localhost:4000';
};

export const API_BASE_URL = resolveApiBaseUrl();

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
