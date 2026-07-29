import { GOOGLE_WEB_CLIENT_ID } from '../config/auth';

type GoogleSigninApi = {
  configure: (options: { webClientId: string; offlineAccess?: boolean }) => void;
  hasPlayServices: (options: {
    showPlayServicesUpdateDialog: boolean;
  }) => Promise<boolean>;
  signIn: () => Promise<any>;
  signOut: () => Promise<void>;
};

type GoogleSigninModule = {
  GoogleSignin?: GoogleSigninApi;
  statusCodes?: Record<string, string>;
  default?: {
    GoogleSignin?: GoogleSigninApi;
    statusCodes?: Record<string, string>;
  };
};

const loadGoogleSigninModule = (): GoogleSigninModule | null => {
  try {
    return require('@react-native-google-signin/google-signin');
  } catch {
    return null;
  }
};

export const getGoogleSignin = () => {
  const module = loadGoogleSigninModule();
  return module?.GoogleSignin ?? module?.default?.GoogleSignin ?? null;
};

export const getGoogleStatusCodes = () => {
  const module = loadGoogleSigninModule();
  return module?.statusCodes ?? module?.default?.statusCodes ?? {};
};

export const configureGoogleSignin = () => {
  const googleSignin = getGoogleSignin();

  if (!googleSignin || GOOGLE_WEB_CLIENT_ID.startsWith('YOUR_')) {
    return false;
  }

  googleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });

  return true;
};
