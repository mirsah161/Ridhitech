// Strapi API origin. Set VITE_API_URL in .env for local dev and in the
// host's environment variables for production, otherwise dynamic content
// silently fails to load.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337';

export const resolveMediaUrl = (rawUrl) => {
  if (!rawUrl) return null;
  return rawUrl.startsWith('http') ? rawUrl : `${API_BASE_URL}${rawUrl}`;
};
