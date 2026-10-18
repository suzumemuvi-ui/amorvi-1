import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { API_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContextV2';
import { useLocationTracking } from '../hooks/useLocationTracking';
type Post = {
  id: string;
  user: any;
  images: string[];
  caption: string;
  likes: number;
  comments: number;
  userLiked: boolean;
  userInterested: boolean;
  createdAt: string;
};

export default function HomeScreen({ userId, latitude, longitude }: any) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { location } = useLocationTracking();

  // Use location from hook or passed props
  const currentLat = location?.latitude ?? latitude;
  const currentLon = location?.longitude ?? longitude;

  useEffect(() => {
    if (!token || !currentLat || !currentLon) return;

    fetchNearbyPosts();
    const interval = setInterval(fetchNearbyPosts, 15000);
    return () => clearInterval(interval);
  }, [currentLat, currentLon, token]);

  const fetchNearbyPosts = async () => {
    if (!token || !currentLat || !currentLon) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/posts/nearby?latitude=${currentLat}&longitude=${currentLon}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        console.error(`API error: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.error('Response:', text);
        setPosts([]);
        return;
      }

      const data = (await res.json()) as any;
      setPosts(Array.isArray(data) ? data : data.posts || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostLike = async (postId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setPosts(
          posts.map(p =>
            p.id === postId ? { ...p, userLiked: true, likes: p.likes + 1 } : p,
          ),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInterested = async (targetUserId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/interested`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId }),
      });
      if (res.ok) {
        setPosts(
          posts.map(p =>
            p.user.id === targetUserId ? { ...p, userInterested: true } : p,
          ),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#FF006E" />;

  return (
    <ScrollView style={styles.container}>
      {posts.length === 0 ? (
        <Text style={styles.emptyText}>No posts nearby</Text>
      ) : (
        posts.map(post => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Image source={{ uri: post.user.images[0] }} style={styles.avatar} />
              <View>
                <Text style={styles.userName}>
                  {post.user.name}, {post.user.age}
                </Text>
                <Text style={styles.userLocation}>
                  📍{' '}
                  {post.user.location
                    ? `${post.user.location.latitude.toFixed(2)}`
                    : 'N/A'}
                </Text>
              </View>
            </View>

            {post.images[0] && (
              <Image source={{ uri: post.images[0] }} style={styles.postImage} />
            )}

            <View style={styles.postActions}>
              <TouchableOpacity
                onPress={() => handlePostLike(post.id)}
                style={[styles.actionBtn, post.userLiked && styles.liked]}
              >
                <Text style={styles.actionText}>
                  {post.userLiked ? '❤️' : '🤍'} {post.likes}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionText}>💬 {post.comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleInterested(post.user.id)}
                style={[styles.actionBtn, post.userInterested && styles.interested]}
              >
                <Text style={styles.actionText}>
                  {post.userInterested ? '💗' : '🤍'} Interested
                </Text>
              </TouchableOpacity>
            </View>

            {post.caption && (
              <Text style={styles.caption}>{post.caption}</Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  emptyText: { color: '#999', textAlign: 'center', marginTop: 40 },
  postCard: {
    marginBottom: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  postHeader: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  userLocation: { fontSize: 12, color: '#999' },
  postImage: { width: '100%', height: 300, backgroundColor: '#333' },
  postActions: {
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'space-around',
  },
  actionBtn: { padding: 8 },
  actionText: { fontSize: 14, color: '#FF006E' },
  liked: { opacity: 1 },
  interested: { opacity: 1 },
  caption: { paddingHorizontal: 12, paddingBottom: 12, color: '#ddd', fontSize: 14 },
});
