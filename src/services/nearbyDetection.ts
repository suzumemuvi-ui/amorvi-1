import { Platform, PermissionsAndroid, Linking, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { NativeModules } from 'react-native';

const { RNAndroidLocationEnabler } = NativeModules;

export interface NearbyUser {
  id: string;
  name: string;
  distance: number;
  latitude: number;
  longitude: number;
}

// Calculate distance between two coordinates in meters
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance in meters
}

// Check if location services are enabled on device
export const checkLocationEnabled = (): Promise<boolean> => {
  return new Promise(resolve => {
    Geolocation.getCurrentPosition(
      () => {
        resolve(true);
      },
      error => {
        if (error.code === 2) {
          // POSITION_UNAVAILABLE - GPS is off
          resolve(false);
        } else {
          resolve(true);
        }
      },
      { enableHighAccuracy: false, timeout: 2000, maximumAge: 0 },
    );
  });
};

// Prompt user to enable location services
export const promptEnableLocation = (): Promise<boolean> => {
  return new Promise(resolve => {
    Alert.alert(
      'Enable Location Services',
      'Please turn on location services to find nearby users.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'android') {
              Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
            } else {
              Linking.openURL('app-settings:');
            }
            resolve(false);
          },
        },
      ],
    );
  });
};

// Request location permission
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    // iOS permissions are handled in Info.plist
    return true;
  }

  try {
    // Check current permission status first
    const checkPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (checkPermission) {
      return true;
    }

    // Request permission
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Love Alarm Location Permission',
        message:
          'Love Alarm needs access to your location to find nearby users',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Location permission granted');
      return true;
    } else {
      console.log('Location permission denied');
      return false;
    }
  } catch (err) {
    console.warn('Permission error:', err);
    return false;
  }
};

// Get current location
export const getCurrentLocation = (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      async error => {
        console.error('Location error:', error);

        // Check if location services are enabled
        const isEnabled = await checkLocationEnabled();
        if (!isEnabled) {
          await promptEnableLocation();
          return [];
        }

        //  // Check if location services are disabled
        if (error.code === 2) {
          // POSITION_UNAVAILABLE
          Alert.alert(
            'Location Services Disabled',
            'Please enable location services in your device settings to use Love Alarm.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                },
              },
            ],
          );
        }

        reject(error);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 },
    );
  });
};

// Mock users database - In production, this would be a backend API
const mockUsersDatabase: Array<{
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}> = [
  { id: '2', name: 'Alex', latitude: 37.78825, longitude: -122.4324 },
  { id: '3', name: 'Sarah', latitude: 37.78925, longitude: -122.4334 },
  { id: '4', name: 'Michael', latitude: 37.78725, longitude: -122.4314 },
  { id: '5', name: 'Emma', latitude: 37.78625, longitude: -122.4344 },
];

// Find nearby users within a certain radius
export const findNearbyUsers = async (
  radiusMeters: number = 100,
): Promise<NearbyUser[]> => {
  try {
    // Get user's current location
    const userLocation = await getCurrentLocation();

    // Calculate distance to all users and filter by radius
    const nearbyUsers = mockUsersDatabase
      .map(user => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          user.latitude,
          user.longitude,
        );
        return {
          ...user,
          distance,
        };
      })
      .filter(user => user.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);

    return nearbyUsers;
  } catch (error) {
    console.error('Error finding nearby users:', error);
    return [];
  }
};

// Simulated real-time detection - In production, use WebSocket or Firebase
export const startNearbyUserDetection = (
  onUsersFound: (users: NearbyUser[]) => void,
  radiusMeters: number = 100,
): (() => void) => {
  let isActive = true;

  const detectUsers = async () => {
    if (!isActive) return;

    try {
      const users = await findNearbyUsers(radiusMeters);
      onUsersFound(users);
    } catch (error) {
      console.error('Detection error:', error);
    }

    // Check again in 5 seconds if still active
    if (isActive) {
      setTimeout(detectUsers, 5000);
    }
  };

  // Start detection
  detectUsers();

  // Return cleanup function
  return () => {
    isActive = false;
  };
};

// For production: Connect to your backend API
export const connectToBackend = async (
  userId: string,
  latitude: number,
  longitude: number,
): Promise<void> => {
  // Example: Send location to backend
  /*
  try {
    await fetch('https://your-api.com/users/location', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        userId,
        latitude,
        longitude,
        timestamp: Date.now(),
      }),
    });
  } catch (error) {
    console.error('Backend connection error:', error);
  }
  */
};
