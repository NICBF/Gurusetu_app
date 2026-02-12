/**
 * Follow Us – social links modal-style screen.
 * Links are defined in learner_followus.ts; update to match live website footer.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { FollowUsLink } from '../services/learner_followus';
import { FOLLOW_US_LINKS } from '../services/learner_followus';
import Icon from '../components/Icon';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const COLORS = {
  backgroundOverlay: 'rgba(2, 6, 23, 0.85)',
  card: '#1a1f2e',
  border: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
};

const SOCIAL_EMOJI: Record<FollowUsLink['icon'], string> = {
  instagram: '📷',
  facebook: '👥',
  whatsapp: '💬',
  gmail: '✉️',
  maps: '📍',
  youtube: '▶️',
  twitter: '𝕏',
  linkedin: '💼',
};

export default function LearnerFollowUsScreen() {
  const navigation = useNavigation<Nav>();

  const goBack = () => navigation.goBack();

  const openLink = (url: string) => {
    if (url) Linking.openURL(url).catch(() => undefined);
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={goBack}
        accessible
        accessibilityLabel="Close"
      />
      <View style={styles.card}>
        <View style={styles.cardInner}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={goBack}
            activeOpacity={0.85}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name="close" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <Text style={styles.title}>Follow Us</Text>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.gridWrap}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.grid}>
              {FOLLOW_US_LINKS.map((link) => (
                <TouchableOpacity
                  key={link.id}
                  style={[styles.tile, { backgroundColor: link.color }]}
                  onPress={() => openLink(link.url)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.tileEmoji}>{SOCIAL_EMOJI[link.icon]}</Text>
                  <Text style={styles.tileLabel} numberOfLines={1}>
                    {link.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backgroundOverlay,
  },
  card: {
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardInner: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 24,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  scroll: {
    maxHeight: 320,
  },
  gridWrap: {
    paddingBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  tile: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  tileEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
});
