import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

interface AlbumItemViewerProps {
  visible: boolean;
  onClose: () => void;
  item: { uri: string; type: 'photo' | 'video' } | null;
}

export const AlbumItemViewer: React.FC<AlbumItemViewerProps> = ({
  visible,
  onClose,
  item,
}) => {
  const [paused, setPaused] = useState(false);

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        {item.type === 'video' ? (
          <>
            <Video
              source={{ uri: item.uri }}
              style={styles.video}
              resizeMode="contain"
              paused={paused}
              controls={false}
              repeat={true}
            />

            {/* Play/Pause overlay */}
            <TouchableOpacity
              style={styles.videoTapArea}
              onPress={() => setPaused(!paused)}
              activeOpacity={1}
            >
              {paused && (
                <View style={styles.playButton}>
                  <Icon
                    name="play-circle"
                    size={80}
                    color="rgba(255,255,255,0.9)"
                  />
                </View>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Image source={{ uri: item.uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.tapArea}
              onPress={onClose}
              activeOpacity={1}
            />
          </>
        )}

        {/* Dark overlay */}
        <View style={styles.overlay} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={30} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    width: width,
    height: height,
    resizeMode: 'contain',
  },
  video: {
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    pointerEvents: 'none',
  },
  header: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  videoTapArea: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapArea: {
    ...StyleSheet.absoluteFillObject,
  },
});
