import React, { useEffect, useState } from 'react';
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

const { width, height } = Dimensions.get('window');

interface StoryViewerProps {
  visible: boolean;
  onClose: () => void;
  story: { uri: string; type: 'photo' | 'video'; timestamp: number };
  userName: string;
  userAge: number;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  visible,
  onClose,
  story,
  userName,
  userAge,
}) => {
  const [progress, setProgress] = useState(0);
  const [timeAgo, setTimeAgo] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!visible) {
      setProgress(0);
      return;
    }

    // Calculate time ago
    const now = Date.now();
    const elapsed = now - story.timestamp;
    const hours = Math.floor(elapsed / (60 * 60 * 1000));
    const minutes = Math.floor((elapsed % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 0) {
      setTimeAgo(`${hours}h ago`);
    } else if (minutes > 0) {
      setTimeAgo(`${minutes}m ago`);
    } else {
      setTimeAgo('Just now');
    }

    // Update time remaining every second
    const updateTimeRemaining = () => {
      const now = Date.now();
      const elapsed = now - story.timestamp;
      const remaining = 24 * 60 * 60 * 1000 - elapsed;

      if (remaining <= 0) {
        setTimeRemaining('Expired');
      } else {
        const hoursLeft = Math.floor(remaining / (60 * 60 * 1000));
        const minutesLeft = Math.floor(
          (remaining % (60 * 60 * 1000)) / (60 * 1000),
        );
        setTimeRemaining(`${hoursLeft}h ${minutesLeft}m remaining`);
      }
    };

    updateTimeRemaining();
    const remainingInterval = setInterval(updateTimeRemaining, 60000); // Update every minute

    // Progress bar animation (5 seconds)
    const duration = 5000;
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
        onClose();
      }
    }, interval);

    return () => {
      clearInterval(timer);
      clearInterval(remainingInterval);
    };
  }, [visible, story.timestamp, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        <Image source={{ uri: story.uri }} style={styles.storyImage} />

        {/* Dark overlay */}
        <View style={styles.overlay} />

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image source={{ uri: story.uri }} style={styles.userAvatar} />
            <View>
              <Text style={styles.userName}>
                {userName}, {userAge}
              </Text>
              <Text style={styles.timeAgo}>{timeAgo}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={30} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Time Remaining Badge */}
        <View style={styles.timeRemainingBadge}>
          <Icon name="time-outline" size={16} color="#FFF" />
          <Text style={styles.timeRemainingText}>{timeRemaining}</Text>
        </View>

        {/* Tap areas for navigation */}
        <View style={styles.tapArea}>
          <TouchableOpacity
            style={styles.leftTap}
            onPress={onClose}
            activeOpacity={1}
          />
          <TouchableOpacity
            style={styles.rightTap}
            onPress={onClose}
            activeOpacity={1}
          />
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
  storyImage: {
    width: width,
    height: height,
    resizeMode: 'contain',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  progressBarContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
  },
  header: {
    position: 'absolute',
    top: 25,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeAgo: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.8,
  },
  closeButton: {
    padding: 5,
  },
  timeRemainingBadge: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },
  timeRemainingText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tapArea: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  leftTap: {
    flex: 1,
  },
  rightTap: {
    flex: 1,
  },
});
