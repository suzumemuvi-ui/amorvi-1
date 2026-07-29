import { createId, hashPassword, writeDatabase } from './store.js';

const now = new Date().toISOString();
const passwordHash = hashPassword('password123');

const emily = {
  id: createId(),
  email: 'emily@amorvi.test',
  passwordHash,
  googleId: null,
  name: 'Emily',
  age: 22,
  bio: 'Looking good!',
  interests: ['travel', 'coffee', 'music'],
  goals: ['dating', 'relationship'],
  latitude: 41.9981,
  longitude: 21.4254,
  images: ['https://picsum.photos/400/600?random=1'],
  createdAt: now,
  updatedAt: now,
};

const alex = {
  id: createId(),
  email: 'alex@amorvi.test',
  passwordHash,
  googleId: null,
  name: 'Alex',
  age: 23,
  bio: 'Adventure seeker',
  interests: ['travel', 'fitness', 'gaming'],
  goals: ['dating', 'networking'],
  latitude: 41.999,
  longitude: 21.427,
  images: ['https://picsum.photos/400/600?random=10'],
  createdAt: now,
  updatedAt: now,
};

const sara = {
  id: createId(),
  email: 'sara@amorvi.test',
  passwordHash,
  googleId: null,
  name: 'Sara',
  age: 24,
  bio: 'Coffee lover',
  interests: ['coffee', 'art', 'travel'],
  goals: ['friendship', 'dating'],
  latitude: 41.996,
  longitude: 21.423,
  images: ['https://picsum.photos/400/600?random=20'],
  createdAt: now,
  updatedAt: now,
};

await writeDatabase({
  users: [emily, alex, sara],
  matches: [
    {
      id: createId(),
      userAId: emily.id,
      userBId: alex.id,
      status: 'matched',
      createdAt: now,
    },
  ],
  messages: [
    {
      id: createId(),
      senderId: alex.id,
      receiverId: emily.id,
      content: 'Hey Emily! Pretty good, you?',
      read: false,
      createdAt: now,
    },
  ],
});

console.log('Seeded Amorvi backend.');
