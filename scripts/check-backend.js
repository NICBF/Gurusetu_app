/**
 * Check if the backend in .env is reachable from this machine (PC).
 * Run: node scripts/check-backend.js   or  npm run check-backend
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const axios = require('axios');

const base = (process.env.EXPO_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
if (!base) {
  console.error('EXPO_PUBLIC_API_URL is not set in .env');
  process.exit(1);
}
const url = `${base}/api/health`;
console.log('Checking backend:', url);

axios
  .get(url, { timeout: 10000 })
  .then((res) => {
    console.log('OK', res.status, res.data);
  })
  .catch((err) => {
    console.error('Backend not reachable:', err.response ? `${err.response.status} ${err.response.statusText}` : err.message);
    process.exit(1);
  });
