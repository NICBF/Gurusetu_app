/**
 * Header toggle: one button. Shows "Light" when app is dark (tap to switch to light), "Dark" when light (tap to switch to dark).
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: theme.colors.surfaceCard }]}
      onPress={toggleTheme}
      activeOpacity={0.8}
    >
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {theme.isDarkMode ? '☀️ Light' : '🌙 Dark'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
