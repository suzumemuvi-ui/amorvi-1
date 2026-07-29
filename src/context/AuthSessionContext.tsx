import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { getGoogleSignin } from '../services/googleSignIn';

type AuthSessionContextType = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextType | undefined>(
  undefined,
);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await getGoogleSignin()?.signOut();
    } catch {
      // Email/password sessions and already-signed-out Google sessions can continue.
    } finally {
      setIsAuthenticated(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      login,
      logout,
    }),
    [isAuthenticated, login, logout],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error('useAuthSession must be used within AuthSessionProvider');
  }

  return context;
}
