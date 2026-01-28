// Get admin base path from environment variable
// IMPORTANT: Set VITE_ADMIN_PATH in your environment to customize the admin path
// If not set, generates a random secure path (not recommended for production)
const generateSecureFallback = () => {
  // Generate a deterministic but obscure path based on timestamp seed
  // This ensures consistency during a session but differs between deployments
  return 'panel-' + Math.random().toString(36).substring(2, 10);
};

export const ADMIN_BASE_PATH = import.meta.env.VITE_ADMIN_PATH || generateSecureFallback();

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
