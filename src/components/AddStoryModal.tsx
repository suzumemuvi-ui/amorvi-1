import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  CameraOptions,
} from 'react-native-image-picker';

interface AddStoryModalProps {
  visible: boolean;
  onClose: () => void;
  onAddStory: (storyData: {
    uri: string;
    type: 'photo' | 'video';
    timestamp: number;
  }) => void;
}

export const AddStoryModal: React.FC<AddStoryModalProps> = ({
  visible,
  onClose,
  onAddStory,
}) => {
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Camera permission is required to take photos',
      );
      return;
    }

    const options: CameraOptions = {
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: true,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to open camera');
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.uri) {
          onAddStory({ uri: asset.uri, type: 'photo', timestamp: Date.now() });
          Alert.alert('Success', 'Photo added to your story!');
          onClose();
        }
      }
    });
  };

  const handleVideo = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Camera permission is required to record videos',
      );
      return;
    }

    const options: CameraOptions = {
      mediaType: 'video',
      videoQuality: 'high',
      durationLimit: 30,
      saveToPhotos: true,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled video recording');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to record video');
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.uri) {
          onAddStory({ uri: asset.uri, type: 'video', timestamp: Date.now() });
          Alert.alert('Success', 'Video added to your story!');
          onClose();
        }
      }
    });
  };

  const handleGallery = () => {
    const options: CameraOptions = {
      mediaType: 'mixed',
      quality: 1,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled gallery picker');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to open gallery');
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.uri) {
          const type = asset.type?.includes('video') ? 'video' : 'photo';
          onAddStory({ uri: asset.uri, type, timestamp: Date.now() });
          Alert.alert('Success', `${type} added to your story!`);
          onClose();
        }
      }
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Story</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.option} onPress={handleCamera}>
              <LinearGradient
                colors={['#FF6B9D', '#FF1493']}
                style={styles.optionIcon}
              >
                <Icon name="camera" size={32} color="#FFF" />
              </LinearGradient>
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={handleVideo}>
              <LinearGradient
                colors={['#9C27B0', '#E91E63']}
                style={styles.optionIcon}
              >
                <Icon name="videocam" size={32} color="#FFF" />
              </LinearGradient>
              <Text style={styles.optionText}>Record Video</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={handleGallery}>
              <LinearGradient
                colors={['#2196F3', '#00BCD4']}
                style={styles.optionIcon}
              >
                <Icon name="images" size={32} color="#FFF" />
              </LinearGradient>
              <Text style={styles.optionText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <Icon name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              Stories disappear after 24 hours
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    gap: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 15,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
});
