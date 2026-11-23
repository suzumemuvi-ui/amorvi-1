import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export type Coordinates = {latitude: number; longitude: number};

export async function getDeviceLocation(): Promise<Coordinates> {
  if (Platform.OS === 'ios') {
    const permission = await Geolocation.requestAuthorization('whenInUse');
    if (permission !== 'granted') throw new Error('Allow location access to find people nearby.');
  } else {
    const permission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location access',
        message: 'Amorvi uses your location to find people nearby.',
        buttonPositive: 'Allow',
        buttonNegative: 'Not now',
      },
    );
    if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('Allow location access to find people nearby.');
    }
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }),
      error => reject(new Error(error.message || 'Could not read your location.')),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 30000},
    );
  });
}
