/**
 * App opening and loading screen. This is the ONLY screen used for app start and loading.
 * - Opening: app starts with this screen only.
 * - Loading: auth check runs while this screen is visible (standalone mode).
 * Navigator keeps this visible for a minimum time so loading is clearly shown here,
 * then the app goes to the Login page.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../auth/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  white: '#ffffff',
  white90: 'rgba(255, 255, 255, 0.95)',
  white85: 'rgba(255, 255, 255, 0.85)',
  white60: 'rgba(255, 255, 255, 0.6)',
  white10: 'rgba(255, 255, 255, 0.1)',
  white08: 'rgba(255, 255, 255, 0.08)',
  buttonText: '#667eea',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

const INTRO_DURATION_MS = 5000;

interface IntroScreenProps {
  /** When true, shown while app is loading (no navigation yet). Button/timer do nothing. */
  standalone?: boolean;
}

export default function IntroScreen({ standalone: standaloneProp }: IntroScreenProps = {}) {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'Intro'>>();
  const { isLoading } = useAuth();
  const standalone = standaloneProp ?? route.params?.standalone ?? false;
  const [dots, setDots] = useState('');

  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const orbitRotate = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dotsRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToLogin = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (dotsRef.current) {
      clearInterval(dotsRef.current);
      dotsRef.current = null;
    }
    if (standalone) return; // No navigation until app has loaded (opening/loading only)
    Animated.timing(fadeOut, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      try {
        navigation.replace('Login');
      } catch (e) {
        console.error('[IntroScreen] Navigation error:', e);
      }
    });
  }, [standalone, navigation]);

  useEffect(() => {
    // Blob 1 float
    const blob1Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blob1Anim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blob1Anim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    blob1Loop.start();

    // Blob 2 float (reverse)
    const blob2Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blob2Anim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blob2Anim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    blob2Loop.start();

    // Logo bounce in
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Content fade in up (after 0.5s)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(contentTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }, 500);

    // Button scale in (after 0.8s)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(buttonScale, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }, 800);

    // Loading text (after 1s)
    setTimeout(() => {
      Animated.timing(loadingOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 1000);

    // Orbit rotation
    const orbitLoop = Animated.loop(
      Animated.timing(orbitRotate, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    orbitLoop.start();

    // Dots animation
    dotsRef.current = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);

    return () => {
      blob1Loop.stop();
      blob2Loop.stop();
      orbitLoop.stop();
      if (dotsRef.current) clearInterval(dotsRef.current);
    };
  }, []); // Animations only run once on mount

  // Separate effect for timer - restarts when standalone changes
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Auto redirect after 5 seconds (only when we have navigation)
    if (!standalone) {
      timerRef.current = setTimeout(goToLogin, INTRO_DURATION_MS);
    }
    // Standalone: no timer; navigator switches to Login after min intro time + loading done

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [standalone, goToLogin]); // Re-run when standalone changes

  const blob1TranslateX = blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 30] });
  const blob1TranslateY = blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
  const blob1Rotate = blob1Anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const blob2TranslateX = blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const blob2TranslateY = blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] });
  const blob2Rotate = blob2Anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-180deg'] });
  const orbitRotation = orbitRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeOut }]}>
      <StatusBar style="light" />
      <View style={styles.gradient}>
        {/* Background blobs */}
        <Animated.View
          style={[
            styles.blob1,
            {
              transform: [
                { translateX: blob1TranslateX },
                { translateY: blob1TranslateY },
                { rotate: blob1Rotate },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.blob2,
            {
              transform: [
                { translateX: blob2TranslateX },
                { translateY: blob2TranslateY },
                { rotate: blob2Rotate },
              ],
            },
          ]}
        />
      </View>

      {/* Logo container */}
      <View style={styles.logoContainer}>
        <Animated.View
          style={[
            styles.orbit,
            {
              transform: [{ rotate: orbitRotation }],
            },
          ]}
        >
          <View style={styles.orbitDot} />
        </Animated.View>
        <Animated.View
          style={[
            styles.logoCircle,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Text style={styles.logoIcon}>📖</Text>
        </Animated.View>
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
      >
        <Text style={styles.appTitle}>GuruSetu</Text>
        <Text style={styles.appTagline}>Unlock your potential with interactive learning</Text>
        <Animated.View style={{ opacity: buttonOpacity, transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={goToLogin}
            activeOpacity={0.9}
          >
            <View style={styles.ctaButtonInner}>
              <Text style={styles.ctaButtonText}>Get Started</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
        <Animated.Text style={[styles.loadingText, { opacity: loadingOpacity }]}>
          Ready to learn{dots}
        </Animated.Text>
        {standalone && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={COLORS.white60} />
            <Text style={styles.loadingLabel}>Loading...</Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.gradientStart,
  },
  blob1: {
    position: 'absolute',
    width: 300,
    height: 300,
    backgroundColor: COLORS.white10,
    borderRadius: 140,
    top: -50,
    right: -100,
  },
  blob2: {
    position: 'absolute',
    width: 200,
    height: 200,
    backgroundColor: COLORS.white08,
    borderRadius: 100,
    bottom: -50,
    left: -50,
  },
  logoContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.22,
    alignSelf: 'center',
    marginBottom: 40,
    zIndex: 10,
  },
  orbit: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: 50,
    left: 50,
    marginLeft: -80,
    marginTop: -80,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  orbitDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.white60,
    marginTop: -6,
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 60,
    elevation: 12,
  },
  logoIcon: {
    fontSize: 56,
  },
  content: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.2,
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 10,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 16,
    color: COLORS.white85,
    marginBottom: 40,
    fontWeight: '300',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  ctaButton: {
    alignSelf: 'center',
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 8,
  },
  ctaButtonInner: {
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 50,
  },
  ctaButtonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loadingText: {
    marginTop: 30,
    fontSize: 12,
    color: COLORS.white60,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  loadingLabel: {
    fontSize: 12,
    color: COLORS.white60,
    letterSpacing: 1,
  },
});
