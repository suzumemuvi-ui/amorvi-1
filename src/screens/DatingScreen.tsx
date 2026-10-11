import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Alert,
  Animated,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { users } from '../data/mockData';
import {
  getAcceptedConnections,
  getInterestedProfiles,
  getPendingConnections,
  hasMutualLike,
  registerMatch,
  removeInterestedProfile,
  InterestedProfile,
  addConnectionRequest,
  acceptConnection,
} from '../data/amorviRelationshipState';

type TabMode = 'discover' | 'interested' | 'friends';

type ProfileCard = {
  id: string;
  name: string;
  age: number;
  bio: string;
  city: string;
  distance: number;
  interests: string[];
  image: string;
};

const formatDistance = (distance: number) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }

  return `${distance.toFixed(1)}km`;
};

const discoverProfiles: ProfileCard[] = users.map(user => ({
  id: user.id,
  name: user.name,
  age: user.age,
  bio: user.bio || 'Adventure seeker',
  city: user.city || 'Nearby',
  distance: user.distance || 1.6,
  interests: user.interests || ['Travel'],
  image: user.images[0],
}));

const DatingScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const travelerResults = route.params?.travelerResults as Array<{
    id: string;
    name: string;
    age: number;
    distance: number;
    interests?: string[];
    countries?: string[];
    bio?: string;
    city?: string;
  }> | undefined;

  const [activeTab, setActiveTab] = useState<TabMode>('discover');
  const [selectedProfile, setSelectedProfile] = useState<ProfileCard | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [interestedProfiles, setInterestedProfiles] = useState<InterestedProfile[]>(getInterestedProfiles());
  const [friendConnections, setFriendConnections] = useState(getAcceptedConnections());
  const [pendingConnections, setPendingConnections] = useState(getPendingConnections());

  useFocusEffect(
    React.useCallback(() => {
      setInterestedProfiles(getInterestedProfiles());
      setFriendConnections(getAcceptedConnections());
      setPendingConnections(getPendingConnections());
    }, []),
  );

  const profileList = useMemo(() => {
    if (activeTab === 'interested') {
      return interestedProfiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        age: profile.age,
        bio: profile.bio || 'Nearby profile',
        city: profile.city || 'Nearby',
        distance: profile.distance || 1.4,
        interests: profile.interests || ['Travel'],
        image: profile.images[0] || 'https://picsum.photos/800/1000?random=201',
      }));
    }

    if (activeTab === 'friends') {
      return [] as ProfileCard[];
    }

    return discoverProfiles;
  }, [activeTab, interestedProfiles]);

  const pendingFriends = pendingConnections.map(profile => ({
    id: profile.id,
    name: profile.name,
    age: profile.age,
    bio: profile.bio || 'Pending connection',
    city: profile.city || 'Nearby',
    distance: profile.distance || 1.4,
    interests: ['Friends', 'Coffee'],
    image: profile.image || 'https://picsum.photos/800/1000?random=50',
  }));

  const acceptedFriends = friendConnections.map(profile => ({
    id: profile.id,
    name: profile.name,
    age: profile.age,
    bio: profile.bio || 'Connected',
    city: profile.city || 'Nearby',
    distance: profile.distance || 1.4,
    interests: ['Friends', 'Coffee'],
    image: profile.image || 'https://picsum.photos/800/1000?random=50',
  }));

  const handleKeepSwiping = () => {
    setShowMatch(false);
    setSelectedProfile(null);
  };

  const handleChatNow = () => {
    setShowMatch(false);
    setShowChat(true);
  };

  const handlePass = (profileId: string) => {
    if (activeTab === 'interested') {
      removeInterestedProfile(profileId);
      setInterestedProfiles(getInterestedProfiles());
      return;
    }

    Alert.alert('Pass', 'You passed on this person.');
  };

  const handleLike = (profile: ProfileCard) => {
    if (profile.id === '2' || hasMutualLike(profile.id)) {
      registerMatch({
        id: profile.id,
        name: profile.name,
        age: profile.age,
        bio: profile.bio,
        image: profile.image,
        city: profile.city,
        distance: profile.distance,
        lastMessage: 'Hey! I was hoping you would message me!',
      });
      setSelectedProfile(profile);
      setShowMatch(true);
      setShowChat(false);
      return;
    }

    Alert.alert('Like sent', `You liked ${profile.name}. They will only become a match if they like you back.`);
  };

  const handleConnect = (profile: ProfileCard) => {
    addConnectionRequest({
      id: profile.id,
      name: profile.name,
      age: profile.age,
      bio: profile.bio,
      image: profile.image,
      city: profile.city,
      distance: profile.distance,
    });
    setFriendConnections(getAcceptedConnections());
    setPendingConnections(getPendingConnections());
    Alert.alert('Connection request sent', `Your friend request to ${profile.name} is pending approval.`);
  };

  const handleAcceptConnection = (profileId: string) => {
    acceptConnection(profileId);
    setFriendConnections(getAcceptedConnections());
    setPendingConnections(getPendingConnections());
    Alert.alert('Connection accepted', 'You are now connected and can chat as friends.');
  };

  const handleChatClose = () => {
    setShowChat(false);
    setSelectedProfile(null);
  };

  if (travelerResults && travelerResults.length > 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.headerTravelers}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.travelersTitle}>Travelers Nearby</Text>
          <View style={{ width: 28 }} />
        </View>
        <ScrollView style={styles.travelersList} contentContainerStyle={styles.travelersListContent}>
          {travelerResults.map(user => (
            <View key={user.id} style={styles.travelerCard}>
              <View style={styles.travelerHeader}>
                <Text style={styles.travelerName}>{user.name}, {user.age}</Text>
                <Text style={styles.travelerDistance}>{formatDistance(user.distance)}</Text>
              </View>
              <Text style={styles.travelerCity}>{user.city || 'Nearby'}</Text>
              <Text style={styles.travelerBio}>{user.bio || 'Adventure seeker sharing travel stories.'}</Text>
              <View style={styles.travelerInfoRow}>
                <Text style={styles.travelerInfoLabel}>Interests</Text>
                <Text style={styles.travelerInfoValue}>{user.interests?.join(' · ') || 'Travel'}</Text>
              </View>
              <View style={styles.travelerInfoRow}>
                <Text style={styles.travelerInfoLabel}>Countries</Text>
                <Text style={styles.travelerInfoValue}>{user.countries?.join(', ') || 'Unknown'}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (showMatch && selectedProfile) {
    const sharedInterests = selectedProfile.interests.slice(0, 4);
    
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#1a0a1a', '#2d1b3d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.matchContainer}>
          <TouchableOpacity style={styles.matchCloseButton} onPress={handleKeepSwiping}>
            <Icon name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>

          <ScrollView style={styles.matchScrollContent} contentContainerStyle={styles.matchScrollContainer}>
            <Text style={styles.matchTitle}>It's a Match!</Text>
            <Text style={styles.matchSubtitle}>You and {selectedProfile.name} liked each other 💕</Text>

            <View style={styles.matchProfilesContainer}>
              <View style={styles.matchProfileCard}>
                <Image source={{ uri: users[0].images[0] }} style={styles.matchProfileImage} />
              </View>
              
              <View style={styles.matchHeartContainer}>
                <LinearGradient colors={['#FF4D8D', '#FF1493']} style={styles.matchHeartGradient}>
                  <Icon name="heart" size={48} color="#FFF" />
                </LinearGradient>
              </View>

              <View style={styles.matchProfileCard}>
                <Image source={{ uri: selectedProfile.image }} style={styles.matchProfileImage} />
              </View>
            </View>

            <View style={styles.matchDetailsBox}>
              <Text style={styles.matchDetailName}>
                {selectedProfile.name}, {selectedProfile.age} ✨
              </Text>
              <Text style={styles.matchDetailLocation}>
                {selectedProfile.distance.toFixed(1)} km away · {selectedProfile.city}
              </Text>

              <View style={styles.matchBioBox}>
                <Text style={styles.matchBioText}>{selectedProfile.bio}</Text>
              </View>

              <View style={styles.matchInterestsHeader}>
                <Text style={styles.matchInterestsTitle}>You both like</Text>
              </View>
              <View style={styles.matchInterestsList}>
                {sharedInterests.map((interest, idx) => (
                  <View key={idx} style={styles.matchInterestTag}>
                    <Text style={styles.matchInterestText}>{interest}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.matchQuickLinks}>
                <View style={styles.quickLink}>
                  <Icon name="chatbubble" size={24} color="#FF4D8D" />
                  <Text style={styles.quickLinkText}>You can now chat{'\n'}and get to know each other.</Text>
                </View>
                <View style={styles.quickLink}>
                  <Icon name="heart" size={24} color="#FF4D8D" />
                  <Text style={styles.quickLinkText}>Good vibes only ✨</Text>
                </View>
              </View>

              <View style={styles.matchActionButtons}>
                <TouchableOpacity style={styles.matchSendButton} onPress={handleChatNow}>
                  <Icon name="chatbubble" size={20} color="#FFF" />
                  <Text style={styles.matchSendButtonText}>Send Message</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.matchKeepSwipingButton} onPress={handleKeepSwiping}>
                  <Text style={styles.matchKeepSwipingText}>Keep Swiping</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  if (showChat && selectedProfile) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={handleChatClose}>
            <Icon name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <View style={styles.chatHeaderCenter}>
            <Image source={{ uri: selectedProfile.image }} style={styles.chatAvatar} />
            <Text style={styles.chatHeaderName}>{selectedProfile.name}</Text>
          </View>
          <TouchableOpacity>
            <Icon name="ellipsis-vertical" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.messagesContainer}>
          {[
            { id: 'm1', senderId: '1', text: 'Hey! You seem really cool 😄' },
            { id: 'm2', senderId: selectedProfile.id, text: 'I was hoping you would message me!' },
            { id: 'm3', senderId: '1', text: 'Want to grab coffee this week?' },
          ].map(msg => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.senderId === '1' ? styles.myMessage : styles.theirMessage,
              ]}
            >
              {msg.senderId !== '1' && <Image source={{ uri: selectedProfile.image }} style={styles.messageAvatar} />}
              <View
                style={[
                  styles.messageContent,
                  msg.senderId === '1' ? styles.myMessageContent : styles.theirMessageContent,
                ]}
              >
                <Text style={[styles.messageText, msg.senderId === '1' && styles.myMessageText]}>{msg.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.inputIcon}>
            <Icon name="add-circle" size={28} color="#FF6B9D" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputIcon}>
            <Icon name="heart" size={24} color="#FF6B9D" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputIcon}>
            <Icon name="image" size={24} color="#FF6B9D" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputIcon}>
            <Icon name="happy" size={24} color="#FF6B9D" />
          </TouchableOpacity>
          <Text style={styles.messageInput}>Say hi...</Text>
          <TouchableOpacity style={styles.sendButton}>
            <Icon name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Amorvi</Text>
      </View>

      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentedButton, activeTab === 'discover' && styles.segmentedButtonActive]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.segmentedButtonText, activeTab === 'discover' && styles.segmentedButtonTextActive]}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentedButton, activeTab === 'interested' && styles.segmentedButtonActive]}
          onPress={() => setActiveTab('interested')}
        >
          <Text style={[styles.segmentedButtonText, activeTab === 'interested' && styles.segmentedButtonTextActive]}>💗 Interested</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentedButton, activeTab === 'friends' && styles.segmentedButtonActive]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.segmentedButtonText, activeTab === 'friends' && styles.segmentedButtonTextActive]}>👥 Friends</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'friends' ? (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {pendingFriends.length > 0 && (
            <View style={styles.friendSection}>
              <Text style={styles.friendSectionTitle}>Pending Requests</Text>
              {pendingFriends.map(profile => (
                <View key={profile.id} style={styles.profileCard}>
                  <Image source={{ uri: profile.image }} style={styles.profileImage} />
                  <View style={styles.profileBody}>
                    <View style={styles.profileHeaderRow}>
                      <Text style={styles.profileName}>{profile.name}, {profile.age}</Text>
                      <Text style={styles.profileDistance}>{formatDistance(profile.distance)}</Text>
                    </View>
                    <Text style={styles.profileCity}>{profile.city}</Text>
                    <Text style={styles.profileBio}>{profile.bio}</Text>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity style={styles.passButton} onPress={() => handlePass(profile.id)}>
                        <Text style={styles.passButtonText}>Ignore</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.likeButton} onPress={() => handleAcceptConnection(profile.id)}>
                        <Text style={styles.likeButtonText}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {acceptedFriends.length > 0 && (
            <View style={styles.friendSection}>
              <Text style={styles.friendSectionTitle}>Connections</Text>
              {acceptedFriends.map(profile => (
                <View key={profile.id} style={styles.profileCard}>
                  <Image source={{ uri: profile.image }} style={styles.profileImage} />
                  <View style={styles.profileBody}>
                    <View style={styles.profileHeaderRow}>
                      <Text style={styles.profileName}>{profile.name}, {profile.age}</Text>
                      <Text style={styles.profileDistance}>{formatDistance(profile.distance)}</Text>
                    </View>
                    <Text style={styles.profileCity}>{profile.city}</Text>
                    <Text style={styles.profileBio}>{profile.bio}</Text>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity style={styles.passButton} onPress={() => handlePass(profile.id)}>
                        <Text style={styles.passButtonText}>Remove</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.likeButton} onPress={() => setSelectedProfile(profile as any)}>
                        <Text style={styles.likeButtonText}>Chat</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {pendingFriends.length === 0 && acceptedFriends.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No friends yet</Text>
              <Text style={styles.emptyStateText}>Use Connect to build a friendship list separately from love matches.</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {profileList.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No interested profiles yet</Text>
              <Text style={styles.emptyStateText}>Tap 💗 Interested on a Home post to save someone here.</Text>
            </View>
          ) : (
            profileList.map(profile => (
              <View key={profile.id} style={styles.profileCard}>
                <Image source={{ uri: profile.image }} style={styles.profileImage} />

                <View style={styles.profileBody}>
                  <View style={styles.profileHeaderRow}>
                    <Text style={styles.profileName}>{profile.name}, {profile.age}</Text>
                    <Text style={styles.profileDistance}>{formatDistance(profile.distance)}</Text>
                  </View>

                  <Text style={styles.profileCity}>{profile.city}</Text>
                  <Text style={styles.profileBio}>{profile.bio}</Text>

                  <View style={styles.tagsRow}>
                    {profile.interests.slice(0, 3).map(interest => (
                      <View key={`${profile.id}-${interest}`} style={styles.tag}>
                        <Text style={styles.tagText}>{interest}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.passButton} onPress={() => handlePass(profile.id)}>
                      <Text style={styles.passButtonText}>✕ Pass</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.likeButton} onPress={() => handleLike(profile)}>
                      <Text style={styles.likeButtonText}>Like ♡</Text>
                    </TouchableOpacity>
                    {activeTab === 'discover' && (
                      <TouchableOpacity style={styles.connectButton} onPress={() => handleConnect(profile)}>
                        <Text style={styles.connectButtonText}>👥 Connect</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E12',
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#0E0E12',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    gap: 0,
  },
  segmentedButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  segmentedButtonActive: {
    backgroundColor: '#FF4D8D',
  },
  segmentedButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
  },
  segmentedButtonTextActive: {
    color: '#FFF',
  },
  list: {
    flex: 1,
    backgroundColor: '#0E0E12',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  profileImage: {
    width: '100%',
    height: 280,
  },
  profileBody: {
    padding: 16,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  profileDistance: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9DBF',
  },
  profileCity: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    color: '#E5E5E5',
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(255, 77, 141, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 77, 141, 0.4)',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9DBF',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  passButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  passButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
  },
  likeButton: {
    flex: 1,
    backgroundColor: '#FF4D8D',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  connectButton: {
    flex: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A78BFA',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  matchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchCloseButton: {
    position: 'absolute',
    top: 52,
    left: 20,
    zIndex: 10,
  },
  matchScrollContent: {
    flex: 1,
  },
  matchScrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  matchTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FF4D8D',
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  matchSubtitle: {
    fontSize: 16,
    color: '#cfcfcf',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
  },
  matchProfilesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    height: 200,
  },
  matchProfileCard: {
    width: 140,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FF4D8D',
    shadowColor: '#FF4D8D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  matchProfileImage: {
    width: '100%',
    height: '100%',
  },
  matchHeartContainer: {
    width: 80,
    height: 80,
    marginHorizontal: -15,
    zIndex: 5,
    shadowColor: '#FF4D8D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  matchHeartGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchDetailsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 141, 0.3)',
  },
  matchDetailName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 6,
  },
  matchDetailLocation: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 14,
  },
  matchBioBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#FF4D8D',
  },
  matchBioText: {
    fontSize: 15,
    color: '#E5E5E5',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  matchInterestsHeader: {
    marginBottom: 12,
  },
  matchInterestsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B0B0B0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  matchInterestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  matchInterestTag: {
    backgroundColor: 'rgba(255, 77, 141, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 141, 0.5)',
  },
  matchInterestText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9DBF',
  },
  matchQuickLinks: {
    gap: 12,
    marginBottom: 24,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 141, 0.1)',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  quickLinkText: {
    fontSize: 13,
    color: '#E5E5E5',
    fontWeight: '500',
    flex: 1,
  },
  matchActionButtons: {
    gap: 12,
  },
  matchSendButton: {
    backgroundColor: '#FF4D8D',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#FF4D8D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  matchSendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  matchKeepSwipingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#FF4D8D',
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchKeepSwipingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF4D8D',
  },
  closeButton: {
    position: 'absolute',
    top: 52,
    right: 20,
  },
  matchContent: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  matchPhotos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    height: 200,
  },
  heartContainer: {
    zIndex: 3,
    marginHorizontal: -30,
  },
  heartGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  matchPhoto: {
    width: 150,
    height: 200,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  matchPhotoLeft: {
    transform: [{ rotate: '-5deg' }],
    zIndex: 2,
  },
  matchPhotoRight: {
    transform: [{ rotate: '5deg' }],
    zIndex: 1,
  },
  matchButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  keepSwipingButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  keepSwipingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chatNowButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  chatNowText: {
    color: '#FF6B9D',
    fontSize: 16,
    fontWeight: '600',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  chatHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  chatAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  theirMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  messageContent: {
    maxWidth: '75%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myMessageContent: {
    backgroundColor: '#FF6B9D',
    borderBottomRightRadius: 5,
  },
  theirMessageContent: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 15,
    color: '#000',
  },
  myMessageText: {
    color: '#FFF',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  inputIcon: {
    marginRight: 10,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 15,
    marginRight: 10,
    color: '#999',
  },
  sendButton: {
    backgroundColor: '#FF6B9D',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTravelers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  travelersTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
  },
  travelersList: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  travelersListContent: {
    padding: 20,
    gap: 16,
  },
  travelerCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  travelerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  travelerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  travelerDistance: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  travelerCity: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
  },
  travelerBio: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  },
  travelerInfoRow: {
    marginBottom: 8,
  },
  travelerInfoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    marginBottom: 4,
  },
  travelerInfoValue: {
    fontSize: 14,
    color: '#333',
  },
  friendsContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
  },
  friendsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 16,
  },
  friendSection: {
    marginBottom: 24,
  },
  friendSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 12,
  },
});

export default DatingScreen;
