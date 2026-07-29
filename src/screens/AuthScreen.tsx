import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  Image,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { apiRequest, AuthResponse } from '../services/api';
import { GOOGLE_WEB_CLIENT_ID } from '../config/auth';
import {
  configureGoogleSignin,
  getGoogleSignin,
  getGoogleStatusCodes,
} from '../services/googleSignIn';

const { height } = Dimensions.get('window');
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const hobbySuggestions = [
  'Swimming',
  'Gaming',
  'Cooking',
  'Music',
  'Travel',
  'Fitness',
  'Movies',
  'Reading',
  'Dancing',
  'Photography',
  'Hiking',
  'Art',
];

const formatDateOfBirth = (date: Date) => {
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

const AuthScreen = ({ onAuthSuccess }: { onAuthSuccess?: () => void }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpStep, setSignUpStep] = useState<'account' | 'profile'>(
    'account',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [selectedBirthDate, setSelectedBirthDate] = useState<Date | null>(null);
  const [isBirthDatePickerOpen, setIsBirthDatePickerOpen] = useState(false);
  const [visibleBirthMonth, setVisibleBirthMonth] = useState(
    () => new Date(2000, 0, 1),
  );
  const [hobbies, setHobbies] = useState('');
  const [dailyRoutine, setDailyRoutine] = useState('');
  const [city, setCity] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [education, setEducation] = useState('');
  const [interests, setInterests] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const today = useMemo(() => new Date(), []);
  const birthCalendarDays = useMemo(() => {
    const year = visibleBirthMonth.getFullYear();
    const month = visibleBirthMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from(
        { length: daysInMonth },
        (_, index) => new Date(year, month, index + 1),
      ),
    ];
  }, [visibleBirthMonth]);

  useEffect(() => {
    configureGoogleSignin();
  }, []);

  const openBirthDatePicker = () => {
    setVisibleBirthMonth(selectedBirthDate || new Date(2000, 0, 1));
    setIsBirthDatePickerOpen(true);
  };

  const changeBirthMonth = (offset: number) => {
    setVisibleBirthMonth(
      current =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  const selectBirthDate = (date: Date) => {
    setSelectedBirthDate(date);
    setDateOfBirth(formatDateOfBirth(date));
    setIsBirthDatePickerOpen(false);
  };

  const selectedHobbies = useMemo(
    () =>
      hobbies
        .split(',')
        .map(hobby => hobby.trim())
        .filter(Boolean),
    [hobbies],
  );

  const toggleHobbySuggestion = (suggestion: string) => {
    const isSelected = selectedHobbies.some(
      hobby => hobby.toLowerCase() === suggestion.toLowerCase(),
    );
    const nextHobbies = isSelected
      ? selectedHobbies.filter(
          hobby => hobby.toLowerCase() !== suggestion.toLowerCase(),
        )
      : [...selectedHobbies, suggestion];

    setHobbies(nextHobbies.join(', '));
  };

  const handleAuthAction = async () => {
    if (isSignUp && signUpStep === 'account') {
      if (!name.trim() || !dateOfBirth.trim()) {
        Alert.alert(
          'Complete your account',
          'Add your full name and date of birth before continuing.',
        );
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert(
          'Passwords do not match',
          'Please confirm your password again.',
        );
        return;
      }

      setSignUpStep('profile');
      return;
    }

    if (isSignUp && signUpStep === 'profile') {
      if (
        !hobbies.trim() ||
        !dailyRoutine.trim() ||
        !city.trim() ||
        !jobTitle.trim() ||
        !education.trim() ||
        !interests.trim() ||
        !additionalInfo.trim()
      ) {
        Alert.alert(
          'Complete your profile',
          'Please add your city, work, education, interests, daily routine, and additional info.',
        );
        return;
      }
    }

    setLoading(true);
    // Simulate authentication
    setTimeout(() => {
      setLoading(false);
      onAuthSuccess?.();
    }, 1500);
  };

  const handleGoogleSignIn = async () => {
    if (GOOGLE_WEB_CLIENT_ID.startsWith('YOUR_')) {
      Alert.alert(
        'Google Sign-In is not configured',
        'Add your Google Web Client ID in AuthScreen.tsx before using this button.',
      );
      return;
    }

    const statusCodes = getGoogleStatusCodes();

    try {
      setLoading(true);
      const googleSignin = getGoogleSignin();

      if (!googleSignin) {
        Alert.alert(
          'Google Sign-In is not ready',
          'Rebuild the app after installing the Google Sign-In native package.',
        );
        return;
      }

      await googleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const signInResult = await googleSignin.signIn();
      const idToken =
        (signInResult as any).data?.idToken || (signInResult as any).idToken;

      if (!idToken) {
        throw new Error('Google did not return an ID token.');
      }

      await apiRequest<AuthResponse>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });

      onAuthSuccess?.();
    } catch (error: any) {
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }

      Alert.alert(
        'Google Sign-In failed',
        error?.message || 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setSignUpStep('account');
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
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <LinearGradient
                colors={['#FF6B9D', '#FF1493']}
                style={styles.heartContainer}
              >
                <View>
                  <Image
                    source={require('../assets/amorvi_logo.png')}
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
                {isSignUp && signUpStep === 'profile'
                  ? 'Tell Us About You'
                  : isSignUp
                  ? 'Create Account'
                  : 'Welcome Back'}
              </Text>

              {isSignUp && signUpStep === 'account' && (
                <>
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

                  <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={openBirthDatePicker}
                    activeOpacity={0.8}
                  >
                    <Icon
                      name="calendar"
                      size={20}
                      color="#FFF"
                      style={styles.inputIcon}
                    />
                    <Text
                      style={[
                        styles.dateInputText,
                        !dateOfBirth && styles.dateInputPlaceholder,
                      ]}
                    >
                      {dateOfBirth || 'Date of Birth (DD/MM/YYYY)'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {(!isSignUp || signUpStep === 'account') && (
                <>
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
                </>
              )}

              {isSignUp && signUpStep === 'profile' && (
                <>
                  <Text style={styles.profileStepCopy}>
                    Your account is ready. Add a few details so Amorvi can shape
                    better matches around your life.
                  </Text>

                  <Text style={styles.suggestionTitle}>Choose hobbies</Text>
                  <View style={styles.hobbySuggestions}>
                    {hobbySuggestions.map(suggestion => {
                      const isSelected = selectedHobbies.some(
                        hobby =>
                          hobby.toLowerCase() === suggestion.toLowerCase(),
                      );

                      return (
                        <TouchableOpacity
                          key={suggestion}
                          style={[
                            styles.hobbyChip,
                            isSelected && styles.hobbyChipSelected,
                          ]}
                          onPress={() => toggleHobbySuggestion(suggestion)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.hobbyChipText,
                              isSelected && styles.hobbyChipTextSelected,
                            ]}
                          >
                            {suggestion}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.inputContainer}>
                    <Icon
                      name="sparkles"
                      size={20}
                      color="#FFF"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Hobbies"
                      placeholderTextColor="#CCC"
                      value={hobbies}
                      onChangeText={setHobbies}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Icon
                      name="location-outline"
                      size={20}
                      color="#FFF"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="City"
                      placeholderTextColor="#CCC"
                      value={city}
                      onChangeText={setCity}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Icon
                      name="briefcase-outline"
                      size={20}
                      color="#FFF"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Job Title"
                      placeholderTextColor="#CCC"
                      value={jobTitle}
                      onChangeText={setJobTitle}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Icon
                      name="school-outline"
                      size={20}
                      color="#FFF"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Education"
                      placeholderTextColor="#CCC"
                      value={education}
                      onChangeText={setEducation}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Icon
                      name="heart-outline"
                      size={20}
                      color="#FFF"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Interests"
                      placeholderTextColor="#CCC"
                      value={interests}
                      onChangeText={setInterests}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Icon
                      name="information-circle-outline"
                      size={20}
                      color="#FFF"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Additional info"
                      placeholderTextColor="#CCC"
                      value={additionalInfo}
                      onChangeText={setAdditionalInfo}
                    />
                  </View>

                  <View
                    style={[styles.inputContainer, styles.textAreaContainer]}
                  >
                    <Icon
                      name="reader"
                      size={20}
                      color="#FFF"
                      style={[styles.inputIcon, styles.textAreaIcon]}
                    />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Daily routine / about you"
                      placeholderTextColor="#CCC"
                      value={dailyRoutine}
                      onChangeText={setDailyRoutine}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                </>
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
                    {loading
                      ? 'Loading...'
                      : isSignUp && signUpStep === 'profile'
                      ? 'Finish Profile'
                      : isSignUp
                      ? 'Sign Up'
                      : 'Sign In'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {isSignUp && signUpStep === 'profile' && (
                <TouchableOpacity
                  style={styles.backToSignupButton}
                  onPress={() => setSignUpStep('account')}
                >
                  <Icon name="arrow-back" size={18} color="#FFF" />
                  <Text style={styles.backToSignupText}>Back to account</Text>
                </TouchableOpacity>
              )}

              {(!isSignUp || signUpStep === 'account') && (
                <>
                  {/* Divider */}
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Social Auth */}
                  <View style={styles.socialContainer}>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={handleGoogleSignIn}
                      disabled={loading}
                    >
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
                        ? 'Already have an account? '
                        : "Don't have an account? "}
                    </Text>
                    <TouchableOpacity onPress={handleToggleMode}>
                      <Text style={styles.toggleLink}>
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      <Modal
        animationType="fade"
        transparent
        visible={isBirthDatePickerOpen}
        onRequestClose={() => setIsBirthDatePickerOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() => changeBirthMonth(-1)}
              >
                <Icon name="chevron-back" size={22} color="#FFF" />
              </TouchableOpacity>

              <Text style={styles.calendarTitle}>
                {monthNames[visibleBirthMonth.getMonth()]}{' '}
                {visibleBirthMonth.getFullYear()}
              </Text>

              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() => changeBirthMonth(1)}
              >
                <Icon name="chevron-forward" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {weekDays.map((day, index) => (
                <Text key={`${day}-${index}`} style={styles.weekDay}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {birthCalendarDays.map((date, index) => {
                const isSelected =
                  date &&
                  selectedBirthDate &&
                  date.toDateString() === selectedBirthDate.toDateString();
                const isFuture = date ? date > today : false;

                return date ? (
                  <TouchableOpacity
                    key={date.toISOString()}
                    style={[
                      styles.calendarDay,
                      isSelected && styles.calendarDaySelected,
                      isFuture && styles.calendarDayDisabled,
                    ]}
                    disabled={isFuture}
                    onPress={() => selectBirthDate(date)}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        isSelected && styles.calendarDaySelectedText,
                        isFuture && styles.calendarDayDisabledText,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View key={`empty-${index}`} style={styles.calendarDay} />
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.calendarCancelButton}
              onPress={() => setIsBirthDatePickerOpen(false)}
            >
              <Text style={styles.calendarCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40,
    flexGrow: 1,
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
  dateInputText: {
    flex: 1,
    height: 50,
    color: '#FFF',
    fontSize: 16,
    lineHeight: 50,
  },
  dateInputPlaceholder: {
    color: '#CCC',
  },
  profileStepCopy: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  suggestionTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  hobbySuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  hobbyChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  hobbyChipSelected: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FFF',
  },
  hobbyChipText: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 13,
    fontWeight: '700',
  },
  hobbyChipTextSelected: {
    color: '#FFF',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    minHeight: 96,
    paddingVertical: 10,
  },
  textAreaIcon: {
    marginTop: 5,
  },
  textArea: {
    height: 78,
    paddingTop: 0,
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
  backToSignupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginBottom: 10,
  },
  backToSignupText: {
    color: '#FFF',
    fontSize: 14,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  calendarModal: {
    backgroundColor: '#2D1B3D',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  calendarNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekDay: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDaySelected: {
    backgroundColor: '#FF6B9D',
    borderRadius: 999,
  },
  calendarDayDisabled: {
    opacity: 0.25,
  },
  calendarDayText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  calendarDaySelectedText: {
    color: '#FFF',
    fontWeight: '800',
  },
  calendarDayDisabledText: {
    color: 'rgba(255,255,255,0.5)',
  },
  calendarCancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  calendarCancelText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default AuthScreen;
