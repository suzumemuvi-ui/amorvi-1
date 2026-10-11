import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
  Image,
  SafeAreaView,
  Modal,
  TextInput,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { addInterestedProfile } from '../data/amorviRelationshipState';
import { FeedPost, User } from '../types';

const homeFeedSeed: FeedPost[] = [
  {
    id: 'post-1',
    user: {
      id: 'p1',
      name: 'Emily',
      age: 24,
      bio: 'Travel • Coffee • Photography',
      images: ['https://picsum.photos/800/1000?random=101'],
      distance: 1.4,
      city: 'Downtown',
      interests: ['Travel', 'Coffee', 'Photography'],
    },
    text: 'Sunrise walk + espresso before the day starts. ☕️',
    mediaUrl: 'https://picsum.photos/800/1000?random=101',
    mediaType: 'photo',
    likes: 236,
    likedByCurrentUser: false,
    comments: [{ id: 'c1', author: 'Mia', text: 'This is gorgeous 😍' }],
  },
  {
    id: 'post-2',
    user: {
      id: 'p2',
      name: 'Noah',
      age: 27,
      bio: 'Weekend adventures and good playlists',
      images: ['https://picsum.photos/800/1000?random=202'],
      distance: 1.8,
      city: 'Old Town',
      interests: ['Hiking', 'Music', 'Travel'],
    },
    text: 'That view was worth the climb. Perfect spot for a quick reset.',
    mediaUrl: 'https://picsum.photos/800/1000?random=202',
    mediaType: 'photo',
    likes: 412,
    likedByCurrentUser: true,
    comments: [{ id: 'c2', author: 'Lina', text: 'This should be on a postcard' }],
  },
  {
    id: 'post-3',
    user: {
      id: 'p3',
      name: 'Ava',
      age: 25,
      bio: 'Street food and city nights',
      images: ['https://picsum.photos/800/1000?random=303'],
      distance: 2.1,
      city: 'Riverfront',
      interests: ['Food', 'Nightlife', 'Design'],
    },
    text: 'Quick reel from tonight’s walk-around. Best city lights are the quiet ones.',
    mediaUrl: 'https://picsum.photos/800/1000?random=303',
    mediaType: 'video',
    likes: 189,
    likedByCurrentUser: false,
    comments: [{ id: 'c3', author: 'Sam', text: 'Mood' }],
  },
];

