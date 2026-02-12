/**
 * GuruSetu Chatbot: floating, draggable button with snap-to-edge.
 * Persistent across all pages; uses existing chatbotService (/chatbot-api/chat).
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  Animated,
  StyleSheet,
  Dimensions,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { sendChatMessage, checkChatbotHealth, type ChatRequest } from '../services/chatbotService';
import Icon from './Icon';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

const FAB_SIZE = 60;
const FAB_RADIUS = FAB_SIZE / 2;
const PADDING = 10;
const SNAP_LEFT = PADDING;
const SNAP_RIGHT = WINDOW_WIDTH - FAB_SIZE - PADDING;
const EXPANDED_HEIGHT = 400;
const EXPANDED_WIDTH = WINDOW_WIDTH * 0.85;

const COLORS = {
  primary: '#0061A4',
  onPrimary: '#FFFFFF',
  surface: '#FDFBFF',
  surfaceContainer: '#F3F4F9',
  onSurface: '#1A1C1E',
  onSurfaceVariant: '#43474E',
  outline: '#73777F',
  error: '#BA1A1A',
};

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function GuruChatbot() {
  const { isAuthenticated, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Guru. How can I help?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatbotAvailable, setChatbotAvailable] = useState<boolean | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const pan = useRef(
    new Animated.ValueXY({ x: SNAP_RIGHT, y: WINDOW_HEIGHT - 150 })
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as Animated.Value).__getValue(), y: (pan.y as Animated.Value).__getValue() });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        const currentX = (pan.x as Animated.Value).__getValue();
        const currentY = (pan.y as Animated.Value).__getValue();
        const snapX = currentX < WINDOW_WIDTH / 2 ? SNAP_LEFT : SNAP_RIGHT;
        const clampedY = Math.max(
          PADDING,
          Math.min(WINDOW_HEIGHT - FAB_SIZE - PADDING, currentY)
        );
        Animated.spring(pan, {
          toValue: { x: snapX, y: clampedY },
          useNativeDriver: false,
          friction: 8,
          tension: 80,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    if (isAuthenticated) checkAvailability();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isOpen]);

  const checkAvailability = async () => {
    const available = await checkChatbotHealth();
    setChatbotAvailable(available);
  };

  const handleSend = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText || loading || chatbotAvailable === false) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    setError('');

    try {
      const request: ChatRequest = {
        question: trimmedText,
        ...(role && { role }),
      };
      const response = await sendChatMessage(request);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.answer || response.response || "I couldn't generate a response.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (e: unknown) {
      const errMsg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message: string }).message)
          : 'Chatbot unavailable. Try again later.';
      setError(errMsg);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry: ${errMsg}`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  if (isOpen) {
    return (
      <View style={styles.expandedWrapper} pointerEvents="box-none">
        <View style={styles.expandedWindow}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Guru Assistant</Text>
            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Icon name="close" size={22} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView
            style={styles.chatKeyboard}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <ScrollView
              ref={scrollViewRef}
              style={styles.chatArea}
              contentContainerStyle={styles.chatAreaContent}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.bubble,
                    msg.isUser ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      msg.isUser ? styles.userBubbleText : styles.botBubbleText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              ))}
              {loading && (
                <View style={[styles.bubble, styles.botBubble]}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.typingText}>Typing...</Text>
                </View>
              )}
            </ScrollView>
            {error ? (
              <Text style={styles.errorText} numberOfLines={2}>
                {error}
              </Text>
            ) : null}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor={COLORS.onSurfaceVariant}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                editable={!loading && chatbotAvailable !== false}
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  (!inputText.trim() || loading || chatbotAvailable === false) &&
                    styles.sendBtnDisabled,
                ]}
                onPress={handleSend}
                disabled={
                  !inputText.trim() || loading || chatbotAvailable === false
                }
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.onPrimary} size="small" />
                ) : (
                  <Text style={styles.sendBtnText}>Send</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[pan.getLayout(), styles.floatingButton]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={styles.fabTouchable}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.9}
      >
        <Image
          source={require('../../assets/chatboticon.png')}
          style={styles.chatbotIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_RADIUS,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 9999,
  },
  fabTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatbotIcon: {
    width: FAB_SIZE - 12,
    height: FAB_SIZE - 12,
  },
  expandedWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: 100,
    paddingRight: 20,
    zIndex: 10000,
    elevation: 20,
  },
  expandedWindow: {
    width: EXPANDED_WIDTH,
    height: EXPANDED_HEIGHT,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outline,
    backgroundColor: COLORS.surface,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  chatKeyboard: {
    flex: 1,
  },
  chatArea: {
    flex: 1,
    maxHeight: EXPANDED_HEIGHT - 140,
  },
  chatAreaContent: {
    padding: 12,
    paddingBottom: 8,
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userBubbleText: {
    color: COLORS.onPrimary,
  },
  botBubbleText: {
    color: COLORS.onSurface,
  },
  typingText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 11,
    color: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.outline,
    backgroundColor: COLORS.surface,
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.outline,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.onSurface,
    maxHeight: 90,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 9999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    color: COLORS.onPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});
