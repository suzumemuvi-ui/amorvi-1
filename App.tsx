/**
 * Love Alarm Dating App
 * Combining elements of TikTok, Snapchat, Tinder and Love Alarm
 *
 * @format
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import TabNavigator from './src/navigation/TabNavigator';
import AuthScreen from './src/screens/AuthScreen';
import {
  AuthProvider,
  useAuth,
} from './src/context/AuthContextV2';
import { PostProvider } from './src/context/PostContextV2';
import { ThemeProvider } from './src/context/ThemeContext';

function AppContent() {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      {user && token ? <TabNavigator /> : <AuthScreen />}
    </NavigationContainer>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PostProvider>
          <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
              <SafeAreaView style={styles.safeArea} edges={['top']}>
                <AppContent />
              </SafeAreaView>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </PostProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});

export default App;