const HomeScreen = ({ navigation }: { navigation?: any }) => {
  const [posts, setPosts] = useState<FeedPost[]>(homeFeedSeed);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const likeAnimations = useRef<{ [key: string]: Animated.Value }>({});
  const commentModalScale = useRef(new Animated.Value(0)).current;

  const handleLike = (postId: string) => {
    if (!likeAnimations.current[postId]) {
      likeAnimations.current[postId] = new Animated.Value(1);
    }

    Animated.sequence([
      Animated.timing(likeAnimations.current[postId], {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimations.current[postId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) {
          return post;
        }

        const likedByCurrentUser = !post.likedByCurrentUser;

        return {
          ...post,
          likedByCurrentUser,
          likes: Math.max(0, post.likes + (likedByCurrentUser ? 1 : -1)),
        };
      }),
    );
  };

  const handleComment = (post: FeedPost) => {
    setActiveCommentPostId(post.id);
    setCommentDraft('');
    commentModalScale.setValue(0);
    Animated.spring(commentModalScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const submitComment = () => {
    if (!activeCommentPostId || !commentDraft.trim()) {
      return;
    }

    setPosts(prev =>
      prev.map(post => {
        if (post.id !== activeCommentPostId) {
          return post;
        }

        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `${activeCommentPostId}-comment-${Date.now()}`,
              author: 'You',
              text: commentDraft.trim(),
            },
          ],
        };
      }),
    );

    setCommentDraft('');
    setActiveCommentPostId(null);
    Animated.timing(commentModalScale, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleInterested = (user: User) => {
    addInterestedProfile({
      id: user.id,
      name: user.name,
      age: user.age,
      bio: user.bio ?? 'Nearby match',
      images: user.images ?? [],
      city: user.city ?? 'Nearby',
      distance: user.distance ?? 1.4,
      interests: user.interests ?? ['Travel'],
    });

    Alert.alert('Added to Interested', `${user.name} is now in your Amorvi shortlist.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>Nearby</Text>
          <Text style={styles.headerTitle}>Discover</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.headerBadge}>
            <Icon name="add" size={20} color="#FFF" />
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation?.navigate('Notifications')}
            activeOpacity={0.85}
          >
            <Icon name="notifications" size={20} color="#FFF" />
            <View style={styles.notificationDot}>
              <Text style={styles.notificationDotText}>8</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.feedContent} showsVerticalScrollIndicator={false}>
        {posts.map(post => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Image source={{ uri: post.user.images[0] }} style={styles.avatar} />

              <View style={styles.userMeta}>
                <Text style={styles.userName}>
                  {post.user.name}, {post.user.age}
                </Text>
                <Text style={styles.userDistance}>{post.user.city ?? 'Nearby'} • {post.user.distance ?? 1.4} km</Text>
              </View>

              <TouchableOpacity style={styles.interestedButton} onPress={() => handleInterested(post.user)}>
                <Text style={styles.interestedButtonText}>💗 Interested</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.postText}>{post.text}</Text>

            <Image source={{ uri: post.mediaUrl }} style={styles.media} resizeMode="cover" />

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(post.id)}>
                <Animated.View
                  style={{
                    transform: [{ scale: likeAnimations.current[post.id] || new Animated.Value(1) }],
                  }}
                >
                  <Icon
                    name={post.likedByCurrentUser ? 'heart' : 'heart-outline'}
                    size={22}
                    color={post.likedByCurrentUser ? '#FF4D8D' : '#fff'}
                  />
                </Animated.View>
                <Text style={styles.actionText}>{post.likes}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => handleComment(post)}>
                <Icon name="chatbubble-outline" size={20} color="#fff" />
                <Text style={styles.actionText}>{post.comments.length}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.commentBox}>
              <Text style={styles.commentAuthor}>{post.comments[0]?.author ?? 'Amorvi'}:</Text>
              <Text style={styles.commentText}> {post.comments[0]?.text ?? 'Looks amazing.'}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {activeCommentPostId && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!activeCommentPostId}
          onRequestClose={() => setActiveCommentPostId(null)}
        >
          <View style={styles.modalContainer}>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ scale: commentModalScale }],
                  opacity: commentModalScale,
                },
              ]}
            >
              <Text style={styles.modalTitle}>Leave a Comment</Text>

              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor="#999"
                value={commentDraft}
                onChangeText={setCommentDraft}
                multiline
              />

              <TouchableOpacity style={styles.submitButton} onPress={submitComment}>
                <Text style={styles.submitButtonText}>Post Comment</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeButton} onPress={() => setActiveCommentPostId(null)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E12',
  },
  header: {
    paddingTop: StatusBar.currentHeight,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabel: {
    color: '#FF9DBF',
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  headerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF2F7D',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,47,125,0.6)',
  },
  notificationDot: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF2F7D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDotText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  feedContent: {
    paddingBottom: 80,
  },
  postCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userMeta: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  userDistance: {
    color: '#cfcfcf',
    fontSize: 12,
    marginTop: 2,
  },
  interestedButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 99, 162, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 117, 177, 0.4)',
  },
  interestedButtonText: {
    color: '#FF9DBF',
    fontSize: 11,
    fontWeight: '700',
  },
  postText: {
    color: '#f2f2f2',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  media: {
    width: '100%',
    height: 360,
    borderRadius: 18,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  commentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentAuthor: {
    color: '#FF9DBF',
    fontWeight: '700',
    fontSize: 12,
  },
  commentText: {
    color: '#efefef',
    fontSize: 12,
    flexShrink: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  commentInput: {
    width: '100%',
    maxHeight: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
  },
  submitButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FF4D8D',
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HomeScreen;
