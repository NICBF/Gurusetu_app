/**
 * My Certificates – sheet-style UI. APIs: GET /api/my-certificates, GET /api/certificates/{id}/download
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Icon from '../components/Icon';
import {
  fetchMyCertificates,
  certificateDisplayTitle,
  certificateIssuedShort,
  certificateDisplayId,
  openCertificateView,
  openCertificateDownload,
  type LearnerCertificateSummary,
} from '../services/learner_certificates';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const COLORS = {
  primary: '#135bec',
  backgroundDark: '#101622',
  sheet: '#1a1f2e',
  border: '#334155',
  borderLight: 'rgba(51, 65, 85, 0.5)',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  cardBg: 'rgba(30, 41, 59, 0.4)',
  blue: '#3b82f6',
  indigo: '#6366f1',
  emerald: '#10b981',
  orange: '#f97316',
};

const CARD_ACCENTS = [
  { bg: 'rgba(59, 130, 246, 0.1)', icon: COLORS.blue },
  { bg: 'rgba(99, 102, 241, 0.1)', icon: COLORS.indigo },
  { bg: 'rgba(16, 185, 129, 0.1)', icon: COLORS.emerald },
  { bg: 'rgba(249, 115, 22, 0.1)', icon: COLORS.orange },
];

export default function LearnerCertificatesScreen() {
  const navigation = useNavigation<Nav>();
  const [list, setList] = useState<LearnerCertificateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMyCertificates();
      setList(data);
    } catch {
      setError('Failed to load certificates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const goBack = () => navigation.goBack();

  const handleView = (cert: LearnerCertificateSummary) => {
    const id = cert.id ?? '';
    if (id !== '') openCertificateView(id);
  };

  const handleDownload = (cert: LearnerCertificateSummary) => {
    const id = cert.id ?? '';
    if (id !== '') openCertificateDownload(id);
  };

  if (loading) {
    return (
      <View style={styles.page}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading certificates...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <View style={styles.dragHandle} />
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={goBack}
            activeOpacity={0.85}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name="close" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <View style={styles.titleRow}>
            <View style={styles.titleIconBox}>
              <Icon name="verified_user" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.titleTextWrap}>
              <Text style={styles.sheetTitle}>My Certificates</Text>
              <Text style={styles.sheetSubtitle}>
                {list.length} {list.length === 1 ? 'certificate' : 'certificates'} earned
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : list.length === 0 ? (
            <Text style={styles.emptyText}>No certificates yet.</Text>
          ) : (
            list.map((cert, index) => {
              const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
              const title = certificateDisplayTitle(cert);
              const issuedStr = certificateIssuedShort(cert);
              const idStr = certificateDisplayId(cert);
              const subtitle = [
                issuedStr ? `Issued ${issuedStr}` : '',
                idStr ? `ID: ${idStr}` : '',
              ]
                .filter(Boolean)
                .join(' • ');
              return (
                <View key={String(cert.id)} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={[styles.cardIconBox, { backgroundColor: accent.bg }]}>
                      <Icon name="verified_user" size={28} color={accent.icon} />
                    </View>
                    <View style={styles.cardBody}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {title}
                      </Text>
                      {subtitle ? (
                        <Text style={styles.cardSubtitle}>{subtitle}</Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.viewBtn}
                      onPress={() => handleView(cert)}
                      activeOpacity={0.85}
                    >
                      <Icon name="visibility" size={18} color={COLORS.textMuted} />
                      <Text style={styles.viewBtnText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.downloadBtn}
                      onPress={() => handleDownload(cert)}
                      activeOpacity={0.85}
                    >
                      <Icon name="file_download" size={18} color="#fff" />
                      <Text style={styles.downloadBtnText}>Download</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  sheet: {
    flex: 1,
    backgroundColor: COLORS.sheet,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    marginTop: 24,
    maxHeight: '92%',
  },
  sheetHeader: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  dragHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleTextWrap: { flex: 1 },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: COLORS.textDim,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  errorText: {
    color: '#fca5a5',
    textAlign: 'center',
    padding: 20,
  },
  emptyText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 20,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textDim,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 4,
  },
  viewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  viewBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  downloadBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  bottomSpacer: {
    height: 24,
  },
});
