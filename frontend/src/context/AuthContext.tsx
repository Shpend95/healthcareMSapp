import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '../services/api';

export const USERS_KEY = 'mountsinai_users';
export const AUTH_KEY = 'mountsinai_auth';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  initializing: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  logout: () => void;
  register: (data: { name: string; email: string; password: string; role?: string }) => User;
  requestPasswordReset: (email: string) => boolean;
}

const getPersistedAuth = (): { token: string | null; user: User } | null => {
  const stored =
    localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const persistAuth = (data: { token: string | null; user: User }, rememberMe: boolean) => {
  const target = rememberMe ? localStorage : sessionStorage;
  const other = rememberMe ? sessionStorage : localStorage;
  other.removeItem(AUTH_KEY);
  target.setItem(AUTH_KEY, JSON.stringify(data));
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  useEffect(() => {
    const storedAuth = getPersistedAuth();
    if (storedAuth?.user) {
      setUser(storedAuth.user);
    }
    setInitializing(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<User> => {
    try {
      console.log('[AuthContext] Attempting login for:', email);
      const response = await api.post('/auth/login', { email, password });

      const { token, user: userPayload } = response.data;

      if (!token || !userPayload) {
        throw new Error('Invalid response from server: missing token or user data');
      }

      const normalizedUser: User = {
        id: userPayload.id,
        name: userPayload.name,
        email: userPayload.email,
        role: userPayload.role, // ADMIN, DOCTOR, NURSE, PATIENT
      };

      console.log('[AuthContext] Login successful - User object:', normalizedUser);
      setUser(normalizedUser);
      persistAuth({ token, user: normalizedUser }, rememberMe);
      return normalizedUser;
    } catch (error: any) {
      console.error('[AuthContext] Login error:', error);
      if (error.response) {
        // Server responded with error
        const message = error.response.data?.message || `Login failed: ${error.response.status} ${error.response.statusText}`;
        throw new Error(message);
      } else if (error.request) {
        // Request made but no response
        throw new Error('Cannot connect to server. Please ensure the backend is running on http://localhost:8081');
      } else {
        // Error setting up request
        throw new Error(error.message || 'Login failed. Please try again.');
      }
    }
  };

  // Demo-only registration
  const register = ({ name, email, password, role = 'PATIENT' }: { name: string; email: string; password: string; role?: string }): User => {
    const normalizedUser: User = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
    };
    setUser(normalizedUser);
    persistAuth({ token: null, user: normalizedUser }, true);
    return normalizedUser;
  };

  /**
   * ADMIN-ONLY: Load users
   */
  const loadUsers = (): any[] => {
    if (!user || user.role !== 'ADMIN') {
      return [];
    }

    try {
      const stored = localStorage.getItem(USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const requestPasswordReset = (email: string): boolean => {
    if (!user || user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    const users = loadUsers();
    const exists = users.some(
      (u: any) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!exists) {
      throw new Error('Account not found for that email.');
    }

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing,
      login,
      logout,
      register,
      requestPasswordReset,
    }),
    [user, initializing]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

export const authUtils = {};
