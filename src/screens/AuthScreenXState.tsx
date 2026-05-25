import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AmorviContext';

const AuthScreenXState = ({
  onAuthSuccess,
}: {
  onAuthSuccess?: () => void;
}) => {
  const { state, send, context, matches } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);

  const isLogin = matches('login');
  const isSignup = matches('signup');
  const isAuthenticating = matches('authenticating');

  const handleAuthAction = () => {
    send({ type: 'SUBMIT' });
    // Wait for authenticated state
    if (state.value === 'authenticated') {
      onAuthSuccess?.();
    }
  };

  const handleEmailChange = (email: string) => {
    send({ type: 'SET_EMAIL', payload: email });
  };

  const handlePasswordChange = (password: string) => {
    send({ type: 'SET_PASSWORD', payload: password });
  };

  const handleConfirmPasswordChange = (confirmPassword: string) => {
    send({ type: 'SET_CONFIRM_PASSWORD', payload: confirmPassword });
  };

  const handleNameChange = (name: string) => {
    send({ type: 'SET_NAME', payload: name });
  };

  const handleToggleMode = () => {
    send({ type: 'TOGGLE_MODE' });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#FF6B9D', '#C06C84', '#6C5B7B', '#2D1B3D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Icon name="heart" size={60} color="white" />
              <Text style={styles.title}>AMORVI</Text>
              <Text style={styles.subtitle}>
                {isLogin ? 'Welcome Back' : 'Join Our Community'}
              </Text>
            </View>

            {/* Error Message */}
            {context.error && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={20} color="#FF4444" />
                <Text style={styles.errorText}>{context.error}</Text>
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {isSignup && (
                <View style={styles.inputWrapper}>
                  <Icon name="person" size={20} color="#fff" />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={context.name}
                    onChangeText={handleNameChange}
                    editable={!isAuthenticating}
                  />
                </View>
              )}

              <View style={styles.inputWrapper}>
                <Icon name="mail" size={20} color="#fff" />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  keyboardType="email-address"
                  value={context.email}
                  onChangeText={handleEmailChange}
                  editable={!isAuthenticating}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Icon name="lock-closed" size={20} color="#fff" />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  secureTextEntry={!showPassword}
                  value={context.password}
                  onChangeText={handlePasswordChange}
                  editable={!isAuthenticating}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>

              {isSignup && (
                <View style={styles.inputWrapper}>
                  <Icon name="lock-closed" size={20} color="#fff" />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    secureTextEntry={!showPassword}
                    value={context.confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    editable={!isAuthenticating}
                  />
                </View>
              )}
            </View>

            {/* Auth Button */}
            <TouchableOpacity
              style={[
                styles.authButton,
                isAuthenticating && styles.disabledButton,
              ]}
              onPress={handleAuthAction}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <Text style={styles.authButtonText}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            {/* XState Debug - Show current state */}
            {__DEV__ && (
              <Text style={styles.debugText}>
                State: {JSON.stringify(state.value)}
              </Text>
            )}
          </View>

          {/* Toggle Auth Mode */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <TouchableOpacity onPress={handleToggleMode} disabled={isAuthenticating}>
              <Text style={styles.toggleButton}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,68,68,0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#FFB3B3',
    marginLeft: 8,
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  authButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  toggleText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  toggleButton: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  debugText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default AuthScreenXState;
