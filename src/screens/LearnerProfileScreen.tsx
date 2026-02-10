/**
 * Learner Profile screen – adapted from the HTML profile design.
 * Uses existing backend APIs: /me and /my-courses (via getStudentDashboard).
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../auth/AuthContext';
import { getStudentDashboard, type DashboardData } from '../services/dashboardService';
import api from '../services/api';
import { API_BASE } from '../config';
import Icon from '../components/Icon';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const COLORS = {
  primary: '#135bec',
  backgroundDark: '#101622',
  surface: '#0f172a',
  surfaceCard: '#1e293b',
  border: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  white: '#ffffff',
  red: '#ef4444',
};

export default function LearnerProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { logout } = useAuth();
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [certificateCount, setCertificateCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const d = await getStudentDashboard();
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled) setError('Failed to load profile.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/my-certificates');
        const list = Array.isArray(res.data) ? res.data : [];
        if (!cancelled) setCertificateCount(list.length);
      } catch {
        if (!cancelled) setCertificateCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const userName = data.user?.name || 'Learner';
  const userEmail = data.user?.email || '';
  const completedCourses = data.stats?.completed_courses ?? data.stats?.enrolled_courses ?? 0;

  const handleLogout = async () => {
    await logout();
  };

  const goToLearnerHome = () => navigation.navigate('LearnerHome');
  const goToDashboard = () => navigation.navigate('StudentDashboard');
  const goToLiveClasses = () => navigation.navigate('LiveClasses');
  const goToNotifications = () => navigation.navigate('Notifications');

  if (loading) {
    return (
      <View style={styles.loadingPage}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingPage}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avatar + name */}
        <View style={styles.header}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatarGradient}>
              <Image
                source={{
                  uri:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDAzFT6wEC0ajjOK-JEtVp26wAeBGHnG1DpNyBXyX-9aXUc895gE1BIUmVJ6T9eS2SnH83LGQZA5knO5P86444-VtVLeblPATsDMF5JlxHLDFCwoqtHB5Lnc4rclCdGDy8-l87KywBEwPuHR9QXouQEwjgf1s2f-axVRmR7sVLZ37UBMGnMiUHA2NU6XlzkrKHU8ffro7-8uJb-0rp64cRtZoSAz9IeVoL6SKE4y-K0hR6NoWBfgqk1yNr0pEVpNzlihs0mRX1aWZw',
                }}
                style={styles.avatar}
              />
            </View>
            <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.85}>
              <Icon name="auto_awesome" size={14} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          {!!userEmail && <Text style={styles.userEmail}>{userEmail}</Text>}
          <View style={styles.badgeRow}>
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>Pro Member</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedCourses}</Text>
            <Text style={styles.statLabel}>Completed Courses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{certificateCount}</Text>
            <Text style={styles.statLabel}>Certificates</Text>
          </View>
        </View>

        {/* Learning Journey */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Learning Journey</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity
              style={styles.rowItem}
              activeOpacity={0.85}
              onPress={() => API_BASE && Linking.openURL(API_BASE).catch(() => undefined)}
            >
              <View style={[styles.rowIconBox, { backgroundColor: '#3b82f620' }]}>
                <Icon name="verified_user" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.rowTitle}>My Certificates</Text>
              <Icon name="expand_more" size={16} color={COLORS.textMuted} style={styles.chevronRotate} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account & Security</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity
              style={styles.rowItem}
              onPress={() => navigation.navigate('Contact')}
              activeOpacity={0.85}
            >
              <View style={[styles.rowIconBox, { backgroundColor: COLORS.primary + '20' }]}>
                <Icon name="contact_support" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.rowTitle}>Contact Us</Text>
              <Icon name="expand_more" size={16} color={COLORS.textMuted} style={styles.chevronRotate} />
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity
              style={styles.rowItem}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ProfileSettings')}
            >
              <View style={[styles.rowIconBox, { backgroundColor: '#64748b20' }]}>
                <Icon name="dashboard" size={20} color={COLORS.textMuted} />
              </View>
              <Text style={styles.rowTitle}>Profile Settings</Text>
              <Icon name="expand_more" size={16} color={COLORS.textMuted} style={styles.chevronRotate} />
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity
              style={styles.rowItem}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Contact')}
            >
              <View style={[styles.rowIconBox, { backgroundColor: '#10b98120' }]}>
                <Icon name="auto_awesome" size={20} color="#10b981" />
              </View>
              <Text style={styles.rowTitle}>Help Center</Text>
              <Icon name="expand_more" size={16} color={COLORS.textMuted} style={styles.chevronRotate} />
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity style={styles.rowItem} activeOpacity={0.85}>
              <View style={[styles.rowIconBox, { backgroundColor: '#6366f120' }]}>
                <Icon name="hub" size={20} color="#6366f1" />
              </View>
              <Text style={styles.rowTitle}>Threads & Discussions</Text>
              <Icon name="expand_more" size={16} color={COLORS.textMuted} style={styles.chevronRotate} />
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity
              style={styles.rowItem}
              activeOpacity={0.85}
              onPress={() => API_BASE && Linking.openURL(API_BASE).catch(() => undefined)}
            >
              <View style={[styles.rowIconBox, { backgroundColor: '#4f46e520' }]}>
                <Icon name="auto_awesome" size={20} color="#4f46e5" />
              </View>
              <Text style={styles.rowTitle}>Follow Us</Text>
              <Icon name="expand_more" size={16} color={COLORS.textMuted} style={styles.chevronRotate} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout} activeOpacity={0.9}>
            <Icon name="contact_support" size={18} color={COLORS.red} style={styles.signOutIcon} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>GuruSetu • Learner App</Text>
        </View>
      </ScrollView>

      {/* Bottom nav (Profile active) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={goToLearnerHome}>
          <Icon name="home" size={22} color={COLORS.textMuted} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goToDashboard}>
          <Icon name="dashboard" size={22} color={COLORS.textMuted} />
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goToLiveClasses}>
          <Icon name="live_tv" size={22} color={COLORS.textMuted} />
          <Text style={styles.navLabel}>Live Classes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goToNotifications}>
          <Icon name="notifications" size={22} color={COLORS.textMuted} />
          <Text style={styles.navLabel}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="person" size={22} color={COLORS.primary} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.backgroundDark },
  loadingPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textMuted },
  errorText: { padding: 20, color: '#fca5a5', textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
  header: { alignItems: 'center', marginTop: 16, marginBottom: 32 },
  avatarOuter: { position: 'relative' },
  avatarGradient: {
    width: 112,
    height: 112,
    borderRadius: 56,
    padding: 3,
    backgroundColor: COLORS.primary,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
    borderWidth: 4,
    borderColor: COLORS.backgroundDark,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.backgroundDark,
  },
  userName: { marginTop: 16, fontSize: 22, fontWeight: '600', color: COLORS.text },
  userEmail: { marginTop: 4, fontSize: 13, color: COLORS.textMuted },
  badgeRow: { marginTop: 10, flexDirection: 'row', gap: 8 },
  badgePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: COLORS.primary + '20',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  statLabel: {
    marginTop: 4,
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  cardGroup: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowTitle: { flex: 1, fontSize: 14, fontWeight: '500', color: COLORS.text },
  chevronRotate: { transform: [{ rotate: '-90deg' }] },
  rowDivider: {
    height: 1,
    marginHorizontal: 16,
    backgroundColor: '#1e293b',
  },
  signOutBtn: {
    width: '100%',
    backgroundColor: '#b91c1c33',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signOutIcon: { marginRight: 8 },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.red,
  },
  footer: { marginTop: 24, alignItems: 'center' },
  footerText: {
    fontSize: 10,
    color: COLORS.textDim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 26,
    backgroundColor: 'rgba(16,22,34,0.95)',
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  navItem: { alignItems: 'center', minWidth: 48 },
  navLabel: { fontSize: 10, fontWeight: '500', color: COLORS.textMuted, marginTop: 4 },
  navLabelActive: { color: COLORS.primary },
});

