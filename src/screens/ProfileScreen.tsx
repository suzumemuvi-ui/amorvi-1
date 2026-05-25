import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { currentUser } from '../data/mockData';
import { EditProfileModal } from '../components/EditProfileModal';
import { AddStoryModal } from '../components/AddStoryModal';
import { StoryViewer } from '../components/StoryViewer';
import { ChangeProfilePictureModal } from '../components/ChangeProfilePictureModal';
import { AlbumItemViewer } from '../components/AlbumItemViewer';

const { width } = Dimensions.get('window');
const imageSize = (width - 60) / 3;

const ProfileScreen = ({ navigation }: { navigation?: any }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [showChangeProfileModal, setShowChangeProfileModal] = useState(false);
  const [showAddAlbumModal, setShowAddAlbumModal] = useState(false);
  const [showAlbumViewer, setShowAlbumViewer] = useState(false);
  const [selectedAlbumItem, setSelectedAlbumItem] = useState<{
    uri: string;
    type: 'photo' | 'video';
  } | null>(null);
  const [userData, setUserData] = useState({
    name: currentUser.name,
    age: currentUser.age,
    bio: currentUser.bio,
  });
  const [profileImage, setProfileImage] = useState(currentUser.images[0]);
  const [albumItems, setAlbumItems] = useState<
    Array<{ uri: string; type: 'photo' | 'video' }>
  >(currentUser.images.map(img => ({ uri: img, type: 'photo' as const })));
  const [story, setStory] = useState<{
    uri: string;
    type: 'photo' | 'video';
    timestamp: number;
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!story) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - story.timestamp;
      const remaining = 24 * 60 * 60 * 1000 - elapsed;

      if (remaining <= 0) {
        setStory(null);
        setTimeRemaining('');
      } else {
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor(
          (remaining % (60 * 60 * 1000)) / (60 * 1000),
        );
        setTimeRemaining(`${hours}h ${minutes}m`);
      }
    }, 60000);

    // Initial calculation
    const now = Date.now();
    const elapsed = now - story.timestamp;
    const remaining = 24 * 60 * 60 * 1000 - elapsed;
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    setTimeRemaining(`${hours}h ${minutes}m`);

    return () => clearInterval(interval);
  }, [story]);

  const handleChangeProfilePicture = () => {
    setShowChangeProfileModal(true);
  };

  const handleProfileImageSelected = (uri: string) => {
    setProfileImage(uri);
  };

  const handleAddAlbumItem = (itemData: {
    uri: string;
    type: 'photo' | 'video';
    timestamp: number;
  }) => {
    const newItem = { uri: itemData.uri, type: itemData.type };
    setAlbumItems([newItem, ...albumItems]);
    Alert.alert(
      'Success',
      `${itemData.type === 'photo' ? 'Photo' : 'Video'} added to album!`,
    );
  };

  const handleViewAlbumItem = (item: {
    uri: string;
    type: 'photo' | 'video';
  }) => {
    setSelectedAlbumItem(item);
    setShowAlbumViewer(true);
  };

  const handleSaveProfile = (data: {
    name: string;
    age: string;
    bio: string;
  }) => {
    setUserData({
      name: data.name,
      age: parseInt(data.age),
      bio: data.bio,
    });
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleAddStory = (storyData: {
    uri: string;
    type: 'photo' | 'video';
    timestamp: number;
  }) => {
    setStory(storyData);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with Background Image */}
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: profileImage }}
          style={styles.headerBackground}
          blurRadius={10}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => navigation?.navigate('Settings')}
            >
              <Icon name="settings-outline" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <TouchableOpacity
              style={styles.profileImageContainer}
              onPress={() => story && setShowStoryViewer(true)}
              activeOpacity={story ? 0.7 : 1}
            >
              {story && (
                <LinearGradient
                  colors={['#FF6B9D', '#FF1493', '#9C27B0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.storyRing}
                />
              )}
              <Image
                source={{ uri: story?.uri || profileImage }}
                style={styles.profileImage}
              />
              {story && (
                <View style={styles.storyTimeBadge}>
                  <Icon name="time-outline" size={12} color="#FFF" />
                  <Text style={styles.storyTimeText}>{timeRemaining}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.editBadge}
                onPress={handleChangeProfilePicture}
              >
                <Icon name="pencil" size={16} color="#FFF" />
              </TouchableOpacity>
            </TouchableOpacity>

            <Text style={styles.profileName}>
              {userData.name}, {userData.age}
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {(currentUser.followers || 0).toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {(currentUser.following || 0).toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {(currentUser.likes || 0).toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Likes</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowStoryModal(true)}
          >
            <LinearGradient
              colors={['#FF6B9D', '#FF1493']}
              style={styles.actionButtonGradient}
            >
              <Icon name="add-outline" size={24} color="#FFF" />
              <Text style={styles.actionButtonText}>Add Story</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation?.navigate('EditProfile')}
          >
            <View style={styles.actionButtonOutline}>
              <Icon name="create-outline" size={24} color="#000" />
              <Text style={styles.actionButtonTextDark}>Edit Profile</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Albums Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Albums</Text>
            <TouchableOpacity onPress={() => setShowAddAlbumModal(true)}>
              <LinearGradient
                colors={['#FF6B9D', '#FF1493']}
                style={styles.addAlbumButton}
              >
                <Icon name="add" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.albumsGrid}>
            {albumItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.albumItem}
                onPress={() => handleViewAlbumItem(item)}
              >
                <Image source={{ uri: item.uri }} style={styles.albumImage} />
                {item.type === 'video' && (
                  <View style={styles.albumOverlay}>
                    <Icon name="play" size={30} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionItem}>
            <Icon name="bookmark-outline" size={24} color="#000" />
            <Text style={styles.quickActionText}>Saved</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <Icon name="heart-outline" size={24} color="#000" />
            <Text style={styles.quickActionText}>Favorites</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <Icon name="time-outline" size={24} color="#000" />
            <Text style={styles.quickActionText}>History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        userData={userData}
        onSave={handleSaveProfile}
      />

      <AddStoryModal
        visible={showStoryModal}
        onClose={() => setShowStoryModal(false)}
        onAddStory={handleAddStory}
      />

      <ChangeProfilePictureModal
        visible={showChangeProfileModal}
        onClose={() => setShowChangeProfileModal(false)}
        onImageSelected={handleProfileImageSelected}
      />

      <AddStoryModal
        visible={showAddAlbumModal}
        onClose={() => setShowAddAlbumModal(false)}
        onAddStory={handleAddAlbumItem}
      />

      <AlbumItemViewer
        visible={showAlbumViewer}
        onClose={() => setShowAlbumViewer(false)}
        item={selectedAlbumItem}
      />

      {story && (
        <StoryViewer
          visible={showStoryViewer}
          onClose={() => setShowStoryViewer(false)}
          story={story}
          userName={userData.name}
          userAge={userData.age}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerContainer: {
    height: 340,
    position: 'relative',
  },
  headerBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerGradient: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  storyRing: {
    position: 'absolute',
    width: 146,
    height: 146,
    borderRadius: 73,
    top: -8,
    left: -8,
    zIndex: 1,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 5,
    borderColor: '#FFF',
    zIndex: 2,
  },
  storyTimeBadge: {
    position: 'absolute',
    top: -5,
    left: '50%',
    transform: [{ translateX: -30 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 3,
  },
  storyTimeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B9D',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    zIndex: 10,
    elevation: 5,
  },
  profileName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    //paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#FFF',
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtonTextDark: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addAlbumButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 0.5,
  },
  albumsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  albumItem: {
    width: imageSize,
    height: imageSize,
    position: 'relative',
  },
  albumImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  albumOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumViews: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 10,
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});

export default ProfileScreen;
