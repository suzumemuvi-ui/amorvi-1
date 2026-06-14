/**
 * Radar Modes Service
 * Manages different radar types and filtering logic
 */

export type RadarMode = 'love' | 'friend' | 'business' | 'event';

export interface RadarModeConfig {
  name: string;
  icon: string;
  color: string;
  description: string;
  filterGoals: string[];
}

export const RADAR_MODES: { [key in RadarMode]: RadarModeConfig } = {
  love: {
    name: 'Love Radar',
    icon: 'heart',
    color: '#FF6B9D',
    description: 'Find romantic connections',
    filterGoals: ['relationship', 'dating'],
  },
  friend: {
    name: 'Friend Radar',
    icon: 'people',
    color: '#4CAF50',
    description: 'Make new friends',
    filterGoals: ['friendship', 'hangout'],
  },
  business: {
    name: 'Business Radar',
    icon: 'briefcase',
    color: '#2196F3',
    description: 'Professional networking',
    filterGoals: ['networking', 'business'],
  },
  event: {
    name: 'Event Radar',
    icon: 'star',
    color: '#FFC107',
    description: 'Find event attendees',
    filterGoals: ['events', 'activities'],
  },
};

export interface InterestZone {
  id: string;
  name: string;
  interest: string;
  icon: string;
  color: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
}

// Predefined interest zones
export const INTEREST_ZONES: InterestZone[] = [
  {
    id: 'fitness-zone',
    name: 'Fitness Zone',
    interest: 'fitness',
    icon: '🏋️',
    color: '#FF5722',
    latitude: 41.9965,
    longitude: 21.428,
    radius: 500,
  },
  {
    id: 'coffee-zone',
    name: 'Coffee Lovers',
    interest: 'coffee',
    icon: '☕',
    color: '#795548',
    latitude: 42.0015,
    longitude: 21.4261,
    radius: 400,
  },
  {
    id: 'gaming-zone',
    name: 'Gaming Hub',
    interest: 'gaming',
    icon: '🎮',
    color: '#9C27B0',
    latitude: 41.9931,
    longitude: 21.4301,
    radius: 600,
  },
  {
    id: 'travel-zone',
    name: 'Travelers',
    interest: 'travel',
    icon: '✈️',
    color: '#2196F3',
    latitude: 41.9981,
    longitude: 21.4254,
    radius: 800,
  },
];

/**
 * Filter users by radar mode
 */
export function filterByRadarMode(
  users: any[],
  mode: RadarMode
): any[] {
  const config = RADAR_MODES[mode];
  return users.filter(user =>
    user.goals?.some((goal: string) =>
      config.filterGoals.includes(goal)
    )
  );
}

/**
 * Get interest zones relevant to user
 */
export function getRelevantZones(
  userInterests: string[]
): InterestZone[] {
  return INTEREST_ZONES.filter(zone =>
    userInterests.some(interest =>
      interest.toLowerCase().includes(zone.interest) ||
      zone.interest.includes(interest.toLowerCase())
    )
  );
}

/**
 * Check if user is in zone
 */
export function isUserInZone(
  userLat: number,
  userLon: number,
  zone: InterestZone
): boolean {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((zone.latitude - userLat) * Math.PI) / 180;
  const dLon = ((zone.longitude - userLon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLat * Math.PI) / 180) *
      Math.cos((zone.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= zone.radius;
}

/**
 * Get users in a specific zone
 */
export function getUsersInZone(
  users: any[],
  zone: InterestZone
): any[] {
  return users.filter(user =>
    isUserInZone(user.latitude, user.longitude, zone)
  );
}
