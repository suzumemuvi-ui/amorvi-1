/**
 * Love Alarm Dating App
 * Combining elements of TikTok, Snapchat, Tinder and Love Alarm
 *
 * @format
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TabNavigator from './src/navigation/TabNavigator';
import AuthScreen from './src/screens/AuthScreen';
import {
  AuthSessionProvider,
  useAuthSession,
} from './src/context/AuthSessionContext';

function AppContent() {
  const { isAuthenticated, login } = useAuthSession();
  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <TabNavigator />
      ) : (
        <AuthScreen onAuthSuccess={login} />
      )}
    </NavigationContainer>
  );
}

function App() {
  return (
    <AuthSessionProvider>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AuthSessionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
