// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function to build API URLs
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // If API_BASE_URL is empty, use relative path (same domain)
  if (!API_BASE_URL) {
    return `/${cleanPath}`;
  }

  // Otherwise, use the full URL
  return `${API_BASE_URL}/${cleanPath}`;
}
