import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useUser } from '../context/AmorviContext';

/**
 * Refactored Home Screen using XState
 * Demonstrates user list management with state machine
 */
const HomeScreenXState = () => {
  const { state, send, context, matches } = useUser();
  const isLoaded = matches('loaded');
  const isLoading = matches('loading');
  const isVerified = matches('verified');
  const hasError = matches('error');

  React.useEffect(() => {
    // Load users on mount
    send({ type: 'LOAD_USERS' });
  }, []);

  const handleRefresh = () => {
    send({ type: 'LOAD_USERS' });
  };

  const handleUserSelect = (userId: string) => {
    // Handle user selection
    console.log('Selected user:', userId);
  };

  const handleVerifyUser = () => {
    send({ type: 'VERIFY_USER' });
  };

  const renderUserCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserSelect(item.id)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userBio}>{item.bio}</Text>
        </View>
        {item.verified && (
          <Icon name="checkmark-circle" size={24} color="#00D084" />
        )}
      </View>
      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.likeButton}>
          <Icon name="heart" size={24} color="#FF6B9D" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.commentButton}>
          <Icon name="chatbubble" size={24} color="#1E90FF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton}>
          <Icon name="close" size={24} color="#999" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && context.users.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B9D" />
          <Text style={styles.loadingText}>Loading profiles...</Text>
        </View>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color="#FF4444" />
          <Text style={styles.errorText}>
            {context.error || 'An error occurred'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>AMORVI</Text>
          <Text style={styles.headerSubtitle}>Discover Matches</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Icon name="settings" size={24} color="#FF6B9D" />
        </TouchableOpacity>
      </View>

      {/* State Indicator */}
      {__DEV__ && (
        <View style={styles.stateIndicator}>
          <Text style={styles.stateText}>
            State: {JSON.stringify(state.value)} | Users: {context.users.length}
          </Text>
        </View>
      )}

      {/* Users List or Empty State */}
      {context.users.length > 0 ? (
        <FlatList
          data={context.users}
          renderItem={renderUserCard}
          keyExtractor={(item: any) => item.id}
          onEndReached={handleRefresh}
          onEndReachedThreshold={0.5}
          refreshing={isLoading}
          onRefresh={handleRefresh}
          scrollEventThrottle={16}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="heart-dislike" size={48} color="#999" />
          <Text style={styles.emptyStateText}>
            {isVerified
              ? 'No more profiles to show'
              : 'Start exploring profiles'}
          </Text>
        </View>
      )}

      {/* Verify Button (shown in loaded state) */}
      {isLoaded && !isVerified && (
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerifyUser}
        >
          <Icon name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.verifyButtonText}>Verify Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1B3D',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
  },
  stateIndicator: {
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stateText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 12,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%)',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  userBio: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  likeButton: {
    padding: 12,
  },
  commentButton: {
    padding: 12,
  },
  skipButton: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 12,
    color: '#999',
    fontSize: 14,
  },
  verifyButton: {
    flexDirection: 'row',
    backgroundColor: '#00D084',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default HomeScreenXState;
