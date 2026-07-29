import { User, Match } from '../types';

export const currentUser: User = {
  id: '1',
  name: 'Emily',
  age: 22,
  bio: 'Looking good! 😋',
  images: [
    'https://picsum.photos/400/600?random=1',
    'https://picsum.photos/400/600?random=2',
    'https://picsum.photos/400/600?random=3',
    'https://picsum.photos/400/600?random=4',
    'https://picsum.photos/400/600?random=5',
    'https://picsum.photos/400/600?random=6',
  ],
  followers: 15200,
  following: 230,
  likes: 615,
  city: 'San Francisco',
  jobTitle: 'Marketing Specialist',
  education: 'BA in Communications',
  interests: ['Travel', 'Cooking', 'Yoga', 'Live Music'],
  additionalInfo: ['Non-smoker', 'Pet lover', 'Looking for something serious'],
  location: {
    latitude: 37.78825,
    longitude: -122.4324,
  },
};

export const users: User[] = [
  {
    id: '2',
    name: 'Alex',
    age: 23,
    bio: 'Adventure seeker 🌍',
    images: [
      'https://picsum.photos/400/600?random=10',
      'https://picsum.photos/400/600?random=11',
    ],
    distance: 2,
    followers: 8500,
    likes: 1100,
    location: {
      latitude: 37.79025,
      longitude: -122.435,
    },
  },
  {
    id: '3',
    name: 'Sarah',
    age: 24,
    bio: 'Coffee lover ☕',
    images: [
      'https://picsum.photos/400/600?random=20',
      'https://picsum.photos/400/600?random=21',
    ],
    distance: 5,
    followers: 12300,
    likes: 2400,
    location: {
      latitude: 37.78625,
      longitude: -122.43,
    },
  },
  {
    id: '4',
    name: 'Michael',
    age: 26,
    bio: 'Fitness enthusiast 💪',
    images: [
      'https://picsum.photos/400/600?random=30',
      'https://picsum.photos/400/600?random=31',
    ],
    distance: 3,
    followers: 9800,
    likes: 1800,
    location: {
      latitude: 37.79125,
      longitude: -122.429,
    },
  },
];

export const matches: Match[] = [
  {
    id: '1',
    user: users[0],
    matchDate: new Date('2026-01-20'),
    lastMessage: 'Hey Emily! Pretty good, you?',
    lastMessageDate: new Date('2026-01-22T10:30:00'),
  },
  {
    id: '2',
    user: users[1],
    matchDate: new Date('2026-01-19'),
    lastMessage: 'Would love to!',
    lastMessageDate: new Date('2026-01-21T14:20:00'),
  },
];

export const messages = [
  {
    id: '1',
    text: 'Hi alex! How is it going? 😊',
    senderId: '1',
    timestamp: new Date('2026-01-22T10:25:00'),
  },
  {
    id: '2',
    text: 'Hey Emily! Pretty good, you?',
    senderId: '2',
    timestamp: new Date('2026-01-22T10:30:00'),
  },
  {
    id: '3',
    text: 'now handsome kneel! 😂',
    senderId: '3',
    timestamp: new Date('2026-01-22T10:35:00'),
  },
];
