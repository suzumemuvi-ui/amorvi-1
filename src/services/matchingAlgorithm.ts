/**
 * Matching Algorithm Service
 * Calculates compatibility score between users based on multiple factors
 */

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  interests: string[];
  goals: string[]; // 'relationship', 'dating', 'networking', 'friendship'
  lastActive: Date;
  latitude: number;
  longitude: number;
}

export interface MatchScore {
  userId: string;
  matchPercentage: number;
  reasons: string[];
  distance: number; // in meters
}

// Interest weights
const INTEREST_WEIGHTS: { [key: string]: number } = {
  fitness: 25,
  travel: 20,
  dogs: 15,
  gaming: 10,
  cooking: 8,
  art: 7,
  music: 10,
  sports: 12,
  reading: 8,
  tech: 9,
};

/**
 * Calculate distance between two coordinates in meters
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate interest compatibility (0-25%)
 */
function calculateInterestScore(
  userInterests: string[],
  otherInterests: string[]
): number {
  if (userInterests.length === 0 || otherInterests.length === 0) {
    return 0;
  }

  const commonInterests = userInterests.filter(i => otherInterests.includes(i));
  const maxPossibleScore = Math.min(userInterests.length, otherInterests.length);
  
  if (maxPossibleScore === 0) return 0;
  
  const matchRatio = commonInterests.length / maxPossibleScore;
  return matchRatio * 25; // 25% max for interests
}

/**
 * Calculate location bonus (0-15%)
 */
function calculateLocationBonus(distanceMeters: number): number {
  if (distanceMeters < 500) return 15; // 500m = max bonus
  if (distanceMeters < 1000) return 12;
  if (distanceMeters < 2000) return 8;
  if (distanceMeters < 5000) return 4;
  return 0;
}

/**
 * Calculate activity bonus (0-10%)
 */
function calculateActivityBonus(lastActive: Date): number {
  const now = new Date();
  const hoursAgo = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
  
  if (hoursAgo < 1) return 10; // Active right now
  if (hoursAgo < 6) return 8;
  if (hoursAgo < 24) return 5;
  return 0;
}

/**
 * Calculate goals compatibility (0-20%)
 */
function calculateGoalsScore(
  userGoals: string[],
  otherGoals: string[]
): number {
  const commonGoals = userGoals.filter(g => otherGoals.includes(g));
  
  if (commonGoals.length === 0) return 0;
  if (commonGoals.length >= 2) return 20; // Full score if 2+ goals match
  
  return 10; // 50% if only 1 goal matches
}

/**
 * Main matching score calculation
 */
export function calculateMatchScore(
  currentUser: UserProfile,
  otherUser: UserProfile
): MatchScore {
  const distance = calculateDistance(
    currentUser.latitude,
    currentUser.longitude,
    otherUser.latitude,
    otherUser.longitude
  );

  let score = 0;
  const reasons: string[] = [];

  // Interest score (0-25%)
  const interestScore = calculateInterestScore(
    currentUser.interests,
    otherUser.interests
  );
  score += interestScore;
  if (interestScore > 10) {
    reasons.push(`${Math.round(interestScore)}% shared interests`);
  }

  // Goals score (0-20%)
  const goalsScore = calculateGoalsScore(currentUser.goals, otherUser.goals);
  score += goalsScore;
  if (goalsScore > 0) {
    reasons.push('Matching life goals');
  }

  // Location bonus (0-15%)
  const locationBonus = calculateLocationBonus(distance);
  score += locationBonus;

  // Activity bonus (0-10%)
  const activityBonus = calculateActivityBonus(otherUser.lastActive);
  score += activityBonus;
  if (activityBonus > 5) {
    reasons.push('Recently active');
  }

  // Age compatibility (0-5%)
  const ageDiff = Math.abs(currentUser.age - otherUser.age);
  const ageBonus = Math.max(0, 5 - ageDiff * 0.5);
  score += ageBonus;

  // Cap at 100
  score = Math.min(100, score);

  // Add distance reason
  if (distance < 1000) {
    reasons.push(`${Math.round(distance)}m away`);
  } else {
    reasons.push(`${(distance / 1000).toFixed(1)}km away`);
  }

  return {
    userId: otherUser.id,
    matchPercentage: Math.round(score),
    reasons,
    distance,
  };
}

/**
 * Get marker color based on match percentage
 */
export function getMarkerColor(matchPercentage: number): string {
  if (matchPercentage >= 85) return '#4CAF50'; // Green - very high match
  if (matchPercentage >= 60) return '#FFC107'; // Yellow - medium match
  return '#F44336'; // Red - low match
}

/**
 * Generate privacy bubble offset (100-300m random offset)
 */
export function generatePrivacyBubbleOffset(): {
  latOffset: number;
  lonOffset: number;
} {
  const offsetMeters = Math.random() * 200 + 100; // 100-300m
  const angle = Math.random() * Math.PI * 2; // Random direction

  // Approximate conversion: 1 degree = 111km
  const offsetDegrees = offsetMeters / 111000;

  return {
    latOffset: Math.cos(angle) * offsetDegrees,
    lonOffset: Math.sin(angle) * offsetDegrees,
  };
}

/**
 * Obfuscate user location with privacy bubble
 */
export function obfuscateLocation(
  latitude: number,
  longitude: number
): { latitude: number; longitude: number } {
  const offset = generatePrivacyBubbleOffset();
  return {
    latitude: latitude + offset.latOffset,
    longitude: longitude + offset.lonOffset,
  };
}

/**
 * Check if users should trigger Mutual Radar
 */
export function shouldTriggerMutualRadar(
  matchPercentage: number,
  distanceMeters: number
): boolean {
  return matchPercentage >= 85 && distanceMeters <= 1000;
}
