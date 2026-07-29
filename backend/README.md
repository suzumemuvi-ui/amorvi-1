# Amorvi Backend

Local backend for the Amorvi React Native app.

## Stack

- Node.js + TypeScript
- Express API
- JSON file datastore for local development
- JWT auth

For production, move the datastore behind the same API routes to PostgreSQL with Prisma or Supabase.

## Setup

```sh
cd backend
npm install
npm run seed
npm run dev
```

## Google Sign-In

Create OAuth clients in Google Cloud for:

- Android app: package name `com.love_alarm_app`
- Web app: used for token verification

Paste the Web Client ID in:

```txt
backend/.env
src/config/auth.ts
```

```txt
GOOGLE_WEB_CLIENT_ID="your-google-web-client-id.apps.googleusercontent.com"
```

After installing native Google Sign-In, rebuild the app:

```sh
npm run android
```

For iOS, run pods after installing:

```sh
cd ios
bundle exec pod install
```

Health check:

```sh
curl http://localhost:4000/health
```

Seed login:

```txt
email: emily@amorvi.test
password: password123
```

## Mobile API URL

For Android emulator, use:

```txt
http://10.0.2.2:4000
```

For iOS simulator, use:

```txt
http://localhost:4000
```

For a real device, use your computer LAN IP, for example:

```txt
http://192.168.1.20:4000
```

## First endpoints

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`
- `GET /me`
- `PATCH /me/location`
- `GET /users/nearby?radius=5000`
- `GET /matches`
- `POST /messages`
