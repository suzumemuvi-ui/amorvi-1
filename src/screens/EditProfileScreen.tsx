import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { currentUser } from '../data/mockData';
import ImagePicker, { ImageLibraryOptions, ImagePickerResponse } from 'react-native-image-picker';

const { width } = Dimensions.get('window');
const imagePickerOptions: ImageLibraryOptions = {
  mediaType: 'photo',
  includeBase64: false,
  maxHeight: 800,
  maxWidth: 800,
};

interface UserEditData {
  firstName: string;
  age: string;
  about: string;
  interests: string[];
  work?: string;
  education?: string;
  language?: string;
}

const EditProfileScreen = ({ navigation }: { navigation?: any }) => {
  const [profileImage, setProfileImage] = useState(currentUser.images[0]);
  const [userData, setUserData] = useState<UserEditData>({
    firstName: currentUser.name,
    age: currentUser.age.toString(),
    about: currentUser.bio,
    interests: ['Music', 'Gym', 'Travel'],
    work: 'Your company',
    education: 'Your education',
    language: '4 km away',
  });
  const [newInterest, setNewInterest] = useState('');

  const handleSelectPhoto = () => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ).then(granted => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          openImagePicker();
        }
      });
    } else {
      openImagePicker();
    }
  };

  const openImagePicker = () => {
    ImagePicker.launchImageLibrary(imagePickerOptions, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets[0] && response.assets[0].uri) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  const handleAddInterest = () => {
    if (newInterest.trim()) {
      setUserData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (index: number) => {
    setUserData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    Alert.alert('Success', 'Profile updated successfully!');
    navigation?.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Icon name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Photo Card */}
        <View style={styles.profilePhotoCard}>
          <Image
            source={{ uri: profileImage }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData.firstName}, {userData.age}</Text>
            <View style={styles.profileStats}>
              <Icon name="heart" size={14} color="#FF6B9D" />
              <Text style={styles.profileStatText}>4 | 1km away</Text>
              <Icon name="camera" size={14} color="#999" />
            </View>
          </View>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => Alert.alert('More Options', 'Photo options coming soon')}
          >
            <Icon name="ellipsis-vertical" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Add Media Button */}
        <TouchableOpacity 
          style={styles.addMediaButton}
          onPress={handleSelectPhoto}
        >
          <Icon name="add-circle" size={24} color="#FF6B9D" />
          <Text style={styles.addMediaText}>Add media</Text>
        </TouchableOpacity>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* First Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>First name</Text>
            <TextInput
              style={styles.input}
              value={userData.firstName}
              onChangeText={text =>
                setUserData(prev => ({ ...prev, firstName: text }))
              }
              placeholder="Enter first name"
              placeholderTextColor="#999"
            />
          </View>

          {/* Age */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={userData.age}
              onChangeText={text =>
                setUserData(prev => ({ ...prev, age: text }))
              }
              placeholder="Enter age"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
          </View>

          {/* About */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>About</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={userData.about}
              onChangeText={text =>
                setUserData(prev => ({ ...prev, about: text }))
              }
              placeholder="Write a little about yourself..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Interests */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Interests</Text>
            <View style={styles.interestsContainer}>
              {userData.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                  <TouchableOpacity onPress={() => handleRemoveInterest(index)}>
                    <Icon name="close-circle" size={16} color="#FF6B9D" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Add Interest Input */}
            <View style={styles.addInterestContainer}>
              <TextInput
                style={styles.addInterestInput}
                value={newInterest}
                onChangeText={setNewInterest}
                placeholder="Add more hobbies"
                placeholderTextColor="#999"
              />
              <TouchableOpacity 
                style={styles.addInterestButton}
                onPress={handleAddInterest}
              >
                <Icon name="add" size={20} color="#FF6B9D" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Work */}
          <View style={styles.formGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Work</Text>
              <Icon name="chevron-forward" size={16} color="#999" />
            </View>
            <Text style={styles.placeholder}>Your company</Text>
          </View>

          {/* Education */}
          <View style={styles.formGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Education</Text>
              <Icon name="chevron-forward" size={16} color="#999" />
            </View>
            <Text style={styles.placeholder}>Pick your education</Text>
          </View>

          {/* Language */}
          <View style={styles.formGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Language</Text>
              <Icon name="chevron-forward" size={16} color="#999" />
            </View>
            <Text style={styles.placeholder}>4 km away</Text>
          </View>
        </View>

        {/* Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE7F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#EDE7F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E0D5F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  profilePhotoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileStatText: {
    fontSize: 12,
    color: '#666',
  },
  moreButton: {
    padding: 8,
  },
  addMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addMediaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  formSection: {
    gap: 16,
  },
  formGroup: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    fontSize: 14,
    color: '#000',
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C5B7B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  interestText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '500',
  },
  addInterestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    marginTop: 12,
  },
  addInterestInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  addInterestButton: {
    padding: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeholder: {
    fontSize: 14,
    color: '#999',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default EditProfileScreen;
