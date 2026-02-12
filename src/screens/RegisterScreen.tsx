/**
 * Registration screen with role-based forms (Learner/Professor)
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { registerLearner, registerProfessor, type RegisterLearnerPayload, type RegisterProfessorPayload } from '../services/registrationService';
import { INSTITUTIONS, STATES, COUNTRIES } from '../services/registrationOptionsService';
import { isTablet, responsiveNumber } from '../utils/responsive';
import TextField from '../components/TextField';
import DropdownField from '../components/DropdownField';
import Icon from '../components/Icon';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RoleType = 'learner' | 'professor';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = isTablet();

const COLORS = {
  primary: '#0061A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D1E4FF',
  onPrimaryContainer: '#001D36',
  secondary: '#535F70',
  surface: '#FDFBFF',
  surfaceContainer: '#F3F4F9',
  onSurface: '#1A1C1E',
  onSurfaceVariant: '#43474E',
  outline: '#73777F',
  error: '#BA1A1A',
};

const BORDER_RADIUS = {
  xs: 4,
  full: 9999,
};

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const [role, setRole] = useState<RoleType>('learner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [institution, setInstitution] = useState('');
  const [otherInstitution, setOtherInstitution] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [showOtherInstitution, setShowOtherInstitution] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (role === 'professor' && !firstName.trim()) {
      setError('First name is required for professor registration');
      return false;
    }
    setError('');
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (role === 'learner') {
        const payload: RegisterLearnerPayload = {
          email: email.trim(),
          password,
          first_name: firstName.trim() || undefined,
          last_name: lastName.trim() || undefined,
          name: firstName.trim() && lastName.trim() ? `${firstName.trim()} ${lastName.trim()}` : firstName.trim() || lastName.trim() || undefined,
          institution: showOtherInstitution ? 'Other' : (institution.trim() || undefined),
          other_institution: showOtherInstitution ? (otherInstitution.trim() || undefined) : undefined,
          state: state.trim() || undefined,
          country: country.trim() || undefined,
          registration_type: 'student',
        };
        await registerLearner(payload);
        Alert.alert(
          'Registration Successful',
          'Your account has been created. Please sign in.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        const payload: RegisterProfessorPayload = {
          email: email.trim(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim() || undefined,
          name: lastName.trim() ? `${firstName.trim()} ${lastName.trim()}` : firstName.trim(),
        };
        await registerProfessor(payload);
        Alert.alert(
          'Registration Successful',
          'Your professor account has been created. Please sign in.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (e: unknown) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Registration failed'
          : e && typeof e === 'object' && 'message' in e
          ? String((e as { message: string }).message)
          : 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const maxWidth = responsiveNumber(440, 600);
  const containerPadding = responsiveNumber(16, 24);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: containerPadding },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.container, { maxWidth }]}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Icon name="school" size={responsiveNumber(32, 40)} color={COLORS.primary} />
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join Gurusetu</Text>
            </View>

            <View style={styles.roleSection}>
              <Text style={styles.roleLabel}>Register as</Text>
              <View style={styles.chipContainer}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    role === 'learner' && styles.chipSelected,
                    styles.chipBorderRight,
                  ]}
                  onPress={() => {
                    setRole('learner');
                    setError('');
                  }}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="school"
                    size={18}
                    color={role === 'learner' ? COLORS.onPrimaryContainer : COLORS.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      role === 'learner' && styles.chipTextSelected,
                    ]}
                  >
                    Learner
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    role === 'professor' && styles.chipSelected,
                  ]}
                  onPress={() => {
                    setRole('professor');
                    setError('');
                  }}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="person"
                    size={18}
                    color={role === 'professor' ? COLORS.onPrimaryContainer : COLORS.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      role === 'professor' && styles.chipTextSelected,
                    ]}
                  >
                    Professor
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.form} testID="registration-form">
              <TextField
                testID="email-input"
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />

              {role === 'professor' && (
                <>
                  <TextField
                    label="First Name"
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      if (error) setError('');
                    }}
                    editable={!loading}
                  />
                  <TextField
                    label="Last Name (Optional)"
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      if (error) setError('');
                    }}
                    editable={!loading}
                  />
                </>
              )}

              {role === 'learner' && (
                <>
                  <TextField
                    label="First Name (Optional)"
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      if (error) setError('');
                    }}
                    editable={!loading}
                  />
                  <TextField
                    label="Last Name (Optional)"
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      if (error) setError('');
                    }}
                    editable={!loading}
                  />
                  <DropdownField
                    label="Institution (Optional)"
                    value={institution}
                    onSelect={(val) => {
                      setInstitution(val);
                      if (error) setError('');
                      setShowOtherInstitution(val === 'Other');
                    }}
                    options={INSTITUTIONS}
                    placeholder="Select institution"
                    editable={!loading}
                  />
                  {showOtherInstitution && (
                    <TextField
                      label="Please specify your institution"
                      value={otherInstitution}
                      onChangeText={(text) => {
                        setOtherInstitution(text);
                        if (error) setError('');
                      }}
                      editable={!loading}
                    />
                  )}
                  <DropdownField
                    label="State (Optional)"
                    value={state}
                    onSelect={(val) => {
                      setState(val);
                      if (error) setError('');
                    }}
                    options={STATES}
                    placeholder="Select state"
                    editable={!loading}
                  />
                  <DropdownField
                    label="Country (Optional)"
                    value={country}
                    onSelect={(val) => {
                      setCountry(val);
                      if (error) setError('');
                    }}
                    options={COUNTRIES}
                    placeholder="Select country"
                    editable={!loading}
                  />
                </>
              )}

              <TextField
                testID="password-input"
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError('');
                }}
                secureTextEntry
                showPasswordToggle
                editable={!loading}
              />

              <TextField
                testID="confirm-password-input"
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (error) setError('');
                }}
                secureTextEntry
                showPasswordToggle
                editable={!loading}
              />

              {error ? <Text testID="registration-error" style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                testID="create-account-button"
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={COLORS.onPrimary} size="small" />
                    <Text style={styles.primaryButtonText}>Creating Account...</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                testID="sign-in-link"
                style={styles.backButton}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.backButtonText}>Already have an account? Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  container: {
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: responsiveNumber(64, 80),
    height: responsiveNumber(64, 80),
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: responsiveNumber(24, 28),
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },
  roleSection: {
    width: '100%',
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    marginBottom: 16,
    textAlign: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.outline,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    height: 40,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: COLORS.primaryContainer,
  },
  chipBorderRight: {
    borderRightWidth: 1,
    borderRightColor: COLORS.outline,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  chipTextSelected: {
    color: COLORS.onPrimaryContainer,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: -8,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryButtonText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
