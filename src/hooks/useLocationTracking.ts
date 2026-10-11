import { useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { useAuth } from '../context/AuthContextV2';

type LocationData = {
  latitude: number;
  longitude: number;
};

export const useLocationTracking = () => {
  const { updateLocation } = useAuth();

  const [location, setLocation] =
    useState<LocationData | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const requestPermission = async (): Promise<boolean> => {
      // iOS
      if (Platform.OS === 'ios') {
        return new Promise((resolve) => {
          Geolocation.requestAuthorization(
            () => resolve(true),
            () => resolve(false)
          );
        });
      }

      // Android
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'Love Alarm needs your location to show nearby people and posts.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      );

      return (
        granted === PermissionsAndroid.RESULTS.GRANTED
      );
    };

    const getLocation = async () => {
      try {
        setError(null);

        const hasPermission =
          await requestPermission();

        if (!hasPermission) {
          if (isMounted) {
            setError('Location permission denied');
          }
          return;
        }

        Geolocation.getCurrentPosition(
          async (position) => {
            const {
              latitude,
              longitude,
            } = position.coords;

            if (!isMounted) return;

            try {
              setLocation({
                latitude,
                longitude,
              });

              await updateLocation(
                latitude,
                longitude
              );
            } catch (err) {
              if (isMounted) {
                setError(
                  err instanceof Error
                    ? err.message
                    : 'Failed to update location'
                );
              }
            }
          },
          (geoError) => {
            if (isMounted) {
              setError(geoError.message);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }
        );
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Location error'
          );
        }
      }
    };

    getLocation();

    // Update every 30 seconds
    const interval = setInterval(
      getLocation,
      30000
    );

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [updateLocation]);

  return {
    location,
    error,
  };
};
