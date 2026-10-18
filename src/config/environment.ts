export type AppEnvironment = 'development' | 'staging' | 'production';

export type AppConfig = {
  environment: AppEnvironment;
  apiBaseUrl: string;
};

const defaultConfig: Record<AppEnvironment, string> = {
  development: 'http://10.0.2.2:4000',
  staging: 'https://staging-api.amorvi.app',
  production: 'https://api.amorvi.app',
};

const getRuntimeEnvironment = (): AppEnvironment => {
  const override = (globalThis as any).__APP_ENV__ as AppEnvironment | undefined;
  if (override === 'development' || override === 'staging' || override === 'production') {
    return override;
  }

  if (__DEV__) {
    return 'development';
  }

  return 'production';
};

export const getAppConfig = (): AppConfig => {
  const environment = getRuntimeEnvironment();
  const overrideBaseUrl = (globalThis as any).__API_BASE_URL__ as string | undefined;

  return {
    environment,
    apiBaseUrl: overrideBaseUrl && overrideBaseUrl.trim()
      ? overrideBaseUrl.trim().replace(/\/$/, '')
      : defaultConfig[environment],
  };
};
