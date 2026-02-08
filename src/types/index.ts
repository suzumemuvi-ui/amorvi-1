export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  images: string[];
  distance?: number;
  followers?: number;
  following?: number;
  likes?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Match {
  id: string;
  user: User;
  matchDate: Date;
  lastMessage?: string;
  lastMessageDate?: Date;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
}
