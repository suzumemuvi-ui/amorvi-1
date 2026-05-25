import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
  Image,
  ScrollView,
  Dimensions,
  TextInput,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  NearbyUser,
} from '../services/nearbyDetection';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');

const RadarScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([
    { id: '2', name: 'Ana', distance: 8, age: 23 },
    { id: '3', name: 'Sarah', distance: 12, age: 24 },
    { id: '4', name: 'Emma', distance: 15, age: 22 },
  ]);
  const [detectionCleanup, setDetectionCleanup] = useState<(() => void) | null>(
    null,
  );
  const [sweepLineHeight, setSweepLineHeight] = useState(100);
  const [matchedUsers, setMatchedUsers] = useState<string[]>([]);

  // Animation values for rings
  const ring1Anim = React.useRef(new Animated.Value(1)).current;
  const ring2Anim = React.useRef(new Animated.Value(1)).current;
  const ring3Anim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  const ring1Opacity = React.useRef(new Animated.Value(0.8)).current;
  const ring2Opacity = React.useRef(new Animated.Value(0.8)).current;
  const ring3Opacity = React.useRef(new Animated.Value(0.8)).current;
  const sweepGlowAnim = React.useRef(new Animated.Value(0)).current;

  const nearHearts = (userId: string, markerSize: number) => {
    const isMatched = matchedUsers.includes(userId);
    const iconSize = markerSize * 0.5;
    return (
      <View
        style={[
          styles.userMarkerGradient,
          {
            width: markerSize,
            height: markerSize,
            borderRadius: markerSize / 2,
          },
          isMatched && {
            backgroundColor: 'rgba(255, 107, 157, 0.9)',
            shadowColor: '#FF6B9D',
            shadowOpacity: 0.9,
            shadowRadius: 15,
          },
        ]}
      >
        {isMatched ? (
          <Icon name="heart" size={iconSize * 0.7} color="#FFF" />
        ) : (
          <View style={[styles.whiteCircle, { width: iconSize, height: iconSize, borderRadius: iconSize / 2 }]} />
        )}
      </View>
    );
  };

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
              toValue: 1.4,
              duration: 2500,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 2500,
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

    // Rotation animation for radar sweep with glow
    const rotationAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(sweepGlowAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(sweepGlowAnim, {
              toValue: 0.3,
              duration: 4500,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),
    );

    const animations = Animated.parallel([
      createRipple(ring1Anim, ring1Opacity, 0),
      createRipple(ring2Anim, ring2Opacity, 400),
      createRipple(ring3Anim, ring3Opacity, 800),
      rotationAnimation,
    ]);

    animations.start();

    return () => {
      animations.stop();
    };
  }, []);

  // Cleanup detection when component unmounts
  useEffect(() => {
    return () => {
      if (detectionCleanup) {
        detectionCleanup();
      }
    };
  }, [detectionCleanup]);

  // Update sweep line height dynamically based on heart positions
  useEffect(() => {
    if (nearbyUsers.length === 0) {
      setSweepLineHeight(100);
    } else {
      const maxDistance = Math.max(...nearbyUsers.map(user => user.distance));
      const lineHeight = 50 + (maxDistance / 30) * 50 + 30;
      setSweepLineHeight(lineHeight);
    }
  }, [nearbyUsers]);

  const currentUser = nearbyUsers[currentUserIndex];

  const handleLike = () => {
    setMatchedUsers([...matchedUsers, currentUser.id]);
    setCurrentUserIndex((prev) => (prev + 1) % nearbyUsers.length);
  };

  const handlePass = () => {
    setCurrentUserIndex((prev) => (prev + 1) % nearbyUsers.length);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          // Navigate to Auth screen
          navigation.navigate('AuthScreen');
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <ImageBackground
      source={require('../assets/images.png')}
      style={styles.container}
      imageStyle={{ opacity: 0.4 }}
      resizeMode="contain"
    >
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#E8DFF0', '#D5C9E0', '#C9B8D8']}
        style={styles.gradient}
      >
        {/* Map Background Grid */}
        <View style={styles.mapBackground}>
          {[...Array(20)].map((_, i) => (
            <View key={`h-${i}`} style={[styles.mapGridLine, { top: `${i * 5}%` }]} />
          ))}
          {[...Array(20)].map((_, i) => (
            <View key={`v-${i}`} style={[styles.mapGridLineVertical, { left: `${i * 5}%` }]} />
          ))}
        </View>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Icon name="heart" size={24} color="#FF6B9D" />
            <Text style={styles.headerTitle}>Amorvi</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Icon name="log-out" size={24} color="#FF6B9D" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Icon name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Radar"
            placeholderTextColor="#999"
          />
        </View>

        {/* Radar Container */}
        <View style={styles.radarContainer}>
          {/* Background Rings with Grid */}
          <View style={[styles.ring, styles.ring1]} />
          <View style={[styles.ring, styles.ring2]} />
          <View style={[styles.ring, styles.ring3]} />
          <View style={[styles.ring, styles.ring4]} />
          <View style={[styles.ring, styles.ring5]} />
          
          {/* Grid Lines */}
          <View style={styles.gridLineVertical} />
          <View style={styles.gridLineHorizontal} />

          {/* Radar Sweep Line */}
          <Animated.View
            style={[
              styles.radarSweep,
              {
                height: sweepLineHeight,
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
                opacity: sweepGlowAnim,
              },
            ]}
          />

          {/* User Positions on Radar */}
          {nearbyUsers.map((user, index) => {
            const angle = (index * 360) / nearbyUsers.length - 90;
            const distance = 50 + (user.distance / 30) * 50;
            const radian = (angle * Math.PI) / 180;
            const x = distance * Math.cos(radian);
            const y = distance * Math.sin(radian);
            // Size based on distance: closer = bigger, further = smaller
            const markerSize = 60 - (user.distance / 30) * 20;

            
            return (
              <View
                key={index}
                style={[
                  styles.userMarker,
                  {
                    transform: [
                      { translateX: x },
                      { translateY: y },
                    ],
                  },
                ]}
              >
                {nearHearts(user.id, markerSize)}
              </View>
            );
          })}

          {/* Center Heart with Amorvi Logo PNG */}
          <View style={styles.centerHeart}>
            <Image
              source={require('../assets/amorvi_logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* User Card Below Radar */}
        <View style={styles.userCardContainer}>
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{currentUser.name}, {currentUser.age}</Text>
              <View style={styles.distanceBadge}>
                <Icon name="location" size={14} color="#FF6B9D" />
                <Text style={styles.distanceText}>5-10 km away</Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
                <Icon name="heart" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.chatButton} onPress={handleLike}>
                <Icon name="chatbubble" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewText}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6C5B7B',
  },
  fullScreenBackground: {
    position: 'relative',
    top: 0,
    left: 0,
    width: width * 2,
    height: height * 2,
    opacity: 0.12,
  },
  gradient: {
    flex: 1,
    paddingTop: 0,
  },
  mapBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.12,
    backgroundColor: 'transparent',
  },
  mapGridLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(100, 100, 100, 0.4)',
  },
  mapGridLineVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(100, 100, 100, 0.4)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  radarContainer: {
    width: 280,
    height: 280,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
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
  ring5: {
    width: 320,
    height: 320,
  },
  radarSweep: {
    position: 'absolute',
    width: 2,
    backgroundColor: 'rgba(255, 107, 157, 0.8)',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 8,
  },
  gridLineVertical: {
    position: 'absolute',
    width: 1,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: 200,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  userMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    backgroundColor: '#FFF',
    shadowColor: '#999',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  whiteCircle: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#E8E8E8',
  },
  centerHeart: {
    width: 80,
    height: 80,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  heartCheckmark: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  heartOutline: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    opacity: 0.9,
  },
  checkmarkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  userCardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 13,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  likeButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  chatButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#7C6BA3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  viewButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  viewText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
});

export default RadarScreen;
