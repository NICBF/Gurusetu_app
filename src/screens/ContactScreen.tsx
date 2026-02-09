/**
 * Contact/Support screen with backend integration
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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
import { submitContact, type ContactSubmissionPayload } from '../services/contactService';
import { isTablet, responsiveNumber } from '../utils/responsive';
import TextField from '../components/TextField';
import Icon from '../components/Icon';

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
  full: 9999,
};

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!subject.trim()) {
      setError('Subject is required');
      return false;
    }
    if (!message.trim()) {
      setError('Message is required');
      return false;
    }
    if (message.trim().length < 10) {
      setError('Message must be at least 10 characters');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const payload: ContactSubmissionPayload = {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      };
      const response = await submitContact(payload);
      Alert.alert(
        'Message Sent',
        response.message || 'Thank you for contacting us! We\'ll get back to you soon.',
        [{ text: 'OK', onPress: () => {
          setName('');
          setEmail('');
          setSubject('');
          setMessage('');
        }}]
      );
    } catch (e: unknown) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to send message'
          : e && typeof e === 'object' && 'message' in e
          ? String((e as { message: string }).message)
          : 'Failed to send message';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const maxWidth = responsiveNumber(600, 800);
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
              <View style={styles.iconContainer}>
                <Icon name="contact_support" size={responsiveNumber(40, 48)} color={COLORS.primary} />
              </View>
              <Text style={styles.title}>Contact Support</Text>
              <Text style={styles.subtitle}>We're here to help</Text>
            </View>

            <View style={styles.form}>
              <TextField
                label="Your Name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (error) setError('');
                }}
                editable={!loading}
              />

              <TextField
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

              <TextField
                label="Subject"
                value={subject}
                onChangeText={(text) => {
                  setSubject(text);
                  if (error) setError('');
                }}
                editable={!loading}
              />

              <View style={styles.messageContainer}>
                <TextInput
                  style={[
                    styles.messageInput,
                    message.length > 0 && styles.messageInputFilled,
                  ]}
                  value={message}
                  onChangeText={(text) => {
                    setMessage(text);
                    if (error) setError('');
                  }}
                  placeholder=""
                  placeholderTextColor="transparent"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  editable={!loading}
                />
                <Text
                  style={[
                    styles.messageLabel,
                    message.length > 0 && styles.messageLabelFloating,
                  ]}
                >
                  Message
                </Text>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={COLORS.onPrimary} size="small" />
                    <Text style={styles.submitButtonText}>Sending...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>Send Message</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>Support Information</Text>
              <Text style={styles.infoText}>
                • Response time: Usually within 24-48 hours{'\n'}
                • Support hours: 9 AM – 5:30 PM (Mon–Fri){'\n'}
                • For urgent issues, please call the support hotline
              </Text>
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
  iconContainer: {
    width: responsiveNumber(80, 96),
    height: responsiveNumber(80, 96),
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: responsiveNumber(28, 32),
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
  },
  form: {
    width: '100%',
    gap: 20,
    marginBottom: 32,
  },
  messageContainer: {
    position: 'relative',
    minHeight: 150,
    borderWidth: 1,
    borderColor: COLORS.outline,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  messageInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    fontSize: 16,
    color: COLORS.onSurface,
    minHeight: 150,
  },
  messageInputFilled: {
    paddingTop: 24,
  },
  messageLabel: {
    position: 'absolute',
    left: 16,
    top: 16,
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
  },
  messageLabelFloating: {
    fontSize: 12,
    top: 8,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: -8,
  },
  submitButton: {
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
  submitButtonText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  infoSection: {
    marginTop: 24,
    padding: 20,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    lineHeight: 22,
  },
});
