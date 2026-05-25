/**
 * AMORVI - Innovation Demo Version
 * Special demo mode with mock data for innovation fund presentation
 * 
 * @format
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, Button, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TabNavigator from './src/navigation/TabNavigator';
import AuthScreen from './src/screens/AuthScreen';

/**
 * DEMO MODE FEATURES:
 * - Pre-filled demo account
 * - Mock user data for presentation
 * - Innovation badge display
 * - Feature highlights
 */

interface DemoMode {
  enabled: boolean;
  showInnovationBadge: boolean;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [demoMode, setDemoMode] = useState<DemoMode>({
    enabled: true,
    showInnovationBadge: true,
  });

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleDemoModeToggle = () => {
    setDemoMode(prev => ({
      ...prev,
      enabled: !prev.enabled,
    }));
    Alert.alert(
      'Demo Mode',
      demoMode.enabled ? 'Demo mode disabled' : 'Demo mode enabled'
    );
  };

  const handleInnovationInfo = () => {
    Alert.alert(
      'AMORVI Innovation Features',
      '🎬 Video Verification\n' +
        '🗺️ Geolocation Radar\n' +
        '👥 Social Integration\n' +
        '💬 Real-time Chat\n\n' +
        'Tap anywhere to learn more about our innovations!',
      [{ text: 'Learn More', onPress: () => showInnovationDetails() }]
    );
  };

  const showInnovationDetails = () => {
    Alert.alert(
      'AMORVI - Revolutionary Dating Platform',
      'Patent Applications Filed:\n' +
        '1. Video Verification System\n' +
        '2. Geolocation Radar Engine\n' +
        '3. Integrated Platform Architecture\n' +
        '4. Combined Search Algorithm\n\n' +
        'Ready for Innovation Fund Presentation',
      [{ text: 'Close', style: 'default' }]
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer>
          {isAuthenticated ? (
            <View style={styles.mainContainer}>
              {demoMode.showInnovationBadge && (
                <View style={styles.innovationBanner}>
                  <Text style={styles.bannerText}>
                    🚀 AMORVI INNOVATION DEMO
                  </Text>
                </View>
              )}
              <TabNavigator />
              <View style={styles.demoButtonContainer}>
                <Button
                  title="ℹ️ Innovation Info"
                  onPress={handleInnovationInfo}
                  color="#FF1493"
                />
                <Button
                  title="⚙️ Demo Mode"
                  onPress={handleDemoModeToggle}
                  color="#1E90FF"
                />
              </View>
            </View>
          ) : (
            <AuthScreen onAuthSuccess={handleAuthSuccess} />
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  innovationBanner: {
    backgroundColor: '#FF1493',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FF69B4',
  },
  bannerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  demoButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
});

export default App;
