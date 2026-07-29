import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';

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

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
};

export type Database = {
  users: User[];
  matches: Match[];
  messages: Message[];
};

const dataPath = path.resolve(process.cwd(), process.env.DATA_FILE ?? './data/dev.json');

const emptyDatabase = (): Database => ({
  users: [],
  matches: [],
  messages: [],
});

export const createId = () => randomUUID();

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
  try {
    const raw = await readFile(dataPath, 'utf8');
    return JSON.parse(raw) as Database;
  } catch {
    return emptyDatabase();
  }
}

export async function writeDatabase(database: Database) {
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
});
