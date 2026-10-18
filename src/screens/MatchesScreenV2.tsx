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

type Match = {
  id: string;
  user: any;
  matchedAt: string;
};

export default function MatchesScreen({ userId, onNavigateToChat }: any) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/matches`, {
        headers: {
          Authorization: `Bearer ${(global as any).userToken}`,
        },
      });
      const data = (await res.json()) as { matches: Match[] };
      setMatches(data.matches || []);
    } catch (err) {
      console.error(err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#FF006E" />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>💕 Matches</Text>
      {matches.length === 0 ? (
        <Text style={styles.empty}>No matches yet. Start by being interested! 💗</Text>
      ) : (
        matches.map(match => (
          <TouchableOpacity
            key={match.id}
            style={styles.matchCard}
            onPress={() => onNavigateToChat && onNavigateToChat(match)}
          >
            <Image source={{ uri: match.user.images[0] }} style={styles.avatar} />
            <View style={styles.matchInfo}>
              <Text style={styles.matchName}>
                {match.user.name}, {match.user.age}
              </Text>
              <Text style={styles.matchBio}>
                {match.user.bio && match.user.bio.substring(0, 50)}...
              </Text>
              <Text style={styles.matchedTime}>
                Matched {new Date(match.matchedAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FF006E', margin: 16 },
  matchCard: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  matchInfo: { flex: 1 },
  matchName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  matchBio: { fontSize: 12, color: '#999', marginTop: 4 },
  matchedTime: { fontSize: 11, color: '#666', marginTop: 4 },
  arrow: { fontSize: 18, color: '#FF006E' },
  empty: { color: '#999', textAlign: 'center', marginTop: 40, fontSize: 14 },
});
