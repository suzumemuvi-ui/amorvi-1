import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { users, currentUser } from '../data/mockData';

const MapScreen = () => {
  // Set fallback coordinates if mock data fields are undefined
  const defaultLat = currentUser?.location?.latitude || 37.78825;
  const defaultLng = currentUser?.location?.longitude || -122.4324;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Map Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Map</Text>
      </View>

      {/* Map Wrapping Body View */}
      <View style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFillObject} // Forces map to fill its explicit boundary
          initialRegion={{
            latitude: defaultLat,
            longitude: defaultLng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          {/* Current User Marker Area Circle */}
          <Circle
            center={{ latitude: defaultLat, longitude: defaultLng }}
            radius={500}
            strokeColor="rgba(255, 107, 157, 0.5)"
            fillColor="rgba(255, 107, 157, 0.1)"
            strokeWidth={2}
          />

          {/* Core Target Center Marker */}
          <Marker coordinate={{ latitude: defaultLat, longitude: defaultLng }}>
            <View style={styles.currentUserMarker}>
              <LinearGradient
                colors={['#FF6B9D', '#FF1493']}
                style={styles.currentUserGradient}
              >
                <Icon name="heart" size={24} color="#FFF" />
              </LinearGradient>
            </View>
          </Marker>

          {/* Other Detected Users Markers */}
          {users?.map(user => {
            if (!user.location) return null;
            return (
              <Marker
                key={user.id}
                coordinate={{
                  latitude: user.location.latitude,
                  longitude: user.location.longitude,
                }}
                // tracksViewChanges={false} prevents performance lag after initial image load
                tracksViewChanges={false} 
              >
                <View style={styles.userMarker}>
                  <Image
                    source={{ uri: user.images?.[0] || 'https://via.placeholder.com/150' }}
                    style={styles.markerImage}
                  />
                  <View style={styles.markerHeart}>
                    <Icon name="heart" size={12} color="#FF6B9D" />
                  </View>
                </View>
              </Marker>
            );
          })}
        </MapView>
      </View>

      {/* Bottom Floating Information Panel */}
      <View style={styles.bottomCard}>
        <View style={styles.addressContainer}>
          <Icon name="location" size={20} color="#FF6B9D" />
          <Text style={styles.addressText}>240 Fisher Rd</Text>
        </View>

        <View style={styles.matchInfo}>
          <Text style={styles.matchesNow}>Matches Now: Vic</Text>
          <TouchableOpacity>
            <Icon name="chevron-down" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Menu Navigation Tray */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navIcon}><Icon name="flash" size={24} color="#000" /></TouchableOpacity>
        <TouchableOpacity style={styles.navIcon}><Icon name="camera" size={24} color="#000" /></TouchableOpacity>
        <TouchableOpacity style={styles.navIcon}><Icon name="globe" size={24} color="#FF6B9D" /></TouchableOpacity>
        <TouchableOpacity style={styles.navIcon}><Icon name="apps" size={24} color="#000" /></TouchableOpacity>
        <TouchableOpacity style={styles.navIcon}><Icon name="person" size={24} color="#000" /></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  currentUserMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentUserGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  userMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  markerHeart: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: '#FFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B9D',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 5,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchesNow: {
    fontSize: 14,
    color: '#666',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingBottom: 24,
    zIndex: 5,
  },
  navIcon: {
    padding: 8,
  },
});

export default MapScreen;