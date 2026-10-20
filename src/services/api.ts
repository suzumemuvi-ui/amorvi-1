import { API_BASE_URL } from '../config/api';

export { API_BASE_URL };

export type ApiOptions = RequestInit & {
  token?: string;
};

export async function apiRequest<T>(
  path: string,
  { token, headers, ...options }: ApiOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data as T;
}

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    age: number;
    bio: string;
    interests: string[];
    goals: string[];
    location: { latitude: number; longitude: number } | null;
    images: string[];
  };
};
