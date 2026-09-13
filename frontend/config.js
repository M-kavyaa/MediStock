// MediStock Configurable API Base URL
// Automatically detects localhost/file protocol vs production hosting

const RENDER_BACKEND_URL = "https://medistock-8zrd.onrender.com";

const isLocalEnv = (
  window.location.protocol === 'file:' ||
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);

const API_BASE_URL = isLocalEnv
  ? (window.MEDIWISE_API_URL || 'http://localhost:5000')
  : (window.MEDIWISE_API_URL || RENDER_BACKEND_URL);
