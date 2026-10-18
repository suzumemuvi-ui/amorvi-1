import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { userService } from '../services/userService';
import { realtimeService } from '../services/realtimeService';

type User = {
  id: string;
  email: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  goals: string[];
  location: {
    latitude: number;
    longitude: number;
  } | null;
  images: string[];
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    age: number
  ) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  updateLocation: (
    latitude: number,
    longitude: number
  ) => Promise<void>;
  updateProfile: (data: {
    name?: string;
    age?: number;
    bio?: string;
    interests?: string[];
    goals?: string[];
    images?: string[];
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const API_URL = API_BASE_URL;

const getApiError = async (res: Response): Promise<string> => {
  try {
    const data: unknown = await res.json();

    if (
      typeof data === 'object' &&
      data !== null &&
      'error' in data
    ) {
      const error = (data as { error?: unknown }).error;

      if (typeof error === 'string') {
        return error;
      }
    }
  } catch {
    // Response is not JSON
  }

  return `Request failed with status ${res.status}`;
};

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('authToken');

        if (savedToken) {
          setToken(savedToken);
          (global as any).userToken = savedToken;

          try {
            const res = await fetch(`${API_URL}/me`, {
              headers: {
                Authorization: `Bearer ${savedToken}`,
              },
            });

            if (res.ok) {
              const data = (await res.json()) as { user: User };
              setUser(data.user);
            } else {
              await AsyncStorage.removeItem('authToken');
              setToken(null);
              (global as any).userToken = null;
            }
          } catch (error) {
            console.warn('Token restore failed, clearing session:', error);
            await AsyncStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
            (global as any).userToken = null;
          }
        }
      } catch (error) {
        console.error('Failed to restore token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreToken();
  }, []);

  useEffect(() => {
    if (token) {
      realtimeService.connect(token);
    } else {
      realtimeService.disconnect();
    }

    return () => {
      if (token) {
        realtimeService.disconnect();
      }
    };
  }, [token]);

  const login = async (
    email: string,
    password: string
  ) => {
    try {
      setIsLoading(true);

      console.log('Login attempt:', { email: email.trim(), password: password?.length });

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(await getApiError(res));
      }

      const data = (await res.json()) as {
        token: string;
        user: User;
      };

      await AsyncStorage.setItem(
        'authToken',
        data.token
      );

      setToken(data.token);
      setUser(data.user);
      (global as any).userToken = data.token;
    } catch (error) {
      // Invalid credentials are an expected user-facing outcome. Logging them
      // with console.error makes React Native show a development error overlay.
      // The sign-in screen catches this error and presents a normal alert.
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    age: number
  ) => {
    try {
      setIsLoading(true);

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      console.log('Register attempt:', { email: email.trim(), name: name.trim(), age });

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          name: name.trim(),
          age,
        }),
      });

      if (!res.ok) {
        throw new Error(await getApiError(res));
      }

      const data = (await res.json()) as {
        token: string;
        user: User;
      };

      await AsyncStorage.setItem(
        'authToken',
        data.token
      );

      setToken(data.token);
      setUser(data.user);
      (global as any).userToken = data.token;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
        }),
      });

      if (!res.ok) {
        throw new Error(await getApiError(res));
      }

      const data = (await res.json()) as {
        token: string;
        user: User;
      };

      await AsyncStorage.setItem(
        'authToken',
        data.token
      );

      setToken(data.token);
      setUser(data.user);
      (global as any).userToken = data.token;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');

      setToken(null);
      setUser(null);
      (global as any).userToken = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateLocation = async (
    latitude: number,
    longitude: number
  ) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const res = await fetch(`${API_URL}/me/location`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude,
          longitude,
        }),
      });

      if (!res.ok) {
        throw new Error(await getApiError(res));
      }

      const data = (await res.json()) as {
        user: User;
      };

      setUser(data.user);
    } catch (error) {
      console.error('Location update error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: {
    name?: string;
    age?: number;
    bio?: string;
    interests?: string[];
    goals?: string[];
    images?: string[];
  }) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await userService.updateProfile(token, data);
      setUser(result.user);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    loginWithGoogle,
    updateLocation,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};
