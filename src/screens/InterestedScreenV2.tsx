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
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContextV2';

type InterestedProfile = {
  id: string;
  user: any;
  interestedAt: string;
};

export default function InterestedScreen({ userId }: any) {
  const [profiles, setProfiles] = useState<InterestedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchInterestedProfiles();
    const interval = setInterval(fetchInterestedProfiles, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchInterestedProfiles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/interested`, {
        headers: {
          Authorization: `Bearer ${(global as any).userToken}`,
        },
      });

      if (!res.ok) {
        console.error(`API error: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.error('Response:', text);
        setProfiles([]);
        return;
      }

      const data = (await res.json()) as { interested?: InterestedProfile[] } | InterestedProfile[];
      const profiles = Array.isArray(data) ? data : data.interested || [];
      setProfiles(profiles);
    } catch (err) {
      console.error('Fetch error:', err);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    const profile = profiles[currentIndex];
    try {
      const res = await fetch(`${API_BASE_URL}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(global as any).userToken}`,
        },
        body: JSON.stringify({ userBId: profile.user.id }),
      });
      const data: any = await res.json();
      if (data.match) {
        console.log('🎉 Its a Match!');
      }
      moveToNext();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePass = async () => {
    const profile = profiles[currentIndex];
    try {
      await fetch(`${API_BASE_URL}/interested/${profile.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${(global as any).userToken}`,
        },
      });
      moveToNext();
    } catch (err) {
      console.error(err);
    }
  };

  const moveToNext = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setProfiles([]);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#FF006E" />;
  if (profiles.length === 0)
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>No interested profiles yet 💗</Text>
      </View>
    );

  const current = profiles[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {current.user.images[0] && (
          <Image source={{ uri: current.user.images[0] }} style={styles.image} />
        )}
        <View style={styles.info}>
          <Text style={styles.name}>
            {current.user.name}, {current.user.age}
          </Text>
          <Text style={styles.location}>
            📍 {current.user.location?.latitude.toFixed(2) || 'N/A'} km
          </Text>
          <Text style={styles.bio}>{current.user.bio}</Text>
          <View style={styles.interests}>
            {current.user.interests &&
              current.user.interests.map((interest: string, idx: number) => (
                <Text key={idx} style={styles.tag}>
                  {interest}
                </Text>
              ))}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={handlePass} style={styles.passBtn}>
          <Text style={styles.passText}>✕ Pass</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLike} style={styles.likeBtn}>
          <Text style={styles.likeText}>❤️ Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 20,
  },
  image: { width: '100%', height: 400, backgroundColor: '#333' },
  info: { padding: 16 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#FF006E' },
  location: { fontSize: 12, color: '#999', marginTop: 4 },
  bio: { fontSize: 14, color: '#ddd', marginTop: 8 },
  interests: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  tag: {
    backgroundColor: '#444',
    color: '#FF006E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 8,
    fontSize: 12,
  },
  actions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  passBtn: { backgroundColor: '#444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  passText: { color: '#999', fontWeight: 'bold' },
  likeBtn: { backgroundColor: '#FF006E', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  likeText: { color: '#fff', fontWeight: 'bold' },
  empty: { color: '#999', textAlign: 'center', fontSize: 16 },
});
