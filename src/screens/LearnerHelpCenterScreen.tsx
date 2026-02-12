/**
 * Help Center screen – matches live website style.
 * Contact, hours, and help sections with phone, schedule, mail, help_outline icons.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';

import Icon from '../components/Icon';

const COLORS = {
  primary: '#135bec',
  backgroundDark: '#101622',
  surfaceCard: '#1e293b',
  border: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
};

const CONTACT_EMAIL = 'support@gurusetu.com';
const CONTACT_PHONE = '+91 1234567890';
const HOURS_TEXT = 'Mon–Fri 9:00 AM – 6:00 PM IST';

export default function LearnerHelpCenterScreen() {
  const openEmail = () => Linking.openURL(`mailto:${CONTACT_EMAIL}`);
  const openPhone = () => Linking.openURL(`tel:${CONTACT_PHONE}`);

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Help Center</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Contact</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={openPhone} activeOpacity={0.8}>
              <View style={styles.iconWrap}>
                <Icon name="phone" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.rowTitle}>Phone</Text>
              <Text style={styles.rowValue}>{CONTACT_PHONE}</Text>
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity style={styles.row} onPress={openEmail} activeOpacity={0.8}>
              <View style={styles.iconWrap}>
                <Icon name="mail" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.rowTitle}>Email</Text>
              <Text style={styles.rowValue}>{CONTACT_EMAIL}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Hours</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Icon name="schedule" size={22} color={COLORS.textMuted} />
              </View>
              <Text style={styles.rowTitle}>Support hours</Text>
              <Text style={styles.rowValue}>{HOURS_TEXT}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Help</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Icon name="help_outline" size={22} color={COLORS.textMuted} />
              </View>
              <Text style={styles.rowTitle}>FAQs & support</Text>
              <Text style={styles.rowSubtext}>
                Visit Contact Support from the profile or use the chat icon in the header for quick help.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.backgroundDark },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 24,
  },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: COLORS.textDim,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  rowDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 16 + 40 + 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 0,
    minWidth: 100,
  },
  rowValue: {
    fontSize: 14,
    color: COLORS.textMuted,
    flex: 1,
  },
  rowSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    flex: 1,
    lineHeight: 18,
  },
  bottomSpacer: { height: 40 },
});
