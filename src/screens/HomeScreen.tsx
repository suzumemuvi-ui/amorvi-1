import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { users, currentUser } from '../data/mockData';
import { User } from '../types';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const user = users[currentIndex];

  const handleLike = () => {
    console.log('Liked:', user.name);
    setCurrentIndex(prev => (prev + 1) % users.length);
  };

  const handleShare = () => {
    console.log('Share:', user.name);
  };

  const handleComment = () => {
    console.log('Comment');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Video/Image Background */}
      <Image
        source={{ uri: user.images[0] }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Top Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent']}
        style={styles.topGradient}
      >
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <TouchableOpacity style={styles.headerButton}>
              <Icon name="flash" size={24} color="#FFD700" />
            </TouchableOpacity>
          </View>
          <View style={styles.topBarRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Icon name="camera" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Icon name="settings" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Bottom Gradient with User Info */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.95)']}
        style={styles.bottomGradient}
      >
        <View style={styles.userInfo}>
          <View style={styles.userNameContainer}>
            <Text style={styles.userName}>
              {user.name}, {user.age}
            </Text>
            <View style={styles.locationBadge}>
              <Icon name="location" size={14} color="#FF6B9D" />
              <Text style={styles.locationText}>{user.distance || 'N/A'} km away</Text>
            </View>
          </View>
          <Text style={styles.userBio}>{user.bio}</Text>
        </View>

        {/* Match Indicator */}
        {currentIndex === 0 && (
          <View style={styles.matchIndicator}>
            <View style={styles.matchAvatarContainer}>
              <Image
                source={{ uri: user.images[0] }}
                style={styles.matchAvatar}
              />
              <View style={styles.matchBadge}>
                <Icon name="heart" size={12} color="#FF6B9D" />
              </View>
            </View>
            <Text style={styles.matchText}>{user.name} also liked you!</Text>
          </View>
        )}
      </LinearGradient>

      {/* Right Side Actions */}
      <View style={styles.rightActions}>
        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <LinearGradient
              colors={['#FF6B9D', '#FF1493']}
              style={styles.actionButtonGradient}
            >
              <Icon name="heart" size={28} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.actionText}>{user.likes || 235}</Text>
        </View>

        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <View style={styles.actionButtonPlain}>
              <Icon name="chatbubble" size={24} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.actionText}>10.2k</Text>
        </View>

        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <View style={styles.actionButtonPlain}>
              <Icon name="paper-plane" size={24} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.profilePic}>
          <Image source={{ uri: user.images[0] }} style={styles.profileImage} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    width,
    height,
    position: 'absolute',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  topBarLeft: {
    flex: 1,
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 280,
    justifyContent: 'flex-end',
    paddingBottom: 80,
    paddingHorizontal: 20,
  },
  userInfo: {
    marginBottom: 16,
  },
  userNameContainer: {
    marginBottom: 8,
  },
  userName: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 6,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 157, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  locationText: {
    color: '#FF6B9D',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  userBio: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.95,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.3)',
  },
  matchAvatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  matchAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  matchBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFF',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rightActions: {
    position: 'absolute',
    right: 12,
    bottom: 100,
    alignItems: 'center',
    gap: 4,
  },
  actionItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 6,
  },
  actionButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonPlain: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  profilePic: {
    marginTop: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FF6B9D',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default HomeScreen;
