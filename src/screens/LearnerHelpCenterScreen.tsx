/**
 * Help Center screen – theme-aware (light/dark). Contact, hours, address, CIFIL, social links.
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
import { useTheme } from '../theme/ThemeContext';

const ADDRESS = 'Department of Management Studies\nIndian Institute of Technology Madras\nChennai, Tamil Nadu, India\nPincode: 600036';

const CIFIL_ADDRESS = 'Room No 255 B\nDepartment of Management Studies\nIndian Institute of Technology Madras\nChennai - 600 036';

const CONTACT_PHONE = '(044) 2257-5557';
const PHONE_TEL = 'tel:+914422575557';
const HOURS_TEXT = 'Monday to Friday, 9:00 AM to 6:00 PM IST';
const EMAIL_CIFIL = 'cifil@imail.iitm.ac.in';
const EMAIL_GURUSETU = 'gurusetu.notifications@gmail.com';

const SOCIAL_LINKS = [
  { label: 'Facebook', url: 'https://www.facebook.com' },
  { label: 'X (Twitter)', url: 'https://twitter.com' },
  { label: 'Instagram', url: 'https://www.instagram.com' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com' },
  { label: 'YouTube', url: 'https://www.youtube.com' },
];

export default function LearnerHelpCenterScreen() {
  const { theme } = useTheme();
  const c = theme.colors;

  const openEmail = (address: string) => () => Linking.openURL(`mailto:${address}`);
  const openPhone = () => Linking.openURL(PHONE_TEL);
  const openLink = (url: string) => () => Linking.openURL(url);

  return (
    <View style={[styles.page, { backgroundColor: c.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: c.text }]}>Help Center</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textDim }]}>Address</Text>
          <View style={[styles.card, { backgroundColor: c.surfaceCard, borderColor: c.border }]}>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: c.primary + '20' }]}>
                <Icon name="school" size={22} color={c.primary} />
              </View>
              <Text style={[styles.addressBlock, { color: c.textMuted }]}>{ADDRESS}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textDim }]}>CAMS IITM Fintech Innovation Lab (CIFIL)</Text>
          <View style={[styles.card, { backgroundColor: c.surfaceCard, borderColor: c.border }]}>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: c.primary + '20' }]}>
                <Icon name="hub" size={22} color={c.primary} />
              </View>
              <View style={styles.flex1}>
                <Text style={[styles.cifilTagline, { color: c.text }]}>Tech Space to Finnovate</Text>
                <Text style={[styles.addressBlock, { color: c.textMuted }]}>{CIFIL_ADDRESS}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textDim }]}>Contact</Text>
          <View style={[styles.card, { backgroundColor: c.surfaceCard, borderColor: c.border }]}>
            <TouchableOpacity style={styles.row} onPress={openPhone} activeOpacity={0.8}>
              <View style={[styles.iconWrap, { backgroundColor: c.primary + '20' }]}>
                <Icon name="phone" size={22} color={c.primary} />
              </View>
              <Text style={[styles.rowTitle, { color: c.text }]}>Phone</Text>
              <Text style={[styles.rowValue, { color: c.textMuted }]}>{CONTACT_PHONE}</Text>
            </TouchableOpacity>
            <View style={[styles.rowDivider, { backgroundColor: c.border }]} />
            <TouchableOpacity style={styles.row} onPress={openEmail(EMAIL_CIFIL)} activeOpacity={0.8}>
              <View style={[styles.iconWrap, { backgroundColor: c.primary + '20' }]}>
                <Icon name="mail" size={22} color={c.primary} />
              </View>
              <Text style={[styles.rowTitle, { color: c.text }]}>Email (CIFIL)</Text>
              <Text style={[styles.rowValue, { color: c.textMuted }]}>{EMAIL_CIFIL}</Text>
            </TouchableOpacity>
            <View style={[styles.rowDivider, { backgroundColor: c.border }]} />
            <TouchableOpacity style={styles.row} onPress={openEmail(EMAIL_GURUSETU)} activeOpacity={0.8}>
              <View style={[styles.iconWrap, { backgroundColor: c.primary + '20' }]}>
                <Icon name="mail" size={22} color={c.primary} />
              </View>
              <Text style={[styles.rowTitle, { color: c.text }]}>Email (GuruSetu)</Text>
              <Text style={[styles.rowValue, { color: c.textMuted }]}>{EMAIL_GURUSETU}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textDim }]}>Business hours</Text>
          <View style={[styles.card, { backgroundColor: c.surfaceCard, borderColor: c.border }]}>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: c.primary + '20' }]}>
                <Icon name="schedule" size={22} color={c.textMuted} />
              </View>
              <Text style={[styles.rowTitle, { color: c.text }]}>Support hours</Text>
              <Text style={[styles.rowValue, { color: c.textMuted }]}>{HOURS_TEXT}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textDim }]}>Connect with us</Text>
          <View style={[styles.card, { backgroundColor: c.surfaceCard, borderColor: c.border }]}>
            {SOCIAL_LINKS.map(({ label, url }, index) => (
              <React.Fragment key={label}>
                {index > 0 && <View style={[styles.rowDivider, { backgroundColor: c.border }]} />}
                <TouchableOpacity style={styles.row} onPress={openLink(url)} activeOpacity={0.8}>
                  <View style={[styles.iconWrap, { backgroundColor: c.primary + '20' }]}>
                    <Icon name="hub" size={22} color={c.primary} />
                  </View>
                  <Text style={[styles.rowTitle, { color: c.text }]}>{label}</Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textDim }]}>Help</Text>
          <View style={[styles.card, { backgroundColor: c.surfaceCard, borderColor: c.border }]}>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: c.primary + '20' }]}>
                <Icon name="help_outline" size={22} color={c.textMuted} />
              </View>
              <Text style={[styles.rowTitle, { color: c.text }]}>FAQs & support</Text>
              <Text style={[styles.rowSubtext, { color: c.textMuted }]}>
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
  page: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
  },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
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
    marginLeft: 16 + 40 + 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 0,
    minWidth: 100,
  },
  rowValue: {
    fontSize: 14,
    flex: 1,
  },
  rowSubtext: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  flex1: { flex: 1 },
  addressBlock: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
  },
  cifilTagline: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  bottomSpacer: { height: 40 },
});
