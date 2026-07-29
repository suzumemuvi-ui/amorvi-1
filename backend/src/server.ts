import 'dotenv/config';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import {
  createId,
  hashPassword,
  publicUser,
  readDatabase,
  verifyPassword,
  writeDatabase,
} from './store.js';

const app = express();

const port = Number(process.env.PORT ?? 4000);
const jwtSecret = process.env.JWT_SECRET ?? 'dev-only-secret';
const googleWebClientId = process.env.GOOGLE_WEB_CLIENT_ID;
const googleClient = new OAuth2Client(googleWebClientId);

app.use(cors({ origin: process.env.CORS_ORIGIN ?? true }));
app.use(express.json());

type AuthRequest = Request & { user?: { id: string } };

const distanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const earthRadius = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Missing authorization token' });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as { sub: string };
    req.user = { id: payload.sub };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid authorization token' });
  }
};

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'amorvi-backend' });
});

app.post('/auth/register', async (req, res, next) => {
  try {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1),
        age: z.number().int().min(18),
      })
      .parse(req.body);

    const database = await readDatabase();
    const email = body.email.toLowerCase();

    if (database.users.some(user => user.email === email)) {
      res.status(409).json({ error: 'Email is already registered' });
      return;
    }

    const now = new Date().toISOString();
    const user = {
      id: createId(),
      email,
      passwordHash: hashPassword(body.password),
      googleId: null,
      name: body.name,
      age: body.age,
      bio: '',
      interests: [],
      goals: [],
      latitude: null,
      longitude: null,
      images: [],
      createdAt: now,
      updatedAt: now,
    };

    database.users.push(user);
    await writeDatabase(database);

    const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '30d' });
    res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post('/auth/login', async (req, res, next) => {
  try {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(1),
      })
      .parse(req.body);

    const database = await readDatabase();
    const user = database.users.find(
      candidate => candidate.email === body.email.toLowerCase(),
    );

    if (!user || !user.passwordHash || !verifyPassword(body.password, user.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '30d' });
    res.json({ token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post('/auth/google', async (req, res, next) => {
  try {
    if (!googleWebClientId) {
      res.status(500).json({ error: 'GOOGLE_WEB_CLIENT_ID is not configured' });
      return;
    }

    const body = z
      .object({
        idToken: z.string().min(1),
      })
      .parse(req.body);

    const ticket = await googleClient.verifyIdToken({
      idToken: body.idToken,
      audience: googleWebClientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      res.status(401).json({ error: 'Google account did not return a valid profile' });
      return;
    }

    const database = await readDatabase();
    const email = payload.email.toLowerCase();
    const now = new Date().toISOString();
    let user = database.users.find(
      candidate => candidate.googleId === payload.sub || candidate.email === email,
    );

    if (user) {
      user.googleId = payload.sub;
      user.name = user.name || payload.name || email.split('@')[0];
      user.images = user.images.length > 0 || !payload.picture ? user.images : [payload.picture];
      user.updatedAt = now;
    } else {
      user = {
        id: createId(),
        email,
        passwordHash: '',
        googleId: payload.sub,
        name: payload.name || email.split('@')[0],
        age: 18,
        bio: '',
        interests: [],
        goals: [],
        latitude: null,
        longitude: null,
        images: payload.picture ? [payload.picture] : [],
        createdAt: now,
        updatedAt: now,
      };
      database.users.push(user);
    }

    await writeDatabase(database);

    const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '30d' });
    res.json({ token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.get('/me', authenticate, async (req: AuthRequest, res) => {
  const database = await readDatabase();
  const user = database.users.find(candidate => candidate.id === req.user!.id);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user: publicUser(user) });
});

app.patch('/me/location', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const body = z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
      .parse(req.body);

    const database = await readDatabase();
    const user = database.users.find(candidate => candidate.id === req.user!.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.latitude = body.latitude;
    user.longitude = body.longitude;
    user.updatedAt = new Date().toISOString();
    await writeDatabase(database);

    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.get('/users/nearby', authenticate, async (req: AuthRequest, res) => {
  const radiusMeters = Number(req.query.radius ?? 5000);
  const database = await readDatabase();
  const currentUser = database.users.find(user => user.id === req.user!.id);

  if (!currentUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (currentUser.latitude === null || currentUser.longitude === null) {
    res.status(400).json({ error: 'Set your location before searching nearby users' });
    return;
  }

  const nearby = database.users
    .filter(
      user =>
        user.id !== currentUser.id &&
        user.latitude !== null &&
        user.longitude !== null,
    )
    .map(user => ({
      ...publicUser(user),
      distance: Math.round(
        distanceMeters(
          currentUser.latitude!,
          currentUser.longitude!,
          user.latitude!,
          user.longitude!,
        ),
      ),
    }))
    .filter(user => user.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance);

  res.json({ users: nearby });
});

app.get('/matches', authenticate, async (req: AuthRequest, res) => {
  const database = await readDatabase();
  const matches = database.matches
    .filter(match => match.userAId === req.user!.id || match.userBId === req.user!.id)
    .map(match => {
      const otherUserId = match.userAId === req.user!.id ? match.userBId : match.userAId;
      const otherUser = database.users.find(user => user.id === otherUserId);

      return otherUser
        ? {
            id: match.id,
            user: publicUser(otherUser),
            createdAt: match.createdAt,
          }
        : null;
    })
    .filter(Boolean);

  res.json({ matches });
});

app.post('/messages', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const body = z
      .object({
        receiverId: z.string().min(1),
        content: z.string().min(1).max(2000),
      })
      .parse(req.body);

    const database = await readDatabase();
    const receiver = database.users.find(user => user.id === body.receiverId);

    if (!receiver) {
      res.status(404).json({ error: 'Receiver not found' });
      return;
    }

    const message = {
      id: createId(),
      senderId: req.user!.id,
      receiverId: body.receiverId,
      content: body.content,
      read: false,
      createdAt: new Date().toISOString(),
    };

    database.messages.push(message);
    await writeDatabase(database);

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: 'Invalid request', details: error.flatten() });
    return;
  }

  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Amorvi backend running at http://localhost:${port}`);
});
