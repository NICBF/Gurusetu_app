/**
 * Faculty dashboard with real API data: courses, videos, notifications.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getFacultyDashboard, type DashboardData } from '../services/dashboardService';
import Icon from '../components/Icon';
import ContactModal from '../components/ContactModal';

type Nav = NativeStackNavigationProp<RootStackParamList>;

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
};

export default function FacultyDashboard() {
  const { role, logout } = useAuth();
  const navigation = useNavigation<Nav>();
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactModalVisible, setContactModalVisible] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getFacultyDashboard();
      setDashboardData(data);
    } catch (e) {
      setError('Failed to load dashboard data');
      console.error('[Dashboard]', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={styles.loader} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const userName = dashboardData.user?.name || dashboardData.user?.email || 'Professor';
  const courseCount = dashboardData.stats?.total_courses || 0;

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadDashboard} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{courseCount}</Text>
            <Text style={styles.statLabel}>My Courses</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('CourseList')}
        >
          <View style={styles.cardIcon}>
            <Icon name="cast_for_education" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>My Courses</Text>
            <Text style={styles.cardSub}>View assigned courses</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Notifications')}
        >
          <View style={styles.cardIcon}>
            <Icon name="contact_support" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Notifications</Text>
            <Text style={styles.cardSub}>Updates and announcements</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Chatbot')}
        >
          <View style={styles.cardIcon}>
            <Icon name="contact_support" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Chat Support</Text>
            <Text style={styles.cardSub}>Get instant help from AI assistant</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => setContactModalVisible(true)}
        >
          <View style={styles.cardIcon}>
            <Icon name="contact_support" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Contact Support</Text>
            <Text style={styles.cardSub}>Get help or report issues</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
      
      <ContactModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.surface,
  },
  loader: {
    marginTop: 100,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    color: COLORS.onSurfaceVariant,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EF5350',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#EF5350',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  statsCard: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.onPrimaryContainer,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.onPrimaryContainer,
    opacity: 0.8,
  },
  card: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.outline,
    borderOpacity: 0.1,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },
  logoutBtn: {
    marginTop: 24,
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outline,
  },
  logoutText: {
    color: '#C62828',
    fontSize: 16,
    fontWeight: '500',
  },
});
