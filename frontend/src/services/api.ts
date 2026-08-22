const API_BASE_URL = import.meta.env.VITE_API_URL;

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Lets AuthContext know a request came back 401 mid-session (e.g. an expired
// token during a background poll) so it can clear the signed-in user and let
// ProtectedRoute redirect to /login, instead of leaving a dead session on screen.
type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

export const onUnauthorized = (listener: UnauthorizedListener) => {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const hadToken = Boolean(token);
    setAuthToken(null);
    if (hadToken) {
      unauthorizedListeners.forEach((listener) => listener());
    }
  }

  return response;
};
