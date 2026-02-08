import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  requestLocationPermission,
  startNearbyUserDetection,
  NearbyUser,
  checkLocationEnabled,
  promptEnableLocation,
} from '../services/nearbyDetection';

const AlarmScreen = () => {
  const [ringsCount, setRingsCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [showHearts, setShowHearts] = useState(false);
  const [detectionCleanup, setDetectionCleanup] = useState<(() => void) | null>(
    null,
  );

  // Animation values for rings
  const ring1Anim = React.useRef(new Animated.Value(1)).current;
  const ring2Anim = React.useRef(new Animated.Value(1)).current;
  const ring3Anim = React.useRef(new Animated.Value(1)).current;
  const ring4Anim = React.useRef(new Animated.Value(1)).current;

  const ring1Opacity = React.useRef(new Animated.Value(0.8)).current;
  const ring2Opacity = React.useRef(new Animated.Value(0.8)).current;
  const ring3Opacity = React.useRef(new Animated.Value(0.8)).current;
  const ring4Opacity = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start ripple animation on mount and keep it running
    const createRipple = (
      scaleAnim: Animated.Value,
      opacityAnim: Animated.Value,
      delay: number,
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1.3,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.8,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
    };

    const animations = Animated.parallel([
      createRipple(ring1Anim, ring1Opacity, 0),
      createRipple(ring2Anim, ring2Opacity, 300),
      createRipple(ring3Anim, ring3Opacity, 600),
      createRipple(ring4Anim, ring4Opacity, 900),
    ]);

    animations.start();

    return () => {
      animations.stop();
    };
  }, []); // Empty dependency array - runs once on mount

  // Cleanup detection when component unmounts
  useEffect(() => {
    return () => {
      if (detectionCleanup) {
        detectionCleanup();
      }
    };
  }, [detectionCleanup]);

  const handleAlarmPress = async () => {
    if (!isActive) {
      // Activating alarm - start detection
      setIsActive(true);

      // Request location permission
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to find nearby users',
        );
        setIsActive(false);
        return;
      }

      // Check if location services are enabled
      const isLocationEnabled = await checkLocationEnabled();
      if (!isLocationEnabled) {
        await promptEnableLocation();
        setIsActive(false);
        return;
      }

      // Start detecting nearby users
      const cleanup = startNearbyUserDetection(
        (users: NearbyUser[]) => {
          console.log('Found nearby users:', users);
          setNearbyUsers(users);
          setRingsCount(users.length);
          setShowHearts(users.length > 0);
        },
        100, // Search radius: 100 meters
      );

      setDetectionCleanup(() => cleanup);
    } else {
      // Deactivating alarm - stop detection
      if (detectionCleanup) {
        detectionCleanup();
        setDetectionCleanup(null);
      }
      setIsActive(false);
      setNearbyUsers([]);
      setShowHearts(false);
      setRingsCount(0);
    }
  };

  return (
    <LinearGradient
      colors={['#4DD0E1', '#81D4FA', '#FFB6C1', '#FFCCCB']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LoveAlarm</Text>
      </View>

      {/* Center Content */}
      <View style={styles.centerContent}>
        {/* Ripple Rings */}
        <View style={styles.ringsContainer}>
          <Animated.View
            style={[
              styles.ring,
              styles.ring1,
              {
                transform: [{ scale: ring1Anim }],
                opacity: ring1Opacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              styles.ring2,
              {
                transform: [{ scale: ring2Anim }],
                opacity: ring2Opacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              styles.ring3,
              {
                transform: [{ scale: ring3Anim }],
                opacity: ring3Opacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              styles.ring4,
              {
                transform: [{ scale: ring4Anim }],
                opacity: ring4Opacity,
              },
            ]}
          />

          {/* Hearts on Rings - shown when users are detected */}
          {showHearts &&
            nearbyUsers.map((user, index) => (
              <View
                key={index}
                style={[
                  styles.ringHeart,
                  index === 0 ? styles.ringHeart1 : styles.ringHeart2,
                ]}
              >
                <Icon name="heart" size={28} color="#FF1493" />
              </View>
            ))}

          {/* Heart Center */}
          <View style={styles.heartContainer}>
            <View style={[styles.heartCircle, isActive && styles.heartActive]}>
              {showHearts ? (
                <View style={styles.heartsWrapper}>
                  <Icon name="heart" size={50} color="#FFF" />
                </View>
              ) : (
                <Icon
                  name={isActive ? 'heart' : 'heart-outline'}
                  size={60}
                  color="#FFF"
                />
              )}
            </View>
          </View>
        </View>

        {/* Counter */}
        <Text style={styles.counter}>{ringsCount}</Text>

        {/* Distance Info */}
        {nearbyUsers.length > 0 && (
          <View style={styles.distanceContainer}>
            {nearbyUsers.map((user, index) => (
              <View key={index} style={styles.distanceItem}>
                <Icon name="person" size={16} color="#FFF" />
                <Text style={styles.distanceText}>
                  {user.name} - {user.distance}m away
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.subtitle}>
          {showHearts
            ? `${ringsCount} ${ringsCount === 1 ? 'person' : 'people'} nearby!`
            : isActive
            ? 'Searching...'
            : 'Ring your alarm'}
        </Text>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.alarmButton}
          onPress={handleAlarmPress}
          activeOpacity={0.8}
        >
          <View style={styles.buttonRing}>
            <View style={styles.buttonInner}>
              <Icon
                name={isActive ? 'pause' : 'radio-button-on'}
                size={32}
                color="#FFF"
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringsContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  ring1: {
    width: 100,
    height: 100,
  },
  ring2: {
    width: 150,
    height: 150,
  },
  ringHeart: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 5,
    shadowColor: '#FF1493',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  ringHeart1: {
    top: 20,
    right: 20,
  },
  ringHeart2: {
    bottom: 20,
    left: 20,
  },
  heartSticker: {
    position: 'absolute',
  },
  heartSticker1: {
    top: -5,
    right: -5,
  },
  heartSticker2: {
    bottom: -5,
    left: -5,
  },
  heartsWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  distanceContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  distanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 5,
  },
  distanceText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  ring3: {
    width: 200,
    height: 200,
  },
  ring4: {
    width: 250,
    height: 250,
  },
  heartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 107, 157, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  heartActive: {
    backgroundColor: 'rgba(255, 20, 147, 0.8)',
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 10,
    opacity: 0.9,
  },
  bottomContainer: {
    paddingBottom: 100,
    alignItems: 'center',
  },
  alarmButton: {
    width: 80,
    height: 80,
  },
  buttonRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AlarmScreen;
