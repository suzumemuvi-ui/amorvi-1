/**
 * Love Alarm Dating App
 * Combining elements of TikTok, Snapchat, Tinder and Love Alarm
 *
 * @format
 */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TabNavigator from './src/navigation/TabNavigator';
import AuthScreen from './src/screens/AuthScreen';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer>
          {isAuthenticated ? (
            <TabNavigator />
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
});

export default App;
