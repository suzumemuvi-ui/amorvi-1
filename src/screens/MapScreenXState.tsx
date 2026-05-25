import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/Ionicons';
import { useMap } from '../context/AmorviContext';

const { width, height } = Dimensions.get('window');

/**
 * Refactored Map/Radar Screen using XState
 * Demonstrates geolocation and radar functionality
 */
const MapScreenXState = () => {
  const { state, send, context, matches } = useMap();
  const [radarAnimation] = React.useState(new Animated.Value(0));
  const mapRef = React.useRef<MapView>(null);

  const isActive = matches('active');
  const isLoading = matches('loading');
  const hasError = matches('error');

  // Start location tracking on mount
  useEffect(() => {
    startLocationTracking();
  }, []);

  // Animate radar
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(radarAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(radarAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const startLocationTracking = () => {
    send({ type: 'ENABLE_RADAR' });

    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        send({
          type: 'UPDATE_LOCATION',
          payload: { latitude, longitude },
        });
      },
      error => {
        console.error('Geolocation error:', error);
        Alert.alert(
          'Location Error',
          'Unable to get your location. Please enable location services.'
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    // Watch position updates
    const watchId = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        send({
          type: 'UPDATE_LOCATION',
          payload: { latitude, longitude },
        });
      },
      error => console.error('Watch error:', error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 5000 }
    );

    return () => Geolocation.clearWatch(watchId);
  };

  const handleRadarToggle = () => {
    if (isActive) {
      send({ type: 'DISABLE_RADAR' });
    } else {
      send({ type: 'ENABLE_RADAR' });
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    send({ type: 'SET_RADIUS', payload: newRadius });
  };

  const handleRefresh = () => {
    send({ type: 'REFRESH' });
  };

  const handleNearbyUserTap = (userId: string) => {
    // Handle user tap
    Alert.alert('User', `Selected user: ${userId}`);
  };

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B9D" />
          <Text style={styles.loadingText}>Loading nearby users...</Text>
        </View>
      </View>
    );
  }

  // Render error state
  if (hasError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color="#FF4444" />
          <Text style={styles.errorText}>
            {context.error || 'Failed to load nearby users'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const userLocation = context.userLocation;
  const defaultLocation = {
    latitude: 42.9978,
    longitude: 21.428,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={
          userLocation
            ? {
                ...userLocation,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }
            : defaultLocation
        }
      >
        {/* User Location Marker */}
        {userLocation && (
          <>
            <Marker
              coordinate={userLocation}
              title="You"
              pinColor="#FF6B9D"
            >
              <View style={styles.userMarker}>
                <Icon name="person" size={16} color="#fff" />
              </View>
            </Marker>

            {/* Radar Circle */}
            {isActive && (
              <Circle
                center={userLocation}
                radius={context.radarRadius}
                fillColor="rgba(255, 107, 157, 0.1)"
                strokeColor="rgba(255, 107, 157, 0.3)"
                strokeWidth={2}
              />
            )}

            {/* Nearby Users Markers */}
            {context.nearbyUsers.map((user: any) => (
              <Marker
                key={user.id}
                coordinate={{
                  latitude: user.latitude,
                  longitude: user.longitude,
                }}
                title={user.userId}
                onPress={() => handleNearbyUserTap(user.userId)}
              >
                <TouchableOpacity
                  style={styles.userMarker}
                  onPress={() => handleNearbyUserTap(user.userId)}
                >
                  <Icon name="heart" size={16} color="#FF69B4" />
                </TouchableOpacity>
              </Marker>
            ))}
          </>
        )}
      </MapView>

      {/* Radar Pulse Animation */}
      {isActive && userLocation && (
        <Animated.View
          style={[
            styles.radarPulse,
            {
              transform: [
                {
                  scale: radarAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.5],
                  }),
                },
              ],
              opacity: radarAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 0],
              }),
            },
          ]}
        />
      )}

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        {/* Radar Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Radar</Text>
          <View
            style={[
              styles.statusIndicator,
              isActive && styles.statusActive,
            ]}
          >
            <Icon
              name={isActive ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={isActive ? '#00D084' : '#999'}
            />
          </View>
        </View>

        {/* Radius Slider */}
        <View style={styles.radiusContainer}>
          <Text style={styles.radiusLabel}>
            Range: {(context.radarRadius / 1000).toFixed(1)}km
          </Text>
          <View style={styles.buttonRow}>
            {[500, 1000, 2000, 5000].map(radius => (
              <TouchableOpacity
                key={radius}
                style={[
                  styles.radiusButton,
                  context.radarRadius === radius && styles.radiusButtonActive,
                ]}
                onPress={() => handleRadiusChange(radius)}
              >
                <Text
                  style={[
                    styles.radiusButtonText,
                    context.radarRadius === radius &&
                      styles.radiusButtonTextActive,
                  ]}
                >
                  {radius / 1000}km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Toggle & Refresh Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isActive ? styles.activeButton : styles.inactiveButton,
            ]}
            onPress={handleRadarToggle}
          >
            <Icon
              name={isActive ? 'radio' : 'radio-outline'}
              size={24}
              color="#fff"
            />
            <Text style={styles.buttonText}>
              {isActive ? 'Radar On' : 'Radar Off'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={isLoading}
          >
            <Icon name="refresh" size={24} color="#FF6B9D" />
          </TouchableOpacity>
        </View>

        {/* Debug Info */}
        {__DEV__ && (
          <Text style={styles.debugText}>
            State: {JSON.stringify(state.value)} | Users: {context.nearbyUsers.length}
          </Text>
        )}
      </View>

      {/* Nearby Users Count */}
      {isActive && (
        <View style={styles.userCountBadge}>
          <Text style={styles.userCountText}>
            {context.nearbyUsers.length} nearby
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  userMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    borderWidth: 2,
    borderColor: '#fff',
  },
  radarPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B9D',
    top: height / 2 - 20,
    left: width / 2 - 20,
    pointerEvents: 'none',
  },
  controlPanel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D1B3D',
  },
  statusIndicator: {
    padding: 4,
  },
  statusActive: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  radiusContainer: {
    marginBottom: 16,
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radiusButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  radiusButtonActive: {
    backgroundColor: '#FF6B9D',
  },
  radiusButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  radiusButtonTextActive: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#00D084',
  },
  inactiveButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
  refreshButton: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  userCountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  userCountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  debugText: {
    marginTop: 12,
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
});

export default MapScreenXState;
