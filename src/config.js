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
  
  // If we have a verified working URL in localStorage, use it
  const cached = localStorage.getItem('VERIFIED_API_URL');
  if (cached) {
    return cached;
  }
  
  // Default candidate for flexigig-coral.vercel.app
  if (origin.includes('flexigig-coral.vercel.app')) {
    return 'https://flexigig-coral-backend.vercel.app';
  }
  
  // Default candidate for Vercel
  if (origin.includes('.vercel.app')) {
    return origin.replace('.vercel.app', '-backend.vercel.app');
  }
  
  return origin;
};

export const API_BASE_URL = getApiBaseUrl();

// Self-healing check in background to verify and select the correct backend URL
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  const origin = window.location.origin;
  const candidates = [
    'https://flexigig-coral-backend.vercel.app',
    'https://flexigig-backend.vercel.app',
    origin
  ];
  
  Promise.any(
    candidates.map(url => 
      fetch(`${url}/api/stats`)
        .then(res => {
          if (res.ok) return url;
          throw new Error('Not responding');
        })
    )
  )
  .then(workingUrl => {
    if (localStorage.getItem('VERIFIED_API_URL') !== workingUrl) {
      const isFirstVerify = !localStorage.getItem('VERIFIED_API_URL');
      localStorage.setItem('VERIFIED_API_URL', workingUrl);
      console.log('✅ Found working backend API:', workingUrl);
      if (isFirstVerify) {
        window.location.reload();
      }
    }
  })
  .catch(err => {
    console.warn('Could not auto-detect any working backend URL:', err);
  });
}
