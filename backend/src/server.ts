import 'dotenv/config';
import { createServer } from 'node:http';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
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
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN ?? true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const port = Number(process.env.PORT ?? 4000);
const jwtSecret = process.env.JWT_SECRET ?? 'dev-only-secret';
const googleWebClientId = process.env.GOOGLE_WEB_CLIENT_ID;
const googleClient = new OAuth2Client(googleWebClientId);

app.use(cors({ origin: process.env.CORS_ORIGIN ?? true }));
app.use(express.json());

const userSocketMap = new Map<string, Set<string>>();

type AuthRequest = Request & { user?: { id: string } };
type SocketWithUser = Socket & { user?: { id: string } };

const emitNotification = (userId: string, notification: Record<string, unknown>) => {
  io.to(userId).emit('notification', notification);
};

io.use((socket: SocketWithUser, next: (err?: Error) => void) => {
  const authHeader = socket.handshake.headers.authorization;
  const authToken = socket.handshake.auth?.token;
  const token = typeof authHeader === 'string'
    ? authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
    : typeof authToken === 'string'
      ? authToken.startsWith('Bearer ') ? authToken.slice(7) : authToken
      : null;

  if (!token) {
    next(new Error('Missing authorization token'));
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as { sub: string };
    socket.user = { id: payload.sub };
    next();
  } catch {
    next(new Error('Invalid authorization token'));
  }
});

io.on('connection', (socket: SocketWithUser) => {
  const userId = socket.user?.id;

  if (!userId) {
    socket.disconnect(true);
    return;
  }

  const roomSockets = userSocketMap.get(userId) ?? new Set<string>();
  roomSockets.add(socket.id);
  userSocketMap.set(userId, roomSockets);
  socket.join(userId);

  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
  });

  socket.on('leave_room', (roomId: string) => {
    socket.leave(roomId);
  });

  socket.on('send_message', async (data: { receiverId?: string; content?: string }) => {
    const receiverId = String(data?.receiverId ?? '');
    const content = String(data?.content ?? '').trim();

    if (!receiverId || !content) {
      socket.emit('message_error', { error: 'Receiver and content are required' });
      return;
    }

    const database = await readDatabase();
    const sender = database.users.find(candidate => candidate.id === userId);
    const receiver = database.users.find(candidate => candidate.id === receiverId);

    if (!sender || !receiver) {
      socket.emit('message_error', { error: 'Receiver not found' });
      return;
    }

    const message = {
      id: createId(),
      senderId: userId,
      receiverId,
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };

    database.messages.push(message);
    await writeDatabase(database);

    io.to(receiverId).emit('message_received', { message });
    emitNotification(receiverId, {
      type: 'message',
      title: 'New message',
      body: `${sender.name} sent you a message`,
      data: { senderId: userId, receiverId },
    });
    socket.emit('message_sent', { message });
  });

  socket.on('send_match_notification', async (data: { userId?: string; message?: string }) => {
    const targetUserId = String(data?.userId ?? '');
    const message = String(data?.message ?? 'You matched with someone new!');

    if (!targetUserId) {
      return;
    }

    emitNotification(targetUserId, {
      type: 'match',
      title: 'New match',
      body: message,
      data: { userId: targetUserId },
    });
  });

  socket.on('disconnect', () => {
    const sockets = userSocketMap.get(userId);
    if (!sockets) {
      return;
    }
    sockets.delete(socket.id);
    if (sockets.size === 0) {
      userSocketMap.delete(userId);
    } else {
      userSocketMap.set(userId, sockets);
    }
  });
});

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
    email: z.string().trim().email(),
    password: z.string().min(8),
    name: z.string().trim().min(1),
    age: z.coerce.number().int().min(18),
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
    console.log('LOGIN BODY:', req.body);

    const body = z
      .object({
        email: z.string().trim().email(),
        password: z.string().min(1),
      })
      .parse(req.body);

    const database = await readDatabase();

    const user = database.users.find(
      candidate =>
        candidate.email.toLowerCase() === body.email.toLowerCase(),
    );

    if (
      !user ||
      !user.passwordHash ||
      !verifyPassword(body.password, user.passwordHash)
    ) {
      res.status(401).json({
        error: 'Invalid email or password',
      });
      return;
    }

    const token = jwt.sign(
      { sub: user.id },
      jwtSecret,
      { expiresIn: '30d' },
    );

    res.json({
      token,
      user: publicUser(user),
    });
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

