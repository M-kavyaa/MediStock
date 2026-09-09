// MediStock Configurable API Base URL
// Automatically detects localhost/file protocol vs production hosting

const RENDER_BACKEND_URL = "https://medistock-backend.onrender.com"; // Replace with your actual Render URL after deploying backend

const API_BASE_URL = (
  window.location.protocol === 'file:' ||
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
) 
  ? 'http://localhost:5000' 
  : (window.MEDIWISE_API_URL || RENDER_BACKEND_URL);
