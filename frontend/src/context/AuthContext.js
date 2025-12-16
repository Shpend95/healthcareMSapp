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

const getPersistedAuth = () => {
  const stored =
    localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const persistAuth = (data, rememberMe) => {
  const target = rememberMe ? localStorage : sessionStorage;
  const other = rememberMe ? sessionStorage : localStorage;
  other.removeItem(AUTH_KEY);
  target.setItem(AUTH_KEY, JSON.stringify(data));
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const storedAuth = getPersistedAuth();
    if (storedAuth?.user) {
      setUser(storedAuth.user);
    }
    setInitializing(false);
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const response = await api.post('/auth/login', { email, password });

    const { token, user: userPayload } = response.data;

    const normalizedUser = {
      id: userPayload.id,
      name: userPayload.name,
      email: userPayload.email,
      role: userPayload.role, // ADMIN, DOCTOR, NURSE, PATIENT
    };

    setUser(normalizedUser);
    persistAuth({ token, user: normalizedUser }, rememberMe);
    return normalizedUser;
  };

  // Demo-only registration
  const register = ({ name, email, password, role = 'PATIENT' }) => {
    const normalizedUser = {
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
  const loadUsers = () => {
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

  const requestPasswordReset = (email) => {
    if (!user || user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    const users = loadUsers();
    const exists = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
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

  const value = useMemo(
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

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

export const authUtils = {};