app.patch('/me/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const body = z
      .object({
        name: z.string().trim().min(1).optional(),
        age: z.coerce.number().int().min(18).optional(),
        bio: z.string().trim().optional(),
        interests: z.array(z.string()).optional(),
        goals: z.array(z.string()).optional(),
        images: z.array(z.string()).optional(),
      })
      .parse(req.body);

    const database = await readDatabase();
    const user = database.users.find(candidate => candidate.id === req.user!.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (body.name) user.name = body.name;
    if (body.age) user.age = body.age;
    if (body.bio !== undefined) user.bio = body.bio;
    if (body.interests) user.interests = body.interests;
    if (body.goals) user.goals = body.goals;
    if (body.images) user.images = body.images;
    user.updatedAt = new Date().toISOString();

    await writeDatabase(database);

    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post('/posts', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const body = z
      .object({
        images: z.array(z.string()).min(1),
        caption: z.string().trim().max(500),
      })
      .parse(req.body);

    const database = await readDatabase();

    const post = {
      id: createId(),
      userId: req.user!.id,
      images: body.images,
      caption: body.caption,
      createdAt: new Date().toISOString(),
    };

    database.posts.push(post);
    await writeDatabase(database);

    res.status(201).json({ post });
  } catch (error) {
    next(error);
  }
});

app.patch('/posts/:postId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const body = z
      .object({
        caption: z.string().trim().max(500),
      })
      .parse(req.body);

    const database = await readDatabase();
    const post = database.posts.find(p => p.id === req.params.postId);

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.userId !== req.user!.id) {
      res.status(403).json({ error: 'You can only edit your own posts' });
      return;
    }

    post.caption = body.caption;
    await writeDatabase(database);

    res.json({ post });
  } catch (error) {
    next(error);
  }
});

