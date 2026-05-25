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
  const [ringsCount, setRingsCount] = useState(3); // Demo: 3 nearby users
  const [isActive, setIsActive] = useState(true);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([
    { id: '2', name: 'Alex', distance: 45, age: 23 },
    { id: '3', name: 'Sarah', distance: 78, age: 24 },
    { id: '4', name: 'Emma', distance: 120, age: 22 },
  ]);
  const [showHearts, setShowHearts] = useState(true);
  const [detectionCleanup, setDetectionCleanup] = useState<(() => void) | null>(
    null,
  );

  // Animation values for rings
  const ring1Anim = React.useRef(new Animated.Value(1)).current;
  const ring2Anim = React.useRef(new Animated.Value(1)).current;
  const ring3Anim = React.useRef(new Animated.Value(1)).current;
  const ring4Anim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

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

    // Rotation animation for radar sweep
    const rotationAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }),
    );

    const animations = Animated.parallel([
      createRipple(ring1Anim, ring1Opacity, 0),
      createRipple(ring2Anim, ring2Opacity, 300),
      createRipple(ring3Anim, ring3Opacity, 600),
      createRipple(ring4Anim, ring4Opacity, 900),
      rotationAnimation,
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
        {/* Radar Container */}
        <View style={styles.radarContainer}>
          {/* Background Rings */}
          <View style={[styles.ring, styles.ring1]} />
          <View style={[styles.ring, styles.ring2]} />
          <View style={[styles.ring, styles.ring3]} />
          <View style={[styles.ring, styles.ring4]} />

          {/* Radar Sweep Line */}
          <Animated.View
            style={[
              styles.radarSweep,
              {
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* User Profiles Positioned on Radar */}
          {nearbyUsers.map((user, index) => {
            const angle = (index * 360) / nearbyUsers.length;
            const distance = 80 + (user.distance / 120) * 40;
            const radian = (angle * Math.PI) / 180;
            const x = distance * Math.cos(radian - Math.PI / 2);
            const y = distance * Math.sin(radian - Math.PI / 2);

            return (
              <View
                key={index}
                style={[
                  styles.userPinContainer,
                  {
                    transform: [
                      { translateX: x },
                      { translateY: y },
                    ],
                  },
                ]}
              >
                <View style={styles.userPin}>
                  <LinearGradient
                    colors={['#FF6B9D', '#FF1493']}
                    style={styles.userAvatarGradient}
                  >
                    <Icon name="heart" size={20} color="#FFF" />
                  </LinearGradient>
                </View>
                <Text style={styles.userDistance}>{user.distance}m</Text>
              </View>
            );
          })}

          {/* Center Heart */}
          <View style={styles.radarCenter}>
            <LinearGradient
              colors={['#FF6B9D', '#FF1493']}
              style={styles.centerHeart}
            >
              <Icon name="heart" size={40} color="#FFF" />
            </LinearGradient>
          </View>
        </View>

        {/* Counter */}
        <Text style={styles.counter}>{ringsCount}</Text>

        <Text style={styles.subtitle}>
          {showHearts
            ? `${ringsCount} ${ringsCount === 1 ? 'person' : 'people'} nearby!`
            : isActive
            ? 'Searching...'
            : 'Ring your alarm'}
        </Text>

        {/* Nearby Users List */}
        {nearbyUsers.length > 0 && (
          <View style={styles.usersList}>
            {nearbyUsers.map((user, index) => (
              <View key={index} style={styles.userListItem}>
                <View style={styles.userListAvatar}>
                  <Icon name="person" size={16} color="#FFF" />
                </View>
                <View style={styles.userListInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userAge}>{user.age} • {user.distance}m away</Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
    paddingHorizontal: 20,
  },
  radarContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  ring: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  ring1: {
    width: 80,
    height: 80,
  },
  ring2: {
    width: 140,
    height: 140,
  },
  ring3: {
    width: 200,
    height: 200,
  },
  ring4: {
    width: 260,
    height: 260,
  },
  radarSweep: {
    position: 'absolute',
    width: 130,
    height: 260,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255, 107, 157, 0.6)',
  },
  userPinContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  userPin: {
    marginBottom: 4,
  },
  userAvatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  userDistance: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  radarCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerHeart: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  counter: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  usersList: {
    marginTop: 20,
    width: '100%',
    maxHeight: 150,
  },
  userListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userListAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 157, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userListInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  userAge: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 10,
    opacity: 0.9,
    fontWeight: '600',
  },
  bottomContainer: {
    paddingBottom: 80,
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
});

export default AlarmScreen;
