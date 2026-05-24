const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const origin = window.location.origin;
  const hostname = window.location.hostname;
  
  // If running locally, connect to local backend
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5004';
  }
  
  // If deployed on Vercel, automatically infer the backend project URL
  if (origin.includes('.vercel.app')) {
    // If the frontend is https://my-app.vercel.app, backend is https://my-app-backend.vercel.app
    return origin.replace('.vercel.app', '-backend.vercel.app');
  }
  
  // Fallback to relative URL if served from the same domain
  return origin;
};

export const API_BASE_URL = getApiBaseUrl();
