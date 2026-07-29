import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { matches, messages, users } from '../data/mockData';

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

  const [showMatch, setShowMatch] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messageText, setMessageText] = useState('');

  const handleKeepSwiping = () => {
    setShowMatch(false);
  };

  const handleChatNow = () => {
    setShowMatch(false);
    setShowChat(true);
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)}km`;
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

  if (showMatch) {
    // Match Screen
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#FF6B9D', '#C06C84', '#6C5B7B']}
          style={styles.matchContainer}
        >
          <TouchableOpacity style={styles.closeButton}>
            <Icon name="close" size={30} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.matchContent}>
            <Text style={styles.matchTitle}>It's a Match!</Text>

            <View style={styles.matchPhotos}>
              <View style={styles.heartContainer}>
                <LinearGradient
                  colors={['#FF6B9D', '#FF1493']}
                  style={styles.heartGradient}
                >
                  <Icon name="heart" size={60} color="#FFF" />
                </LinearGradient>
              </View>
              <Image
                source={{ uri: users[0].images[0] }}
                style={[styles.matchPhoto, styles.matchPhotoLeft]}
              />
              <Image
                source={{ uri: 'https://picsum.photos/400/600?random=50' }}
                style={[styles.matchPhoto, styles.matchPhotoRight]}
              />
            </View>

            <Text style={styles.matchSubtitle}>
              You and Alex like each other✨
            </Text>

            <View style={styles.matchButtons}>
              <TouchableOpacity
                style={styles.keepSwipingButton}
                onPress={handleKeepSwiping}
              >
                <Text style={styles.keepSwipingText}>Keep Swiping</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chatNowButton}
                onPress={handleChatNow}
              >
                <Text style={styles.chatNowText}>Chat Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (showChat) {
    // Chat Screen
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setShowChat(false)}>
            <Icon name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <View style={styles.chatHeaderCenter}>
            <Image
              source={{ uri: users[0].images[0] }}
              style={styles.chatAvatar}
            />
            <Text style={styles.chatHeaderName}>Alex</Text>
          </View>
          <TouchableOpacity>
            <Icon name="ellipsis-vertical" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView style={styles.messagesContainer}>
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.senderId === '1' ? styles.myMessage : styles.theirMessage,
              ]}
            >
              {msg.senderId !== '1' && (
                <Image
                  source={{ uri: users[0].images[0] }}
                  style={styles.messageAvatar}
                />
              )}
              <View
                style={[
                  styles.messageContent,
                  msg.senderId === '1'
                    ? styles.myMessageContent
                    : styles.theirMessageContent,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.senderId === '1' && styles.myMessageText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input Bar */}
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
          <TextInput
            style={styles.messageInput}
            placeholder="Write a message..."
            placeholderTextColor="#999"
            value={messageText}
            onChangeText={setMessageText}
          />
          <TouchableOpacity style={styles.sendButton}>
            <Icon name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Matches List Screen
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <ScrollView style={styles.matchesList}>
        {matches.map(match => (
          <TouchableOpacity
            key={match.id}
            style={styles.matchItem}
            onPress={() => setShowChat(true)}
          >
            <Image
              source={{ uri: match.user.images[0] }}
              style={styles.matchItemAvatar}
            />
            <View style={styles.matchItemContent}>
              <Text style={styles.matchItemName}>{match.user.name}</Text>
              <Text style={styles.matchItemMessage} numberOfLines={1}>
                {match.lastMessage}
              </Text>
            </View>
            <Text style={styles.matchItemTime}>10:30</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  matchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  matchContent: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  matchTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 40,
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
  matchSubtitle: {
    fontSize: 18,
    color: '#FFF',
    marginBottom: 40,
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
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  matchesList: {
    flex: 1,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  matchItemAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  matchItemContent: {
    flex: 1,
  },
  matchItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
  },
  matchItemMessage: {
    fontSize: 14,
    color: '#666',
  },
  matchItemTime: {
    fontSize: 12,
    color: '#999',
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
});

export default DatingScreen;
