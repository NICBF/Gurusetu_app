/**
 * Chatbot API calls. Backend: POST /chat (separate service, typically on port 8001)
 * Note: Chatbot runs on a separate service. Configure CHATBOT_API_URL in .env if different from main API
 */
import axios from 'axios';
import Constants from 'expo-constants';
import { API_BASE } from '../config';

// Get chatbot URL from env, or construct from API_BASE
const getChatbotBase = (): string => {
  const fromExtra = (Constants.expoConfig as { extra?: { chatbotUrl?: string } } | null)?.extra?.chatbotUrl;
  const chatbotUrl = fromExtra ?? process.env.EXPO_PUBLIC_CHATBOT_API_URL ?? '';
  
  if (chatbotUrl) {
    return chatbotUrl.replace(/\/+$/, '');
  }
  
  // Fallback: construct from API_BASE (remove /api if present, chatbot doesn't use it)
  const rawBase = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
  return rawBase.replace(/\/api$/, '') || rawBase;
};

const chatbotBase = getChatbotBase();

export interface ChatRequest {
  question: string;
  context?: string;
  conversation_id?: string;
}

export interface ChatResponse {
  answer: string;
  sources?: string[];
  confidence?: number;
}

/**
 * Send chat message to chatbot
 * Note: Chatbot service runs on port 8001 (separate service)
 * If chatbot is on different URL, set EXPO_PUBLIC_CHATBOT_API_URL in .env
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  // Chatbot endpoint is /chat (no /api prefix)
  const url = `${chatbotBase}/chat`;
  
  if (__DEV__) console.log('[Chatbot] URL:', url);
  
  try {
    const { data } = await axios.post<ChatResponse>(url, request, {
      timeout: 30000, // Chatbot may take longer
      headers: { 'Content-Type': 'application/json' },
    });
    return data;
  } catch (error) {
    console.error('[Chatbot] Error:', error);
    // Provide helpful error message
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED' || error.response?.status === 404) {
        throw new Error('Chatbot service is not available. Please contact support for assistance.');
      }
      throw new Error(error.response?.data?.detail || 'Failed to get response from chatbot.');
    }
    throw new Error('Chatbot service is currently unavailable. Please try again later.');
  }
}

/**
 * Check chatbot health
 */
export async function checkChatbotHealth(): Promise<boolean> {
  try {
    const url = `${chatbotBase}/health`;
    const { data } = await axios.get(url, { timeout: 5000 });
    return data?.status === 'ok';
  } catch {
    return false;
  }
}
