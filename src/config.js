const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const hostname = window.location.hostname;
  
  // If running locally, connect to local backend
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5004';
  }
  
  // Connect directly to your live deployed Vercel backend
  return 'https://flexigig-backend.vercel.app';
};

export const API_BASE_URL = getApiBaseUrl();
