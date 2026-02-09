// Load .env for local dev. EAS Build uses EAS env vars (secrets or eas.json env).
require('dotenv').config();

const { expo } = require('./app.json');

const INTRO_PURPLE = '#667eea';

module.exports = {
  expo: {
    ...expo,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: INTRO_PURPLE,
    },
    extra: {
      eas: {
        projectId: '3e2bfbaa-4e4e-42bd-bfbb-92102f545ef1',
      },
      apiUrl: process.env.EXPO_PUBLIC_API_URL || '',
      chatbotUrl: process.env.EXPO_PUBLIC_CHATBOT_API_URL || '',
    },
  },
};
