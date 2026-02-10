// Load .env for local dev. EAS Build uses EAS env vars (secrets or eas.json env).
require('dotenv').config();

const INTRO_PURPLE = '#667eea';

// Default production API URL when .env is missing or EXPO_PUBLIC_API_URL not set
const DEFAULT_API_URL = 'https://gurusetu.iitm.ac.in';

module.exports = {
  expo: {
    name: 'GuruSetu',
    slug: 'gurusetu_mobile_app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/gurusetu_mobile_icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: INTRO_PURPLE,
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      package: 'in.ac.iitm.gurusetu',
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './assets/gurusetu_mobile_icon.png',
        backgroundColor: INTRO_PURPLE,
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: '3e2bfbaa-4e4e-42bd-bfbb-92102f545ef1',
      },
      apiUrl: process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL,
      chatbotUrl: process.env.EXPO_PUBLIC_CHATBOT_API_URL || '',
    },
  },
};
