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

type Connection = {
  id: string;
  user: any;
  connectedAt: string;
};

export default function ConnectionsScreen({ userId, onNavigateToChat }: any) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
    const interval = setInterval(fetchConnections, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/connections`, {
        headers: {
          Authorization: `Bearer ${(global as any).userToken}`,
        },
      });

      if (!res.ok) {
        console.error(`API error: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.error('Response:', text);
        setConnections([]);
        return;
      }

      const data = (await res.json()) as { connections?: Connection[] };
      setConnections(data.connections || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#8B5CF6" />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>👥 Friends (Connections)</Text>
      {connections.length === 0 ? (
        <Text style={styles.empty}>No connections yet. Send a Connect request! 👥</Text>
      ) : (
        connections.map(conn => (
          <TouchableOpacity
            key={conn.id}
            style={styles.connCard}
            onPress={() => onNavigateToChat && onNavigateToChat(conn)}
          >
            <Image source={{ uri: conn.user.images[0] }} style={styles.avatar} />
            <View style={styles.connInfo}>
              <Text style={styles.connName}>{conn.user.name}</Text>
              <Text style={styles.connBio}>
                {conn.user.bio && conn.user.bio.substring(0, 50)}...
              </Text>
              <Text style={styles.connectedTime}>
                Connected {new Date(conn.connectedAt).toLocaleDateString()}
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
  title: { fontSize: 20, fontWeight: 'bold', color: '#8B5CF6', margin: 16 },
  connCard: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  connInfo: { flex: 1 },
  connName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  connBio: { fontSize: 12, color: '#999', marginTop: 4 },
  connectedTime: { fontSize: 11, color: '#666', marginTop: 4 },
  arrow: { fontSize: 18, color: '#8B5CF6' },
  empty: { color: '#999', textAlign: 'center', marginTop: 40, fontSize: 14 },
});
