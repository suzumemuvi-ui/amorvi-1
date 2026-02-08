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
          <TouchableOpacity>
            <Icon name="flash" size={24} color="#FFD700" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="camera" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Bottom Gradient with User Info */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.bottomGradient}
      >
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user.name}, {user.age}
          </Text>
          <Text style={styles.userBio}>❤️ {user.bio}</Text>
        </View>

        {/* Match Indicator */}
        {currentIndex === 0 && (
          <View style={styles.matchIndicator}>
            <View style={styles.matchAvatarContainer}>
              <Image
                source={{ uri: user.images[0] }}
                style={styles.matchAvatar}
              />
              <Icon
                name="heart"
                size={16}
                color="#FF6B9D"
                style={styles.matchIcon}
              />
            </View>
            <Text style={styles.matchText}>Alex, 23</Text>
          </View>
        )}
      </LinearGradient>

      {/* Right Side Actions */}
      <View style={styles.rightActions}>
        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Icon name="heart" size={32} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.actionText}>{user.likes || 235}</Text>
        </View>

        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <Icon name="chatbubble" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.actionText}>10.2k</Text>
        </View>

        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icon name="paper-plane" size={28} color="#FFF" />
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
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
    justifyContent: 'flex-end',
    paddingBottom: 80,
    paddingHorizontal: 20,
  },
  userInfo: {
    marginBottom: 10,
  },
  userName: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userBio: {
    color: '#FFF',
    fontSize: 16,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  matchAvatarContainer: {
    position: 'relative',
    marginRight: 8,
  },
  matchAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  matchIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  matchText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rightActions: {
    position: 'absolute',
    right: 15,
    bottom: 100,
    alignItems: 'center',
  },
  actionItem: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 5,
  },
  actionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  profilePic: {
    marginTop: 10,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFF',
  },
});

export default HomeScreen;
