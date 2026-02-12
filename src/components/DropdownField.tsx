/**
 * Dropdown field matching TextField styling; opens a modal list for selection.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import type { OptionItem } from '../services/registrationOptionsService';

const COLORS = {
  primary: '#0061A4',
  onSurface: '#1A1C1E',
  onSurfaceVariant: '#43474E',
  outline: '#73777F',
  error: '#BA1A1A',
  surface: '#FDFBFF',
  modalBackdrop: 'rgba(0,0,0,0.5)',
  modalSurface: '#FFFFFF',
};

const BORDER_RADIUS = 4;

export interface DropdownFieldProps {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  options: OptionItem[];
  placeholder?: string;
  error?: string;
  editable?: boolean;
}

export const DropdownField: React.FC<DropdownFieldProps> = ({
  label,
  value,
  onSelect,
  options,
  placeholder = 'Select...',
  error,
  editable = true,
}) => {
  const [open, setOpen] = useState(false);
  const hasValue = value.length > 0;
  const labelText = options.find((o) => o.value === value)?.label ?? (value || placeholder);

  const handleSelect = (item: OptionItem) => {
    onSelect(item.value);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.inputContainer,
          hasValue && styles.inputContainerFilled,
          error && styles.inputContainerError,
        ]}
        onPress={() => editable && setOpen(true)}
        activeOpacity={0.7}
        disabled={!editable}
      >
        <Text
          style={[styles.valueText, !hasValue && styles.placeholderText]}
          numberOfLines={1}
        >
          {labelText}
        </Text>
        <Text style={[styles.label, hasValue && styles.labelFloating, error && styles.labelError]}>
          {label}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              style={styles.list}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.optionRow,
                    item.value === value && styles.optionRowSelected,
                    pressed && styles.optionRowPressed,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && styles.optionTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setOpen(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
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
    borderRadius: BORDER_RADIUS,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 20,
  },
  inputContainerFilled: {},
  inputContainerError: {
    borderColor: COLORS.error,
  },
  label: {
    position: 'absolute',
    left: 16,
    top: 16,
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
  },
  labelFloating: {
    fontSize: 12,
    top: 8,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 4,
  },
  labelError: {
    color: COLORS.error,
  },
  valueText: {
    fontSize: 16,
    color: COLORS.onSurface,
  },
  placeholderText: {
    color: COLORS.onSurfaceVariant,
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: 18,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 16,
    fontSize: 12,
    color: COLORS.error,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.modalBackdrop,
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.modalSurface,
    borderRadius: 12,
    maxHeight: '70%',
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 12,
  },
  list: {
    maxHeight: 320,
  },
  optionRow: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  optionRowSelected: {
    backgroundColor: COLORS.primary + '18',
  },
  optionRowPressed: {
    opacity: 0.7,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.onSurface,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default DropdownField;
