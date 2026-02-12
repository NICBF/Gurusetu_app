/**
 * Login screen with Material Design 3 styling and adaptive layouts for phone and tablet.
 * Calls existing backend: /api/login, /api/login/professor, /api/login/admin.
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../auth/AuthContext';
import { login } from '../services/authService';
import { API_BASE } from '../config';
import { isTablet, responsiveNumber } from '../utils/responsive';
import Icon from '../components/Icon';
import TextField from '../components/TextField';
import ContactModal from '../components/ContactModal';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type RoleType = 'learner' | 'professor' | 'admin';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = isTablet();

// Design tokens matching the web version
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 28,
  full: 9999,
};

interface RoleOption {
  id: RoleType;
  label: string;
  icon: 'school' | 'person' | 'shield_person';
}

const ROLES: RoleOption[] = [
  { id: 'learner', label: 'Learner', icon: 'school' },
  { id: 'professor', label: 'Faculty', icon: 'person' },
  { id: 'admin', label: 'Admin', icon: 'shield_person' },
];

const APP_VERSION = '2.4.0';

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login: setAuth } = useAuth();
  const [institutionalId, setInstitutionalId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RoleType>('learner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contactModalVisible, setContactModalVisible] = useState(false);

  const handleLogin = async () => {
    const trimmedId = institutionalId.trim();
    if (!trimmedId || !password) {
      setError('Institutional ID and password are required.');
      return;
    }
    if (!API_BASE) {
      setError('API URL not configured. Set EXPO_PUBLIC_API_URL in .env');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Use institutional ID as email for login (adjust based on backend requirements)
      const res = await login(trimmedId, password, role);
      await setAuth(res.access_token);
    } catch (e: unknown) {
      const message =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message: string }).message)
          : 'Login failed';
      const status =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { status?: number } }).response?.status
          : undefined;
      if (status === 401) setError('Invalid institutional ID or password.');
      else setError(message);
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPassword = () => {
    // Navigate to forgot password screen (if implemented)
    setError('Forgot password not yet implemented in mobile app.');
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
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Icon name="school" size={responsiveNumber(32, 40)} color={COLORS.primary} />
              </View>
              <Text style={styles.title}>GURUSETU</Text>
              <Text style={styles.subtitle}>IIT Madras</Text>
            </View>

            {/* Role Selector Chips */}
            <View style={styles.roleSection}>
              <Text style={styles.roleLabel}>Login as</Text>
              <View style={styles.chipContainer}>
                {ROLES.map((roleOption, index) => (
                  <TouchableOpacity
                    key={roleOption.id}
                    testID={`login-role-${roleOption.id}`}
                    style={[
                      styles.chip,
                      role === roleOption.id && styles.chipSelected,
                      index < ROLES.length - 1 && styles.chipBorderRight,
                    ]}
                    onPress={() => setRole(roleOption.id)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={roleOption.icon}
                      size={18}
                      color={
                        role === roleOption.id
                          ? COLORS.onPrimaryContainer
                          : COLORS.onSurfaceVariant
                      }
                    />
                    <Text
                      style={[
                        styles.chipText,
                        role === roleOption.id && styles.chipTextSelected,
                      ]}
                    >
                      {roleOption.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Login Form */}
            <View style={styles.form} testID="login-form">
              <TextField
                testID="institutional-id-input"
                label="Institutional ID"
                value={institutionalId}
                onChangeText={(text) => {
                  setInstitutionalId(text);
                  if (error) setError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />

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

              {error ? <Text testID="login-error" style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                testID="forgot-password-button"
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="sign-in-button"
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={COLORS.onPrimary} size="small" />
                    <Text style={styles.primaryButtonText}>Logging in...</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                testID="register-link"
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Register New Account</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => setContactModalVisible(true)}
              activeOpacity={0.7}
            >
              <Icon name="contact_support" size={20} color={COLORS.primary} />
              <Text style={styles.supportText}>Contact Support</Text>
            </TouchableOpacity>
              <Text style={styles.versionText}>Version {APP_VERSION} (Universal)</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <ContactModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
      />
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
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: responsiveNumber(40, 48),
  },
  logoContainer: {
    width: responsiveNumber(64, 80),
    height: responsiveNumber(64, 80),
    backgroundColor: COLORS.primaryContainer,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: responsiveNumber(24, 28),
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.secondary,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  roleSection: {
    width: '100%',
    marginBottom: 32,
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
    gap: 24,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
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
  secondaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.outline,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.outline,
    opacity: 0.3,
  },
  dividerText: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  footer: {
    marginTop: responsiveNumber(48, 64),
    alignItems: 'center',
    gap: 16,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.full,
  },
  supportText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    opacity: 0.6,
  },
  errorText: {
    marginTop: -16,
    marginBottom: 8,
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
  },
});
