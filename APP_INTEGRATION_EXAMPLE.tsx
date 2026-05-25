/**
 * EXAMPLE: How to integrate XState into your existing App.tsx
 * Follow these steps to replace the old state management
 */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// ===== STEP 1: Import the XState Provider =====
// @ts-ignore
import { AmorviProvider, useAuth } from './src/context/AmorviContext';

// ===== STEP 2: Import your screen components =====
import TabNavigator from './src/navigation/TabNavigator';
import AuthScreenXState from './src/screens/AuthScreenXState';

/**
 * OPTION A: Simple Integration (Easiest)
 * 
 * Wrap the app and use XState for auth flow
 */
function AppContent() {
  const { state, context } = useAuth();
  const isAuthenticated = state.value === 'authenticated';

  const handleAuthSuccess = () => {
    // Auth success already handled by state machine
    console.log('User authenticated:', context.email);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer>
          {isAuthenticated ? (
            <TabNavigator />
          ) : (
            <AuthScreenXState onAuthSuccess={handleAuthSuccess} />
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * OPTION B: Hybrid Approach (Recommended)
 * 
 * Use XState where beneficial, keep old pattern elsewhere temporarily
 */
function AppWithHybridState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { state: authState } = useAuth();

  // Sync XState with local state if needed
  React.useEffect(() => {
    if (authState.value === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, [authState.value]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer>
          {isAuthenticated ? (
            <TabNavigator />
          ) : (
            <AuthScreenXState onAuthSuccess={() => setIsAuthenticated(true)} />
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * OPTION C: Full XState Integration (Best Practice)
 * 
 * Completely replace useState with XState throughout
 * Create a wrapper screen to handle auth state
 */
function AuthWrapper() {
  const { state, context } = useAuth();
  
  // Use XState for everything
  const isAuthenticated = state.value === 'authenticated';
  const isLoading = state.matches('authenticating');
  const hasError = context.error !== null;

  if (isLoading) {
    return null; // Show splash screen or loading
  }

  return isAuthenticated ? (
    <TabNavigator />
  ) : (
    <AuthScreenXState />
  );
}

function AppFull() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AuthWrapper />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * MAIN APP COMPONENT
 * 
 * Choose which approach you want:
 * - AppContent (Simple)
 * - AppWithHybridState (Gradual migration)
 * - AppFull (Full XState)
 */
function App() {
  return (
    <AmorviProvider>
      {/* Use one of the three options above */}
      <AppContent />
    </AmorviProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

/**
 * ============================================
 * INTEGRATION STEPS
 * ============================================
 * 
 * 1. Install Dependencies:
 *    npm install xstate @xstate/react
 * 
 * 2. Replace your current App.tsx with this file
 * 
 * 3. Choose integration option (A, B, or C)
 * 
 * 4. Test authentication flow:
 *    - Try logging in
 *    - Try signing up
 *    - Check error handling
 *    - Verify state transitions
 * 
 * 5. Gradually migrate other screens:
 *    - HomeScreen → HomeScreenXState
 *    - MapScreen → MapScreenXState
 *    - etc.
 * 
 * ============================================
 * DEBUGGING
 * ============================================
 * 
 * To debug XState state machine:
 * 
 * import { inspect } from 'xstate';
 * 
 * if (__DEV__) {
 *   inspect.console();
 * }
 * 
 * Or add debug display:
 * 
 * {__DEV__ && (
 *   <Text style={{ fontSize: 10, color: '#999' }}>
 *     Auth State: {JSON.stringify(authState.value)}
 *   </Text>
 * )}
 * 
 * ============================================
 * COMMON PATTERNS
 * ============================================
 * 
 * Pattern 1: Check if loading
 * const isLoading = authState.matches('authenticating');
 * 
 * Pattern 2: Check if authenticated
 * const isAuth = authState.value === 'authenticated';
 * 
 * Pattern 3: Access context data
 * const { email, password, error } = authState.context;
 * 
 * Pattern 4: Send events
 * send({ type: 'SET_EMAIL', payload: 'user@example.com' });
 * 
 * ============================================
 * MIGRATION PROGRESS TRACKING
 * ============================================
 * 
 * Screens migrated:
 * - [x] AuthScreen → AuthScreenXState
 * - [ ] HomeScreen → HomeScreenXState
 * - [ ] MapScreen → MapScreenXState
 * - [ ] RadarScreen → RadarScreenXState
 * - [ ] ChatScreen → ChatScreenXState
 * - [ ] ProfileScreen → ProfileScreenXState
 * - [ ] SettingsScreen → SettingsScreenXState
 * - [ ] DatingScreen → DatingScreenXState
 * - [ ] AlarmScreen → AlarmScreenXState
 * - [ ] EditProfileScreen → EditProfileScreenXState
 * - [ ] AccountScreen → AccountScreenXState
 * 
 * ============================================
 */
