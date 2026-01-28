// Secure admin path - change this to your preferred secret path
// This path is NOT guessable by bots scanning for /admin
export const ADMIN_BASE_PATH = import.meta.env.VITE_ADMIN_PATH || 'ctrl-x9k7m2p4q8n1';

export const adminRoutes = {
  login: `/${ADMIN_BASE_PATH}`,
  dashboard: `/${ADMIN_BASE_PATH}/dashboard`,
  posts: `/${ADMIN_BASE_PATH}/posts`,
  postsNew: `/${ADMIN_BASE_PATH}/posts/new`,
  postsEdit: (id: string) => `/${ADMIN_BASE_PATH}/posts/${id}/edit`,
  categories: `/${ADMIN_BASE_PATH}/categories`,
};

// Helper to check if a path is an admin path
export const isAdminPath = (path: string) => path.startsWith(`/${ADMIN_BASE_PATH}`);
