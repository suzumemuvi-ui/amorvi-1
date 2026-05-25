import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

interface SettingsState {
  notificationsEnabled: boolean;
  newMessagesEnabled: boolean;
}

const SettingsScreen = ({ navigation }: { navigation?: any }) => {
  const [settings, setSettings] = useState<SettingsState>({
    notificationsEnabled: true,
    newMessagesEnabled: true,
  });

  const handleToggleNotifications = () => {
    setSettings(prev => ({
      ...prev,
      notificationsEnabled: !prev.notificationsEnabled,
    }));
  };

  const handleToggleMessages = () => {
    setSettings(prev => ({
      ...prev,
      newMessagesEnabled: !prev.newMessagesEnabled,
    }));
  };

  const handleLogOut = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Log Out',
          onPress: () => {
            // TODO: Implement logout logic
            console.log('User logged out');
          },
          style: 'destructive',
        },
      ],
    );
  };

  const handleSettingPress = (title: string) => {
    Alert.alert(title, `${title} settings coming soon`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#FFB6D9', '#FFD4E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Icon name="logo-amorvi" size={28} color="#FF6B9D" />
            <Text style={styles.headerTitle}>Amorvi</Text>
            <TouchableOpacity style={styles.starButton}>
              <Icon name="star" size={24} color="#FFB347" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <View style={styles.settingsLabel}>
          <Text style={styles.settingsTitle}>Settings</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Section */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation?.navigate('Account')}
            >
              <View style={styles.settingItemLeft}>
                <Icon name="person-circle" size={24} color="#FF6B9D" />
                <Text style={styles.settingItemTitle}>Account</Text>
              </View>
              <View style={styles.settingItemRight}>
                <Text style={styles.settingItemValue}>jessica@gmail.com</Text>
                <Icon name="chevron-forward" size={20} color="#CCC" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('Notifications')}
            >
              <View style={styles.settingItemLeft}>
                <Icon name="notifications" size={24} color="#FF6B9D" />
                <Text style={styles.settingItemTitle}>Notifications</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('Privacy & Safety')}
            >
              <View style={styles.settingItemLeft}>
                <Icon name="shield-checkmark" size={24} color="#FF6B9D" />
                <Text style={styles.settingItemTitle}>Privacy & Safety</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('Language')}
            >
              <View style={styles.settingItemLeft}>
                <Icon name="globe" size={24} color="#FF6B9D" />
                <Text style={styles.settingItemTitle}>Language</Text>
              </View>
              <View style={styles.settingItemRight}>
                <Text style={styles.settingItemValue}>English</Text>
                <Icon name="chevron-forward" size={20} color="#CCC" />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('Help & Support')}
            >
              <View style={styles.settingItemLeft}>
                <Icon name="help-circle" size={24} color="#FF6B9D" />
                <Text style={styles.settingItemTitle}>Help & Support</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('Terms & Policies')}
            >
              <View style={styles.settingItemLeft}>
                <Icon name="document-text" size={24} color="#FF6B9D" />
                <Text style={styles.settingItemTitle}>Terms & Policies</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* More Section */}
        <View style={styles.moreSection}>
          <Text style={styles.moreSectionTitle}>More</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Icon name="notifications" size={24} color="#FF6B9D" />
                <Text style={styles.settingItemTitle}>Notifications</Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: '#E8E8E8', true: '#81C784' }}
                thumbColor="#FFF"
              />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('New messages')}
            >
              <View style={styles.settingItemLeft}>
                <Icon name="mail" size={24} color="#FF6B9D" />
                <Text style={styles.settingItemTitle}>New messages</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('Likes & favorites')}
            >
              <View style={styles.settingItemLeft}>
                <Icon name="heart" size={24} color="#FF6B9D" />
                <Text style={styles.settingItemTitle}>Likes & favorites</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('Manage Preferences')}
            >
              <View style={styles.settingItemLeft}>
                <Icon name="settings" size={24} color="#FF6B9D" />
                <Text style={styles.settingItemTitle}>Manage Preferences</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          style={styles.logOutButton}
          onPress={handleLogOut}
        >
          <Text style={styles.logOutButtonText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B9D',
    marginLeft: 8,
    flex: 1,
  },
  starButton: {
    padding: 8,
  },
  settingsLabel: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    marginBottom: 16,
  },
  moreSection: {
    marginBottom: 24,
    marginTop: 8,
  },
  moreSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
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
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingItemValue: {
    fontSize: 14,
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 16,
  },
  logOutButton: {
    alignSelf: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginVertical: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default SettingsScreen;
