import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const [aMomentsMode, setAMomentsMode] = useState<'photo' | 'video' | 'post' | null>(null);
  const [postText, setPostText] = useState('');
  const [feedVisible, setFeedVisible] = useState(false);
  const [feedItems, setFeedItems] = useState<Array<{id: string; text: string; createdAt: string}>>([]);
  const showFeed = feedVisible || feedItems.length > 0;

  const shareAMoment = (type: 'photo' | 'video') => {
    setAMomentsMode(type);
  };

  const writePost = () => {
    setAMomentsMode('post');
  };

  const closeModal = () => {
    setAMomentsMode(null);
    setPostText('');
  };

  const handleMediaShare = (source: 'gallery' | 'camera') => {
    Alert.alert(
      'AMoment Shared',
      `Your ${aMomentsMode === 'photo' ? 'photo' : 'video'} from ${source === 'gallery' ? 'gallery' : 'camera'} is ready!`,
    );
    closeModal();
  };

  const handlePostShare = () => {
    if (!postText.trim()) {
      Alert.alert('Write something first', 'Please type your post before sharing.');
      return;
    }

    const newFeedItem = {
      id: Date.now().toString(),
      text: postText.trim(),
      createdAt: new Date().toLocaleString(),
    };

    setFeedItems(prev => [newFeedItem, ...prev]);
    setFeedVisible(true);
    closeModal();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden />

      {/* OVERLAY UI */}
      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <TouchableOpacity>
            <Icon name="flash" size={26} color="#fff" />
          </TouchableOpacity>

          <View style={styles.topBarRight}>
            <TouchableOpacity
              style={styles.topActionButton}
              onPress={() => shareAMoment('photo')}
            >
              <Icon name="image-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.topActionButton}
              onPress={() => shareAMoment('video')}
            >
              <Icon name="videocam-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.topActionButton}
              onPress={writePost}
            >
              <Icon name="newspaper-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.actionHint}>
          <Text style={styles.aMomentsTitle}>AMoments</Text>
          <Text style={styles.aMomentsSubtitle}>
            Use the top-right icons to share a photo, video, or quick post.
          </Text>
        </View>
        {showFeed && (
          <View style={styles.feedContainer}>
            <Text style={styles.feedTitle}>Your AMoments Feed</Text>
            <Text style={styles.feedSubtitle}>Latest posts appear here.</Text>
            <ScrollView contentContainerStyle={styles.feedScroll}>
              {feedItems.length === 0 ? (
                <Text style={styles.feedEmpty}>No posts yet. Write an AMoment first.</Text>
              ) : (
                feedItems.map(item => (
                  <View key={item.id} style={styles.feedItem}>
                    <Text style={styles.feedItemText}>{item.text}</Text>
                    <Text style={styles.feedItemTime}>{item.createdAt}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        )}

        <Modal visible={Boolean(aMomentsMode)} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {aMomentsMode === 'post'
                  ? 'Write an AMoment'
                  : aMomentsMode === 'photo'
                  ? 'Share a Photo'
                  : 'Share a Video'}
              </Text>

              {aMomentsMode === 'post' ? (
                <>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Write what you're sharing..."
                    placeholderTextColor="#999"
                    value={postText}
                    onChangeText={setPostText}
                    multiline
                  />
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.cancelButton]}
                      onPress={closeModal}
                    >
                      <Text style={styles.modalActionText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.shareButton]}
                      onPress={handlePostShare}
                    >
                      <Text style={styles.modalActionText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.modalText}>
                    Choose a source to attach your {aMomentsMode}.
                  </Text>
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.shareButton]}
                      onPress={() => handleMediaShare('gallery')}
                    >
                      <Text style={styles.modalActionText}>Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.cancelButton]}
                      onPress={() => handleMediaShare('camera')}
                    >
                      <Text style={styles.modalActionText}>Camera</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={closeModal}
                  >
                    <Text style={styles.modalCloseText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },

  center: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  guideBox: {
    alignSelf: 'center',
    width: width * 0.6,
    height: width * 0.8,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    marginTop: 80,
  },

  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
  },

  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  actionHint: {
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  aMomentsTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  aMomentsSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  aMomentsActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aMomentsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 4,
    gap: 8,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topActionButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalText: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 16,
  },
  modalInput: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 14,
    color: '#FFF',
    textAlignVertical: 'top',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalActionButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2b2b2b',
  },
  shareButton: {
    backgroundColor: '#FF6B9D',
  },
  modalActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalClose: {
    marginTop: 14,
    alignSelf: 'center',
  },
  modalCloseText: {
    color: '#FF6B9D',
    fontSize: 14,
  },
  photoButton: {
    backgroundColor: '#FF6B9D',
  },
  videoButton: {
    backgroundColor: '#8D33FF',
  },
  writeButton: {
    backgroundColor: '#FFB300',
  },
  aMomentsButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  feedContainer: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 40,
  },
  feedTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  feedSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 16,
  },
  feedScroll: {
    paddingBottom: 16,
  },
  feedEmpty: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
  },
  feedItem: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  feedItemText: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  feedItemTime: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
  },
});