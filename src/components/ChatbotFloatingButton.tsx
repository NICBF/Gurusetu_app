import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Text,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChatbotScreen from '../screens/ChatbotScreen';

const COLORS = {
  primary: '#4F46E5',
  onPrimary: '#FFFFFF',
  surface: '#FDFBFF',
  onSurface: '#111827',
  border: '#E5E7EB',
};

const ChatbotFloatingButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {/* Floating FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.onPrimary} />
      </TouchableOpacity>

      {/* Bottom sheet modal with ChatbotScreen */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Chat Support</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>
            <View style={styles.separator} />
            <View style={styles.sheetContent}>
              <ChatbotScreen />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'android' ? 0.3 : 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    opacity: 0.6,
  },
  sheetContent: {
    height: 480,
  },
});

export default ChatbotFloatingButton;

