# Amorvi environment configuration

Use this setup so the app can switch cleanly between development, staging, and production without changing source code.

## Default values

- development: http://10.0.2.2:4000
- staging: https://staging-api.amorvi.app
- production: https://api.amorvi.app

## Runtime override

You can override the environment at runtime before app boot:

```ts
(globalThis as any).__APP_ENV__ = 'production';
(globalThis as any).__API_BASE_URL__ = 'https://api.amorvi.app';
```

## Recommended usage

- local emulator/dev: `development`
- QA/staging: `staging`
- real app release: `production`

This keeps localhost and 10.0.2.2 only for local development, while production builds use a public HTTPS domain.
