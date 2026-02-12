/**
 * Chatbot API calls.
 * Same host: POST /chatbot-api/chat (body: { question, role? }). Separate service: set EXPO_PUBLIC_CHATBOT_API_URL and use /chat.
 */
import axios from 'axios';
import Constants from 'expo-constants';
import { API_BASE } from '../config';

const getChatbotConfig = (): { base: string; chatPath: string; healthPath: string } => {
  const fromExtra = (Constants.expoConfig as { extra?: { chatbotUrl?: string } } | null)?.extra?.chatbotUrl;
  const chatbotUrl = fromExtra ?? process.env.EXPO_PUBLIC_CHATBOT_API_URL ?? '';

  if (chatbotUrl) {
    const base = chatbotUrl.replace(/\/+$/, '');
    return { base, chatPath: '/chat', healthPath: '/health' };
  }
  const rawBase = API_BASE ? `${API_BASE}`.replace(/\/+$/, '') : '';
  const base = rawBase.replace(/\/api$/, '') || rawBase;
  return { base, chatPath: '/chatbot-api/chat', healthPath: '/chatbot-api/health' };
};

const { base: chatbotBase, chatPath, healthPath } = getChatbotConfig();

export interface ChatRequest {
  question: string;
  role?: string;
  context?: string;
  conversation_id?: string;
}

export interface ChatResponse {
  answer?: string;
  response?: string;
  sources?: string[];
  confidence?: number;
}

/**
 * Send chat message to chatbot
 * Note: Chatbot service runs on port 8001 (separate service)
 * If chatbot is on different URL, set EXPO_PUBLIC_CHATBOT_API_URL in .env
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const url = `${chatbotBase}${chatPath}`;
  
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
    const url = `${chatbotBase}${healthPath}`;
    const { data } = await axios.get(url, { timeout: 5000 });
    return data?.status === 'ok';
  } catch {
    return false;
  }
}
