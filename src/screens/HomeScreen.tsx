import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('front');

  const device = useCameraDevice(cameraPosition);
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    requestPermission();
  }, []);

  const flipCamera = () => {
    setCameraPosition(prev => (prev === 'front' ? 'back' : 'front'));
  };

  const openGallery = () => {
    Alert.alert('Gallery', 'Open gallery here');
  };

  const takePhoto = () => {
    Alert.alert('Capture', 'Photo captured');
  };

  if (!device || !hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>No Camera Access</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden />

      {/* CAMERA FULL SCREEN */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />

      {/* OVERLAY UI (TikTok/Snapchat style) */}
      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <TouchableOpacity>
            <Icon name="flash" size={26} color="#fff" />
          </TouchableOpacity>w

          <TouchableOpacity>
            <Icon name="settings" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Center guide (optional UI) */}
        <View style={styles.guideBox} />

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={openGallery}>
            <Icon name="images" size={30} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={takePhoto}
            style={styles.captureButton}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>

          <TouchableOpacity onPress={flipCamera}>
            <Icon name="camera-reverse" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
});