import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface AccountInfo {
  email: string;
  phone: string;
  userId: string;
  joinDate: string;
}

const AccountScreen = ({ navigation }: { navigation?: any }) => {
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    email: 'jessica@gmail.com',
    phone: '+1 (555) 123-4567',
    userId: 'amorvi_jessica_2024',
    joinDate: 'January 15, 2024',
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    Alert.alert('Success', 'Password changed successfully!');
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
          },
          style: 'destructive',
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Icon name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Icon name="mail" size={24} color="#FF6B9D" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{accountInfo.email}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Change Email', 'Email change feature coming soon')}>
                <Icon name="chevron-forward" size={20} color="#CCC" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Icon name="call" size={24} color="#FF6B9D" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>{accountInfo.phone}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Change Phone', 'Phone change feature coming soon')}>
                <Icon name="chevron-forward" size={20} color="#CCC" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Icon name="person" size={24} color="#FF6B9D" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>User ID</Text>
                  <Text style={styles.infoValue}>{accountInfo.userId}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Icon name="calendar" size={24} color="#FF6B9D" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Member Since</Text>
                  <Text style={styles.infoValue}>{accountInfo.joinDate}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowPasswordModal(true)}
            >
              <View style={styles.settingLeft}>
                <Icon name="lock-closed" size={24} color="#FF6B9D" />
                <View>
                  <Text style={styles.settingTitle}>Change Password</Text>
                  <Text style={styles.settingSubtitle}>Update your account password</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('Two-Factor Auth', 'Two-factor authentication coming soon')}
            >
              <View style={styles.settingLeft}>
                <Icon name="shield-checkmark" size={24} color="#FF6B9D" />
                <View>
                  <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                  <Text style={styles.settingSubtitle}>Add extra security to your account</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('Active Sessions', 'Active sessions management coming soon')}
            >
              <View style={styles.settingLeft}>
                <Icon name="phone-portrait" size={24} color="#FF6B9D" />
                <View>
                  <Text style={styles.settingTitle}>Active Sessions</Text>
                  <Text style={styles.settingSubtitle}>Manage devices logged in to your account</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleDeleteAccount}
          >
            <Icon name="trash" size={20} color="#FF3B30" />
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </TouchableOpacity>
          
          <Text style={styles.dangerWarning}>
            Deleting your account is permanent and cannot be undone. All your data will be lost.
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity onPress={handleChangePassword}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.passwordField}>
              <Text style={styles.fieldLabel}>Current Password</Text>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter current password"
                placeholderTextColor="#999"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>

            <View style={styles.passwordField}>
              <Text style={styles.fieldLabel}>New Password</Text>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter new password"
                placeholderTextColor="#999"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <View style={styles.passwordField}>
              <Text style={styles.fieldLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm new password"
                placeholderTextColor="#999"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <Text style={styles.passwordHint}>
              Password must be at least 8 characters long and contain a mix of letters, numbers, and special characters.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 80,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 16,
  },
  settingsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FFE8E8',
    gap: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  dangerWarning: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalCloseButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalSaveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  passwordField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  passwordInput: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  passwordHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 20,
    lineHeight: 18,
  },
});

export default AccountScreen;
