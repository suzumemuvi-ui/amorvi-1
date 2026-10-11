import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  Map as MapLibreMap,
  Camera,
} from '@maplibre/maplibre-react-native';

import {
  NearbyUser,
} from '../services/nearbyDetection';

import {
  calculateMatchScore,
  getMarkerColor,
  shouldTriggerMutualRadar,
  type UserProfile,
  type MatchScore,
} from '../services/matchingAlgorithm';

import {
  filterByRadarMode,
  getRelevantZones,
  type RadarMode,
  type InterestZone,
} from '../services/radarModes';

import { useAuth } from '../context/AuthContextV2';

const { width, height } = Dimensions.get('window');

const RadarScreen = () => {
  const navigation = useNavigation<any>();

  // Authentication now comes exclusively from AuthContextV2.
  const { logout } = useAuth();

  const mapRef = useRef(null);

  const [radarMode, setRadarMode] = useState<RadarMode>('love');
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [matchScores, setMatchScores] = useState<
    Record<string, MatchScore>
  >({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userZones, setUserZones] = useState<InterestZone[]>([]);
  const [highMatchCount, setHighMatchCount] = useState(0);

  const [nearbyUsers] = useState<NearbyUser[]>([
    {
      id: '2',
      name: 'Ana',
      distance: 8,
      age: 23,
      latitude: 41.9987,
      longitude: 21.4259,
      interests: ['travel', 'fitness', 'culture'],
      countries: ['Italy', 'Greece', 'Thailand'],
      bio: 'Backpacker and culture lover. Always planning the next city escape.',
      city: 'Skopje',
      goals: ['friendship', 'networking'],
    },
    {
      id: '3',
      name: 'Sarah',
      distance: 12,
      age: 24,
      latitude: 41.9978,
      longitude: 21.4265,
      interests: ['travel', 'coffee', 'photography'],
      countries: ['Spain', 'Japan', 'Mexico'],
      bio: 'Travel blogger sharing local food and hidden gems around the world.',
      city: 'Skopje',
      goals: ['relationship', 'dating'],
    },
    {
      id: '4',
      name: 'Emma',
      distance: 15,
      age: 22,
      latitude: 41.9992,
      longitude: 21.4243,
      interests: ['travel', 'music', 'art'],
      countries: ['France', 'New Zealand', 'Morocco'],
      bio: 'Festival traveler who loves music, art, and last-minute weekend trips.',
      city: 'Skopje',
      goals: ['networking', 'events'],
    },
  ]);

  const [detectionCleanup, setDetectionCleanup] = useState<
    (() => void) | null
  >(null);

  const [sweepLineHeight, setSweepLineHeight] = useState(100);
  const [matchedUsers, setMatchedUsers] = useState<string[]>([]);
  const [notifiedMatches, setNotifiedMatches] = useState<string[]>([]);

  const [markerLocation, setMarkerLocation] = useState({
    latitude: 41.9981,
    longitude: 21.4254,
    title: 'Skopje',
  });

  /*
   * Current user profile.
   *
   * This is still mock data for now.
   * Authentication itself is handled by AuthContextV2.
   */
  const currentUserProfile: UserProfile = {
    id: 'current-user',
    name: 'You',
    age: 28,
    interests: ['fitness', 'travel', 'gaming', 'cooking'],
    goals: ['relationship', 'networking'],
    lastActive: new Date(),
    latitude: 41.9981,
    longitude: 21.4254,
  };

  /*
   * Calculate matches on mount and whenever
   * the radar mode or nearby users change.
   */
  useEffect(() => {
    const filteredUsers = filterByRadarMode(
      nearbyUsers,
      radarMode,
    );

    const userProfiles: UserProfile[] = filteredUsers.map(
      (user, idx) => ({
        id: user.id,
        name: user.name,
        age: user.age,

        interests:
          [
            ['fitness', 'travel', 'gaming'],
            ['cooking', 'travel', 'art'],
            ['fitness', 'sports', 'music'],
          ][idx] || ['travel'],

        goals:
          [
            ['relationship', 'networking'],
            ['friendship', 'dating'],
            ['networking', 'events'],
          ][idx] || ['dating'],

        lastActive: new Date(
          Date.now() -
            Math.random() * 24 * 60 * 60 * 1000,
        ),

        latitude:
          41.9981 +
          (Math.random() - 0.5) * 0.01,

        longitude:
          21.4254 +
          (Math.random() - 0.5) * 0.01,
      }),
    );

    const scoresObj: Record<string, MatchScore> = {};
    let highMatches = 0;

    userProfiles.forEach(userProfile => {
      const score = calculateMatchScore(
        currentUserProfile,
        userProfile,
      );

      scoresObj[userProfile.id] = score;

      if (score.matchPercentage >= 80) {
        highMatches++;
      }
    });

    setMatchScores(scoresObj);
    setHighMatchCount(highMatches);

    Object.values(scoresObj).forEach(score => {
      if (
        shouldTriggerMutualRadar(
          score.matchPercentage,
          score.distance,
        )
      ) {
        console.log(
          `Mutual Radar triggered for user ${score.userId}`,
        );
      }
    });
  }, [radarMode, nearbyUsers]);

  /*
   * Get relevant interest zones.
   */
  useEffect(() => {
    const zones = getRelevantZones(
      currentUserProfile.interests,
    );

    setUserZones(zones);
  }, []);

  /*
   * Gamification:
   * scan every 30 seconds.
   */
  useEffect(() => {
    const scanInterval = setInterval(() => {
      if (highMatchCount >= 3) {
        Alert.alert(
          '🎉 High Compatibility Alert',
          `${highMatchCount} new people with over 80% compatibility in your area!`,
        );
      }
    }, 30000);

    return () => clearInterval(scanInterval);
  }, [highMatchCount]);

  /*
   * Fetch location from Nominatim.
   */
  const fetchLocationFromNominatim = async (
    query: string,
  ) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query,
        )}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'AmorviApp/1.0',
          },
        },
      );

      if (!response.ok) {
        console.warn(
          `Nominatim API returned status ${response.status}`,
        );
        return;
      }

      const text = await response.text();
      const data = JSON.parse(text);

      if (
        data &&
        Array.isArray(data) &&
        data.length > 0
      ) {
        const {
          lat,
          lon,
          display_name,
        } = data[0];

        setMarkerLocation({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          title: display_name || query,
        });
      }
    } catch (error) {
      console.warn(
        'Could not fetch location from Nominatim, using defaults:',
        error,
      );
    }
  };

  /*
   * Animation values.
   */
  const ring1Anim = useRef(
    new Animated.Value(1),
  ).current;

  const ring2Anim = useRef(
    new Animated.Value(1),
  ).current;

  const ring3Anim = useRef(
    new Animated.Value(1),
  ).current;

  const rotateAnim = useRef(
    new Animated.Value(0),
  ).current;

  const ring1Opacity = useRef(
    new Animated.Value(0.8),
  ).current;

  const ring2Opacity = useRef(
    new Animated.Value(0.8),
  ).current;

  const ring3Opacity = useRef(
    new Animated.Value(0.8),
  ).current;

  const sweepGlowAnim = useRef(
    new Animated.Value(0),
  ).current;

  /*
   * Fetch Skopje location on mount.
   */
  useEffect(() => {
    fetchLocationFromNominatim('Skopje');
  }, []);

  /*
   * Radar animations.
   */
  useEffect(() => {
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
      createRipple(
        ring1Anim,
        ring1Opacity,
        0,
      ),

      createRipple(
        ring2Anim,
        ring2Opacity,
        400,
      ),

      createRipple(
        ring3Anim,
        ring3Opacity,
        800,
      ),

      rotationAnimation,
    ]);

    animations.start();

    return () => {
      animations.stop();
    };
  }, []);

  /*
   * Cleanup detection.
   */
  useEffect(() => {
    return () => {
      if (detectionCleanup) {
        detectionCleanup();
      }
    };
  }, [detectionCleanup]);

  /*
   * Update sweep line height.
   */
  useEffect(() => {
    if (nearbyUsers.length === 0) {
      setSweepLineHeight(100);
      return;
    }

    const maxDistance = Math.max(
      ...nearbyUsers.map(user => user.distance),
    );

    const lineHeight =
      50 +
      (maxDistance / 30) * 50 +
      30;

    setSweepLineHeight(lineHeight);
  }, [nearbyUsers]);

  const currentUser =
    nearbyUsers[currentUserIndex];

  const handleLike = () => {
    if (!currentUser) {
      return;
    }

    setMatchedUsers(prev =>
      prev.includes(currentUser.id)
        ? prev
        : [...prev, currentUser.id],
    );

    setCurrentUserIndex(
      prev =>
        (prev + 1) %
        nearbyUsers.length,
    );
  };

  const handleSendMatchNotification = (
    userId: string,
  ) => {
    const user = nearbyUsers.find(
      candidate => candidate.id === userId,
    );

    const matchScore =
      matchScores[userId];

    if (!user || !matchScore) {
      return;
    }

    if (notifiedMatches.includes(userId)) {
      Alert.alert(
        'Already sent',
        `${user.name} already received your match notification.`,
      );

      return;
    }

    setMatchedUsers(prev =>
      prev.includes(userId)
        ? prev
        : [...prev, userId],
    );

    setNotifiedMatches(prev => [
      ...prev,
      userId,
    ]);

    Alert.alert(
      'Match notification sent',
      `${user.name} will see: "Someone nearby felt a spark with you. You have a ${matchScore.matchPercentage}% match on Amorvi."`,
    );
  };

  const handlePass = () => {
    if (nearbyUsers.length === 0) {
      return;
    }

    setCurrentUserIndex(
      prev =>
        (prev + 1) %
        nearbyUsers.length,
    );
  };

  const handleTravelersSelect = () => {
    const travelerUsers =
      nearbyUsers.filter(user =>
        user.interests?.some(
          interest =>
            interest
              .toLowerCase()
              .includes('travel'),
        ),
      );

    if (travelerUsers.length === 0) {
      Alert.alert(
        'No Travelers Found',
        'There are no nearby users matching travel interests right now. Try again later.',
      );

      return;
    }

    navigation.navigate('Swipe', {
      travelerResults: travelerUsers,
    });
  };

  /*
   * Logout is now handled by AuthContextV2.
   */
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Logout',
          style: 'destructive',

          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error(
                'Logout failed:',
                error,
              );

              Alert.alert(
                'Logout failed',
                'Unable to logout. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  /*
   * Calculate marker position.
   */
  const getMarkerPosition = (
    distance: number,
    idx: number,
  ) => {
    const maxRadius = 200;
    const angle = idx * 120;

    const radius = Math.min(
      (distance / 20) * maxRadius,
      maxRadius,
    );

    const radians =
      (angle * Math.PI) / 180;

    const x =
      radius * Math.cos(radians);

    const y =
      radius * Math.sin(radians);

    return { x, y };
  };

  /*
   * Format distance.
   */
  const formatDistance = (
    distance: number,
  ) => {
    if (distance < 1) {
      return `${Math.round(
        distance * 1000,
      )}m`;
    }

    return `${distance.toFixed(1)}km`;
  };

  return (
    <View style={styles.container}>
      <MapLibreMap
        ref={mapRef}
        style={styles.fullMap}
        mapStyle={{
          version: 8,

          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: [
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              ],
              tileSize: 256,
            },
          },

          layers: [
            {
              id: 'osm-tiles',
              type: 'raster',
              source: 'osm-tiles',
            },
          ],
        }}
      >
        <Camera
          zoom={13}
          center={[
            markerLocation.longitude,
            markerLocation.latitude,
          ]}
          duration={200}
        />
      </MapLibreMap>

      {/* Radar Overlay */}
      <LinearGradient
        pointerEvents="box-none"
        colors={[
          'rgba(108, 91, 123, 0.25)',
          'rgba(74, 63, 92, 0.18)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.radarOverlay}
      >
        <View style={styles.radarContainer}>
          {/* Animated rings */}
          <Animated.View
            style={[
              styles.ring,
              styles.ring1,
              {
                transform: [
                  { scale: ring1Anim },
                ],
                opacity: ring1Opacity,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.ring,
              styles.ring2,
              {
                transform: [
                  { scale: ring2Anim },
                ],
                opacity: ring2Opacity,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.ring,
              styles.ring3,
              {
                transform: [
                  { scale: ring3Anim },
                ],
                opacity: ring3Opacity,
              },
            ]}
          />

          {/* Static rings */}
          <View
            style={[
              styles.ring,
              styles.ring4,
            ]}
          />

          <View
            style={[
              styles.ring,
              styles.ring5,
            ]}
          />

          {/* Grid */}
          <View
            style={
              styles.gridLineVertical
            }
          />

          <View
            style={[
              styles.gridLineVertical,
              { left: '50%' },
            ]}
          />

          <View
            style={
              styles.gridLineHorizontal
            }
          />

          <View
            style={[
              styles.gridLineHorizontal,
              { top: '50%' },
            ]}
          />

          {/* Radar sweep */}
          <Animated.View
            style={[
              styles.radarSweep,
              {
                height:
                  sweepLineHeight,

                transform: [
                  {
                    rotate:
                      rotateAnim.interpolate(
                        {
                          inputRange: [
                            0,
                            1,
                          ],
                          outputRange: [
                            '0deg',
                            '360deg',
                          ],
                        },
                      ),
                  },
                ],

                opacity:
                  sweepGlowAnim,
              },
            ]}
          />

          {/* Center heart */}
          <View
            style={
              styles.centerHeart
            }
          >
            <View
              style={
                styles.heartCheckmark
              }
            >
              <Icon
                name="heart"
                size={40}
                color="#FF6B9D"
              />

              <View
                style={
                  styles.checkmarkCircle
                }
              >
                <Text
                  style={{
                    color: '#FFF',
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}
                >
                  ✓
                </Text>
              </View>
            </View>
          </View>

          {/* User markers */}
          {nearbyUsers.map(
            (user, idx) => {
              const matchScore =
                matchScores[user.id];

              if (!matchScore) {
                return null;
              }

              const pos =
                getMarkerPosition(
                  user.distance,
                  idx,
                );

              const color =
                getMarkerColor(
                  matchScore.matchPercentage,
                );

              const markerSize = 48;

              return (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.userMarker,
                    {
                      left:
                        140 +
                        pos.x -
                        markerSize / 2,

                      top:
                        140 +
                        pos.y -
                        markerSize / 2,
                    },
                  ]}
                  onPress={() =>
                    setSelectedUser(
                      user.id,
                    )
                  }
                >
                  <View
                    style={[
                      styles.userMarkerGradient,
                      {
                        backgroundColor:
                          color,

                        width:
                          markerSize,

                        height:
                          markerSize,

                        borderRadius:
                          markerSize / 2,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.markerText,
                        {
                          fontSize: 14,
                          fontWeight:
                            '700',
                        },
                      ]}
                    >
                      {
                        matchScore.matchPercentage
                      }
                      %
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            },
          )}

          {/* Interest zones */}
          {userZones.map(
            (zone, idx) => {
              const colors = [
                '#4CAF50',
                '#2196F3',
                '#FF9800',
                '#9C27B0',
              ];

              const color =
                colors[idx] ||
                '#4CAF50';

              return (
                <View
                  key={zone.id}
                  style={[
                    styles.interestZone,
                    {
                      left:
                        140 +
                        (zone.longitude -
                          21.4254) *
                          5000,

                      top:
                        140 -
                        (zone.latitude -
                          41.9981) *
                          5000,

                      borderColor:
                        color,

                      backgroundColor:
                        `${color}20`,
                    },
                  ]}
                >
                  <Text
                    style={
                      styles.zoneName
                    }
                  >
                    {zone.name.split(
                      ' ',
                    )[0]}
                  </Text>
                </View>
              );
            },
          )}
        </View>
      </LinearGradient>

      {/* UI overlay */}
      <View
        pointerEvents="box-none"
        style={
          styles.overlayContainer
        }
      >
        <StatusBar
          barStyle="light-content"
        />

        {/* Header */}
        <View
          style={
            styles.headerOverlay
          }
        >
          <View
            style={
              styles.headerContent
            }
          >
            <Icon
              name="heart"
              size={24}
              color="#FF6B9D"
            />

            <Text
              style={
                styles.headerTitle
              }
            >
              Amorvi
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
          >
            <Icon
              name="log-out"
              size={24}
              color="#FF6B9D"
            />
          </TouchableOpacity>
        </View>

        {/* Bottom controls */}
        <View
          style={
            styles.bottomControls
          }
        >
          <View
            style={
              styles.radarModeBar
            }
          >
            <TouchableOpacity
              style={[
                styles.modeButton,
                radarMode ===
                  'love' &&
                  styles.modeButtonActive,
              ]}
              onPress={() =>
                setRadarMode('love')
              }
            >
              <Icon
                name="heart"
                size={18}
                color="#FFF"
              />

              <Text
                style={
                  styles.modeText
                }
              >
                Love
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                radarMode ===
                  'friend' &&
                  styles.modeButtonActive,
              ]}
              onPress={() =>
                setRadarMode(
                  'friend',
                )
              }
            >
              <Icon
                name="people"
                size={18}
                color="#FFF"
              />

              <Text
                style={
                  styles.modeText
                }
              >
                Friends
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                radarMode ===
                  'business' &&
                  styles.modeButtonActive,
              ]}
              onPress={() =>
                setRadarMode(
                  'business',
                )
              }
            >
              <Icon
                name="briefcase"
                size={18}
                color="#FFF"
              />

              <Text
                style={
                  styles.modeText
                }
              >
                Business
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                radarMode ===
                  'event' &&
                  styles.modeButtonActive,
              ]}
              onPress={() =>
                setRadarMode('event')
              }
            >
              <Icon
                name="star"
                size={18}
                color="#FFF"
              />

              <Text
                style={
                  styles.modeText
                }
              >
                Events
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={
              styles.travelersButton
            }
            onPress={
              handleTravelersSelect
            }
          >
            <Icon
              name="airplane"
              size={18}
              color="#FFF"
            />

            <Text
              style={
                styles.travelersText
              }
            >
              Travelers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Match information */}
        {selectedUser &&
          matchScores[
            selectedUser
          ] && (
            <View
              style={
                styles.matchInfoCard
              }
            >
              <TouchableOpacity
                style={
                  styles.closeButton
                }
                onPress={() =>
                  setSelectedUser(
                    null,
                  )
                }
              >
                <Icon
                  name="close"
                  size={24}
                  color="#FFF"
                />
              </TouchableOpacity>

              {nearbyUsers.find(
                user =>
                  user.id ===
                  selectedUser,
              ) && (
                <>
                  <View
                    style={
                      styles.cardHeader
                    }
                  >
                    <View>
                      <Text
                        style={
                          styles.matchName
                        }
                      >
                        {
                          nearbyUsers.find(
                            u =>
                              u.id ===
                              selectedUser,
                          )!.name
                        }
                      </Text>

                      <Text
                        style={
                          styles.matchAge
                        }
                      >
                        {
                          nearbyUsers.find(
                            u =>
                              u.id ===
                              selectedUser,
                          )!.age
                        }{' '}
                        years old
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.matchBadge,
                        {
                          backgroundColor:
                            getMarkerColor(
                              matchScores[
                                selectedUser
                              ]!
                                .matchPercentage,
                            ),
                        },
                      ]}
                    >
                      <Text
                        style={
                          styles.matchBadgeText
                        }
                      >
                        {
                          matchScores[
                            selectedUser
                          ]!
                            .matchPercentage
                        }
                        %
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.sendMatchButton,

                      notifiedMatches.includes(
                        selectedUser,
                      ) &&
                        styles.sendMatchButtonSent,
                    ]}
                    onPress={() =>
                      handleSendMatchNotification(
                        selectedUser,
                      )
                    }
                    activeOpacity={0.85}
                  >
                    <Icon
                      name={
                        notifiedMatches.includes(
                          selectedUser,
                        )
                          ? 'heart'
                          : 'heart-outline'
                      }
                      size={22}
                      color="#FFF"
                    />

                    <Text
                      style={
                        styles.sendMatchText
                      }
                    >
                      {notifiedMatches.includes(
                        selectedUser,
                      )
                        ? 'Match sent'
                        : 'Send match'}
                    </Text>
                  </TouchableOpacity>

                  <View
                    style={
                      styles.distanceSection
                    }
                  >
                    <Icon
                      name="location"
                      size={16}
                      color="#FF6B9D"
                    />

                    <Text
                      style={
                        styles.distanceText
                      }
                    >
                      {formatDistance(
                        nearbyUsers.find(
                          u =>
                            u.id ===
                            selectedUser,
                        )!.distance,
                      )}{' '}
                      away
                    </Text>
                  </View>

                  <View
                    style={
                      styles.matchPercentageBar
                    }
                  >
                    <View
                      style={[
                        styles.matchPercentageFill,
                        {
                          width: `${matchScores[selectedUser]!.matchPercentage}%`,
                          backgroundColor:
                            getMarkerColor(
                              matchScores[
                                selectedUser
                              ]!
                                .matchPercentage,
                            ),
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={
                      styles.matchPercentageText
                    }
                  >
                    {
                      matchScores[
                        selectedUser
                      ]!
                        .matchPercentage
                    }
                    % Match
                  </Text>

                  {matchScores[
                    selectedUser
                  ]!.reasons.length >
                    0 && (
                    <View
                      style={
                        styles.reasonsList
                      }
                    >
                      <Text
                        style={
                          styles.reasonsTitle
                        }
                      >
                        Why you match:
                      </Text>

                      {matchScores[
                        selectedUser
                      ]!.reasons
                        .slice(0, 4)
                        .map(
                          (
                            reason: string,
                            idx: number,
                          ) => (
                            <Text
                              key={idx}
                              style={
                                styles.reasonText
                              }
                            >
                              ✓ {reason}
                            </Text>
                          ),
                        )}
                    </View>
                  )}
                </>
              )}
            </View>
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6C5B7B',
  },

  fullMap: {
    ...StyleSheet.absoluteFillObject,
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
    borderColor:
      'rgba(255, 255, 255, 0.6)',
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
    backgroundColor:
      'rgba(255, 107, 157, 0.8)',
    shadowColor: '#FF6B9D',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 8,
  },

  gridLineVertical: {
    position: 'absolute',
    width: 1,
    height: 200,
    backgroundColor:
      'rgba(255, 255, 255, 0.2)',
  },

  gridLineHorizontal: {
    position: 'absolute',
    width: 200,
    height: 1,
    backgroundColor:
      'rgba(255, 255, 255, 0.2)',
  },

  userMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  markerText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  userMarkerGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    shadowColor: '#999',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },

  centerHeart: {
    width: 80,
    height: 80,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },

  heartCheckmark: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkmarkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor:
      'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 4,
    right: 4,
  },

  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    pointerEvents: 'box-none',
  },

  radarOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },

  headerOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor:
      'rgba(0, 0, 0, 0.4)',
  },

  bottomControls: {
    backgroundColor:
      'rgba(0, 0, 0, 0.6)',
    paddingBottom: 20,
    paddingHorizontal: 10,
  },

  radarModeBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 10,
  },

  travelersButton: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.14)',
    gap: 10,
  },

  travelersText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },

  modeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor:
      'rgba(255, 107, 157, 0.8)',
    borderRadius: 12,
    gap: 4,
  },

  modeButtonActive: {
    backgroundColor: '#FF6B9D',
    borderWidth: 2,
    borderColor: '#FFF',
  },

  modeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  matchInfoCard: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor:
      'rgba(0, 0, 0, 0.9)',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },

  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor:
      'rgba(255, 107, 157, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  matchName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },

  matchAge: {
    fontSize: 14,
    color: '#AAA',
    marginTop: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  matchBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  matchBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },

  sendMatchButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF6B9D',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
    shadowColor: '#FF6B9D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },

  sendMatchButtonSent: {
    backgroundColor: '#C06C84',
  },

  sendMatchText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },

  distanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },

  distanceText: {
    fontSize: 13,
    color: '#FFF',
  },

  reasonsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B9D',
    marginBottom: 6,
  },

  matchPercentageBar: {
    height: 8,
    backgroundColor:
      'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },

  matchPercentageFill: {
    height: '100%',
    borderRadius: 4,
  },

  matchPercentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B9D',
    textAlign: 'center',
  },

  reasonsList: {
    gap: 6,
    marginTop: 12,
  },

  reasonText: {
    fontSize: 12,
    color: '#AAA',
  },

  interestZone: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  zoneName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default RadarScreen;
