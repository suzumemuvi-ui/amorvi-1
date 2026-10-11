export interface InterestedProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  images: string[];
  city?: string;
  distance: number;
  interests?: string[];
}

export interface MatchedProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  image: string;
  city?: string;
  distance: number;
  lastMessage?: string;
}

export interface FriendConnection {
  id: string;
  name: string;
  age: number;
  bio: string;
  image: string;
  city?: string;
  distance: number;
  status: 'pending' | 'accepted';
}

const interestedProfilesMap = new Map<string, InterestedProfile>();
const likedByMeSet = new Set<string>();
const mutualLikeSet = new Set<string>(['2', '4']);
const matchedUsersMap = new Map<string, MatchedProfile>();
const friendConnectionsMap = new Map<string, FriendConnection>();

export function addInterestedProfile(profile: InterestedProfile) {
  interestedProfilesMap.set(profile.id, profile);
}

export function removeInterestedProfile(profileId: string) {
  interestedProfilesMap.delete(profileId);
}

export function getInterestedProfiles(): InterestedProfile[] {
  return Array.from(interestedProfilesMap.values());
}

export function hasInterestedProfile(profileId: string): boolean {
  return interestedProfilesMap.has(profileId);
}

export function markLike(profileId: string) {
  likedByMeSet.add(profileId);
}

export function isLikedByMe(profileId: string): boolean {
  return likedByMeSet.has(profileId);
}

export function hasMutualLike(profileId: string): boolean {
  return mutualLikeSet.has(profileId);
}

export function registerMatch(
  profile:
    | MatchedProfile
    | InterestedProfile
    | {
        id: string;
        name: string;
        age: number;
        bio?: string;
        image?: string;
        city?: string;
        distance?: number;
        images?: string[];
      },
) {
  const candidate = profile as any;
  const normalizedProfile: MatchedProfile = {
    id: candidate.id,
    name: candidate.name,
    age: candidate.age,
    bio: candidate.bio || 'New match',
    image:
      candidate.image ||
      candidate.images?.[0] ||
      'https://picsum.photos/800/1000?random=42',
    city: candidate.city || 'Nearby',
    distance: candidate.distance ?? 1.4,
    lastMessage: 'Hey! I was hoping you would message me!',
  };

  matchedUsersMap.set(normalizedProfile.id, normalizedProfile);
}

export function getMatchedProfiles(): MatchedProfile[] {
  if (matchedUsersMap.size === 0) {
    const defaultMatches: MatchedProfile[] = [
      {
        id: '2',
        name: 'Alex',
        age: 23,
        bio: 'Adventure seeker 🌍',
        image: 'https://picsum.photos/800/1000?random=10',
        city: 'Downtown',
        distance: 2.3,
        lastMessage: 'Hey! I was hoping you would message me!',
      },
      {
        id: '4',
        name: 'Michael',
        age: 26,
        bio: 'Fitness enthusiast 💪',
        image: 'https://picsum.photos/800/1000?random=30',
        city: 'Old Town',
        distance: 1.1,
        lastMessage: 'Want to grab coffee this week?',
      },
    ];

    defaultMatches.forEach(match => matchedUsersMap.set(match.id, match));
  }

  return Array.from(matchedUsersMap.values());
}

export function isMatched(profileId: string): boolean {
  return matchedUsersMap.has(profileId);
}

export function addConnectionRequest(profile: {
  id: string;
  name: string;
  age: number;
  bio?: string;
  image?: string;
  city?: string;
  distance?: number;
}) {
  friendConnectionsMap.set(profile.id, {
    id: profile.id,
    name: profile.name,
    age: profile.age,
    bio: profile.bio || 'Looking to connect',
    image:
      profile.image ||
      'https://picsum.photos/800/1000?random=50',
    city: profile.city || 'Nearby',
    distance: profile.distance ?? 1.4,
    status: 'pending',
  });
}

export function acceptConnection(profileId: string) {
  const existing = friendConnectionsMap.get(profileId);
  if (!existing) return;

  friendConnectionsMap.set(profileId, {
    ...existing,
    status: 'accepted',
  });
}

export function getFriendConnections(): FriendConnection[] {
  if (friendConnectionsMap.size === 0) {
    const defaultConnections: FriendConnection[] = [
      {
        id: 'p2',
        name: 'Noah',
        age: 27,
        bio: 'Weekend adventures and good playlists',
        image: 'https://picsum.photos/800/1000?random=202',
        city: 'Old Town',
        distance: 1.8,
        status: 'accepted',
      },
    ];

    defaultConnections.forEach(connection => friendConnectionsMap.set(connection.id, connection));
  }

  return Array.from(friendConnectionsMap.values());
}

export function getPendingConnections(): FriendConnection[] {
  return getFriendConnections().filter(connection => connection.status === 'pending');
}

export function getAcceptedConnections(): FriendConnection[] {
  return getFriendConnections().filter(connection => connection.status === 'accepted');
}

export function hasPendingConnection(profileId: string): boolean {
  return friendConnectionsMap.get(profileId)?.status === 'pending';
}

export function hasAcceptedConnection(profileId: string): boolean {
  return friendConnectionsMap.get(profileId)?.status === 'accepted';
}
