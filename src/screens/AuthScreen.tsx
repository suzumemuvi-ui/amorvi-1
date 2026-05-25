import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ImageBackground,
  Dimensions,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const AuthScreen = ({ onAuthSuccess }: { onAuthSuccess?: () => void }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async () => {
    setLoading(true);
    // Simulate authentication
    setTimeout(() => {
      setLoading(false);
      onAuthSuccess?.();
    }, 1500);
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
              <LinearGradient
                colors={['#FF6B9D', '#FF1493']}
                style={styles.heartContainer}
              >
              <View>
                          <Image
                            source={require('../assets/amorvi_logo.png')}
                            //style={styles.logoImage}
                            resizeMode="center"
                          />
                        </View>
              </LinearGradient>
              <Text style={styles.appName}>Amorvi</Text>
              <Text style={styles.tagline}>Find your perfect match</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </Text>

              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Icon
                    name="person"
                    size={20}
                    color="#FFF"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#CCC"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Icon
                  name="mail"
                  size={20}
                  color="#FFF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#CCC"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon
                  name="lock-closed"
                  size={20}
                  color="#FFF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#CCC"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color="#FFF"
                  />
                </TouchableOpacity>
              </View>

              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Icon
                    name="lock-closed"
                    size={20}
                    color="#FFF"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#CCC"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>
              )}

              {/* Auth Button */}
              <TouchableOpacity
                style={styles.authButton}
                onPress={handleAuthAction}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#FF6B9D', '#FF1493']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.authButtonText}>
                    {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Auth */}
              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="logo-google" size={24} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="logo-apple" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Toggle Auth Mode */}
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {isSignUp
                    ? "Already have an account? "
                    : "Don't have an account? "}
                </Text>
                <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                  <Text style={styles.toggleLink}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: height * 0.08,
  },
  heartContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
  },
  formSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    marginBottom: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#FFF',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  authButton: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.6)',
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  toggleLink: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default AuthScreen;
