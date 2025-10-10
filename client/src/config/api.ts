// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Log the configuration (only in development)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    API_BASE_URL,
    mode: import.meta.env.MODE
  });
}

// Helper function to build API URLs
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // If API_BASE_URL is empty, use relative path (same domain)
  if (!API_BASE_URL) {
    console.warn('⚠️ VITE_API_URL not configured, using relative path');
    return `/${cleanPath}`;
  }

  // Otherwise, use the full URL
  const fullUrl = `${API_BASE_URL}/${cleanPath}`;
  console.log('📡 API Request to:', fullUrl);
  return fullUrl;
}
