/**
 * Material Design 3 TextField with floating label
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';

interface TextFieldProps extends Omit<TextInputProps, 'placeholder'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  error?: string;
}

const COLORS = {
  primary: '#0061A4',
  onPrimary: '#FFFFFF',
  onSurface: '#1A1C1E',
  onSurfaceVariant: '#43474E',
  outline: '#73777F',
  error: '#BA1A1A',
  surface: '#FDFBFF',
};

const BORDER_RADIUS = {
  xs: 4,
};

export const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  showPasswordToggle = false,
  error,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);
  const hasValue = value.length > 0;
  const isLabelFloating = isFocused || hasValue;
  
  // For React Native, we'll use a simpler approach - always show label above when focused or has value

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !showPassword}
          placeholder=""
          placeholderTextColor="transparent"
          {...textInputProps}
        />
        <Text
          style={[
            styles.label,
            isLabelFloating && styles.labelFloating,
            isFocused && styles.labelFocused,
            error && styles.labelError,
          ]}
        >
          {label}
        </Text>
        {showPasswordToggle && secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((prev) => !prev)}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 6,
  },
  inputContainer: {
    position: 'relative',
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.outline,
    borderRadius: BORDER_RADIUS.xs,
    backgroundColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    fontSize: 16,
    color: COLORS.onSurface,
  },
  label: {
    position: 'absolute',
    left: 16,
    top: 16,
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
    pointerEvents: 'none',
  },
  labelFloating: {
    fontSize: 12,
    top: 8,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 4,
  },
  labelFocused: {
    color: COLORS.primary,
  },
  labelError: {
    color: COLORS.error,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 16,
    fontSize: 12,
    color: COLORS.error,
  },
});

export default TextField;