app.delete('/posts/:postId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const database = await readDatabase();
    const postIndex = database.posts.findIndex(p => p.id === req.params.postId);

    if (postIndex === -1) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const post = database.posts[postIndex];

    if (post.userId !== req.user!.id) {
      res.status(403).json({ error: 'You can only delete your own posts' });
      return;
    }

    database.posts.splice(postIndex, 1);
    database.postLikes = database.postLikes.filter(like => like.postId !== post.id);
    database.postComments = database.postComments.filter(comment => comment.postId !== post.id);

    await writeDatabase(database);

    res.json({ message: 'Post deleted successfully' });
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

// Social feed and post interactions
app.get('/feed', authenticate, async (req: AuthRequest, res) => {
  const database = await readDatabase();
  const posts = database.posts
    .filter(post => post.userId !== req.user!.id)
    .map(post => {
      const author = database.users.find(user => user.id === post.userId);
      if (!author) return null;
      return {
        ...post,
        user: publicUser(author),
        likes: database.postLikes.filter(like => like.postId === post.id).length,
        comments: database.postComments.filter(comment => comment.postId === post.id).length,
        liked: database.postLikes.some(like => like.postId === post.id && like.userId === req.user!.id),
        interested: database.interested.some(item => item.userId === req.user!.id && item.targetUserId === post.userId),
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ posts });
});

app.post('/posts/:postId/like', authenticate, async (req: AuthRequest, res) => {
  const database = await readDatabase();
  const post = database.posts.find(item => item.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const index = database.postLikes.findIndex(item => item.postId === post.id && item.userId === req.user!.id);
  let liked = false;
  if (index >= 0) database.postLikes.splice(index, 1);
  else {
    database.postLikes.push({ id: createId(), userId: req.user!.id, postId: post.id, createdAt: new Date().toISOString() });
    liked = true;
  }
  await writeDatabase(database);
  res.json({ liked, likes: database.postLikes.filter(item => item.postId === post.id).length });
});

app.post('/posts/:postId/comments', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const body = z.object({ content: z.string().trim().min(1).max(500) }).parse(req.body);
    const database = await readDatabase();
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    if (!database.posts.some(item => item.id === postId)) return res.status(404).json({ error: 'Post not found' });
    const comment: { id: string; userId: string; postId: string; content: string; createdAt: string } = {
      id: createId(),
      userId: req.user!.id,
      postId,
      content: body.content,
      createdAt: new Date().toISOString(),
    };
    database.postComments.push(comment);
    await writeDatabase(database);
    res.status(201).json({ comment });
  } catch (error) { next(error); }
});

// Amorvi: saved profiles, likes/matches, and received likes
app.get('/interested', authenticate, async (req: AuthRequest, res) => {
  const database = await readDatabase();
  const profiles = database.interested
    .filter(item => item.userId === req.user!.id)
    .map(item => database.users.find(user => user.id === item.targetUserId))
    .filter((user): user is NonNullable<typeof user> => Boolean(user))
    .map(publicUser);
  res.json({ profiles });
});

app.post('/interested/:userId', authenticate, async (req: AuthRequest, res) => {
  const database = await readDatabase();
  const target = database.users.find(user => user.id === req.params.userId);
  if (!target || target.id === req.user!.id) return res.status(404).json({ error: 'Profile not found' });
  const existing = database.interested.find(item => item.userId === req.user!.id && item.targetUserId === target.id);
  if (!existing) database.interested.push({ id: createId(), userId: req.user!.id, targetUserId: target.id, createdAt: new Date().toISOString() });
  await writeDatabase(database);
  res.status(201).json({ profile: publicUser(target) });
});

app.delete('/interested/:userId', authenticate, async (req: AuthRequest, res) => {
  const database = await readDatabase();
  database.interested = database.interested.filter(item => !(item.userId === req.user!.id && item.targetUserId === req.params.userId));
  await writeDatabase(database);
  res.status(204).end();
});

app.post('/likes/:userId', authenticate, async (req: AuthRequest, res) => {
  const database = await readDatabase();
  const target = database.users.find(user => user.id === req.params.userId);
  if (!target || target.id === req.user!.id) return res.status(404).json({ error: 'Profile not found' });
  if (!database.likes.some(item => item.userAId === req.user!.id && item.userBId === target.id)) {
    database.likes.push({ id: createId(), userAId: req.user!.id, userBId: target.id, createdAt: new Date().toISOString() });
  }
  const mutual = database.likes.some(item => item.userAId === target.id && item.userBId === req.user!.id);
  let match = null as { id: string; userAId: string; userBId: string; status: 'matched'; createdAt: string } | null;
  if (mutual) {
    match = database.matches.find(item => (item.userAId === req.user!.id && item.userBId === target.id) || (item.userAId === target.id && item.userBId === req.user!.id)) ?? null;
    if (!match) {
      match = { id: createId(), userAId: req.user!.id, userBId: target.id, status: 'matched', createdAt: new Date().toISOString() };
      database.matches.push(match);

      emitNotification(req.user!.id, {
        type: 'match',
        title: 'It\'s a match!',
        body: `${target.name} liked you back`,
        data: { matchId: match.id, otherUserId: target.id },
      });
      emitNotification(target.id, {
        type: 'match',
        title: 'It\'s a match!',
        body: `${database.users.find(candidate => candidate.id === req.user!.id)?.name ?? 'Someone'} liked you back`,
        data: { matchId: match.id, otherUserId: req.user!.id },
      });
    }
  }
  await writeDatabase(database);
  res.status(201).json({ liked: true, match: Boolean(match), profile: publicUser(target) });
});

app.get('/likes/received', authenticate, async (req: AuthRequest, res) => {
  const database = await readDatabase();
  const profiles = database.likes
    .filter(item => item.userBId === req.user!.id)
    .map(item => ({ profile: database.users.find(user => user.id === item.userAId), createdAt: item.createdAt }))
    .filter(item => item.profile)
    .map(item => ({ ...publicUser(item.profile!), likedAt: item.createdAt }));
  res.json({ profiles });
});

// Connections and conversations
app.get('/connections', authenticate, async (req: AuthRequest, res) => {
  const database = await readDatabase();
  const connections = database.connections
    .filter(item => item.status === 'accepted' && (item.userAId === req.user!.id || item.userBId === req.user!.id))
    .map(item => {
      const userId = item.userAId === req.user!.id ? item.userBId : item.userAId;
      const user = database.users.find(candidate => candidate.id === userId);
      return user ? { id: item.id, user: publicUser(user), createdAt: item.createdAt } : null;
    }).filter(Boolean);
  res.json({ connections });
});

app.post('/connections/:userId', authenticate, async (req: AuthRequest, res) => {
  const database = await readDatabase();
  const target = database.users.find(user => user.id === req.params.userId);
  if (!target || target.id === req.user!.id) return res.status(404).json({ error: 'Profile not found' });
  let connection = database.connections.find(item => (item.userAId === req.user!.id && item.userBId === target.id) || (item.userAId === target.id && item.userBId === req.user!.id));
  if (!connection) {
    connection = { id: createId(), userAId: req.user!.id, userBId: target.id, status: 'accepted' as const, createdAt: new Date().toISOString() };
    database.connections.push(connection);
    emitNotification(target.id, {
      type: 'connection',
      title: 'New connection',
      body: `${database.users.find(candidate => candidate.id === req.user!.id)?.name ?? 'Someone'} accepted your connection`,
      data: { connectionId: connection.id, otherUserId: req.user!.id },
    });
    await writeDatabase(database);
  }
  res.status(201).json({ connection, user: publicUser(target) });
});

app.get('/conversations', authenticate, async (req: AuthRequest, res) => {
  const database = await readDatabase();
  const peers = new Set<string>();
  database.matches.filter(item => item.userAId === req.user!.id || item.userBId === req.user!.id).forEach(item => peers.add(item.userAId === req.user!.id ? item.userBId : item.userAId));
  database.connections.filter(item => item.status === 'accepted' && (item.userAId === req.user!.id || item.userBId === req.user!.id)).forEach(item => peers.add(item.userAId === req.user!.id ? item.userBId : item.userAId));
  const conversations = [...peers].map(userId => {
    const user = database.users.find(item => item.id === userId)!;
    const messages = database.messages.filter(item => (item.senderId === req.user!.id && item.receiverId === userId) || (item.receiverId === req.user!.id && item.senderId === userId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const latest = messages[0];
    return { user: publicUser(user), latestMessage: latest?.content ?? '', latestAt: latest?.createdAt ?? null, unread: messages.filter(item => item.receiverId === req.user!.id && !item.read).length };
  }).sort((a, b) => (b.latestAt ?? '').localeCompare(a.latestAt ?? ''));
  res.json({ conversations });
});

app.get('/messages/:userId', authenticate, async (req: AuthRequest, res) => {
  const database = await readDatabase();
  const messages = database.messages.filter(item => (item.senderId === req.user!.id && item.receiverId === req.params.userId) || (item.receiverId === req.user!.id && item.senderId === req.params.userId)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  messages.forEach(item => { if (item.receiverId === req.user!.id) item.read = true; });
  await writeDatabase(database);
  res.json({ messages });
});

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`Amorvi backend running at http://localhost:${port}`);
});
