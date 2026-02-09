/**
 * Simple icon component using Unicode/Emoji (Material Symbols alternative)
 * For production, consider using react-native-vector-icons or expo-icons
 */
import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

type IconName = 'school' | 'cast_for_education' | 'shield_person' | 'contact_support' | 'person';

const iconMap: Record<IconName, string> = {
  school: '🎓',
  cast_for_education: '👨‍🏫',
  shield_person: '🛡️',
  contact_support: '💬',
  person: '👤',
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: TextStyle;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color, style }) => {
  return (
    <Text style={[styles.icon, { fontSize: size, color }, style]}>
      {iconMap[name]}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});

export default Icon;
