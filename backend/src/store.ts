import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { Pool } from 'pg';

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  googleId: string | null;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  goals: string[];
  latitude: number | null;
  longitude: number | null;
  images: string[];
  city?: string;
  jobTitle?: string;
  education?: string;
  dailyRoutine?: string;
  additionalInfo?: string;
  createdAt: string;
  updatedAt: string;
};

export type Match = {
  id: string;
  userAId: string;
  userBId: string;
  status: 'matched';
  createdAt: string;
};

export type Post = {
  id: string;
  userId: string;
  images: string[];
  caption: string;
  createdAt: string;
};

export type PostLike = {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
};

export type PostComment = {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
};

export type Interested = {
  id: string;
  userId: string;
  targetUserId: string;
  createdAt: string;
};

export type Like = {
  id: string;
  userAId: string;
  userBId: string;
  createdAt: string;
};

export type Connection = {
  id: string;
  userAId: string;
  userBId: string;
  status: 'pending' | 'accepted';
  createdAt: string;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
};

export type Pass = {
  id: string;
  userId: string;
  targetUserId: string;
  createdAt: string;
};

export type Database = {
  users: User[];
  posts: Post[];
  postLikes: PostLike[];
  postComments: PostComment[];
  interested: Interested[];
  likes: Like[];
  matches: Match[];
  connections: Connection[];
  messages: Message[];
  passes: Pass[];
};

const dataPath = path.resolve(process.cwd(), process.env.DATA_FILE ?? './data/dev.json');
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, max: 3 })
  : null;

const emptyDatabase = (): Database => ({
  users: [],
  posts: [],
  postLikes: [],
  postComments: [],
  interested: [],
  likes: [],
  matches: [],
  connections: [],
  messages: [],
  passes: [],
});

export const createId = () => randomUUID();

const normalizeDatabase = (parsed: Partial<Database>): Database => ({
  users: parsed.users ?? [],
  posts: parsed.posts ?? [],
  postLikes: parsed.postLikes ?? [],
  postComments: parsed.postComments ?? [],
  interested: parsed.interested ?? [],
  likes: parsed.likes ?? [],
  matches: parsed.matches ?? [],
  connections: parsed.connections ?? [],
  messages: parsed.messages ?? [],
  passes: parsed.passes ?? [],
});

export async function initializeStore() {
  if (!pool) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL is required in production; refusing to use ephemeral file storage.');
    }
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS amorvi_state (
      singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(
    'INSERT INTO amorvi_state (singleton, data) VALUES (TRUE, $1::jsonb) ON CONFLICT (singleton) DO NOTHING',
    [JSON.stringify(emptyDatabase())],
  );
}

export const hashPassword = (password: string) => {
  const salt = randomUUID();
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, storedHash: string) => {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;

  const hashBuffer = Buffer.from(hash, 'hex');
  const passwordBuffer = scryptSync(password, salt, 64);
  return timingSafeEqual(hashBuffer, passwordBuffer);
};

export async function readDatabase(): Promise<Database> {
  if (pool) {
    const result = await pool.query<{ data: Partial<Database> }>(
      'SELECT data FROM amorvi_state WHERE singleton = TRUE',
    );
    return result.rows[0] ? normalizeDatabase(result.rows[0].data) : emptyDatabase();
  }

  try {
    const raw = await readFile(dataPath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<Database>;
    return normalizeDatabase(parsed);
  } catch {
    return emptyDatabase();
  }
}

export async function writeDatabase(database: Database) {
  if (pool) {
    await pool.query(
      `INSERT INTO amorvi_state (singleton, data, updated_at)
       VALUES (TRUE, $1::jsonb, NOW())
       ON CONFLICT (singleton) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [JSON.stringify(database)],
    );
    return;
  }

  await mkdir(path.dirname(dataPath), { recursive: true });
  await writeFile(dataPath, JSON.stringify(database, null, 2));
}

export const publicUser = (user: User) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  age: user.age,
  bio: user.bio,
  interests: user.interests,
  goals: user.goals,
  location:
    user.latitude !== null && user.longitude !== null
      ? { latitude: user.latitude, longitude: user.longitude }
      : null,
  images: user.images,
  city: user.city ?? '',
  jobTitle: user.jobTitle ?? '',
  education: user.education ?? '',
  dailyRoutine: user.dailyRoutine ?? '',
  additionalInfo: user.additionalInfo ?? '',
  createdAt: user.createdAt,
});
