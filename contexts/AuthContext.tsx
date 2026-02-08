// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocketProvider } from './SocketContext';
import { parseJwt } from '@/lib/jwt';
import { normalizeAuthToken } from '@/lib/auth-token';

type AuthContextType = {
  token: string | null;
  setToken: (newToken: string) => Promise<void>;
  removeToken: () => Promise<void>;
  isLoading: boolean;
  user: { id?: string; [k: string]: any } | null;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: async () => {},
  removeToken: async () => {},
  isLoading: true,
  user: null,
});

const TOKEN_KEY = 'auth_token';
const LEGACY_TOKEN_KEYS = ['token', 'authToken'];
const ALL_TOKEN_KEYS = [TOKEN_KEY, ...LEGACY_TOKEN_KEYS];
const AUTH_LOG_PREFIX = '[auth]';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function tokenMeta(token: string | null) {
  if (!token) return 'null';
  return `${token.slice(0, 12)}... (len=${token.length})`;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Load token from AsyncStorage on app start
  useEffect(() => {
    const loadToken = async () => {
      try {
        const readStoredToken = async () => {
          const tokenPairs = await AsyncStorage.multiGet(ALL_TOKEN_KEYS);
          const firstStoredToken = tokenPairs.find(([, value]) => !!value)?.[1] ?? null;
          const normalizedToken = normalizeAuthToken(firstStoredToken);

          if (__DEV__) {
            const snapshot = tokenPairs.map(([key, value]) => `${key}:${value ? 'set' : 'empty'}`).join(', ');
            console.log(`${AUTH_LOG_PREFIX} storage snapshot -> ${snapshot}`);
            console.log(`${AUTH_LOG_PREFIX} normalized startup token -> ${tokenMeta(normalizedToken)}`);
          }

          return normalizedToken;
        };

        let storedToken = await readStoredToken();

        if (!storedToken) {
          // iOS dev builds can occasionally return empty on first read during reload.
          await sleep(120);
          storedToken = await readStoredToken();
        }

        if (storedToken) {
          await AsyncStorage.setItem(TOKEN_KEY, storedToken);
          await AsyncStorage.multiRemove(LEGACY_TOKEN_KEYS);
          setTokenState(storedToken);
          try {
            const payload = parseJwt(storedToken);
            setUser(payload || null);
          } catch {}
        } else {
          setTokenState(null);
          setUser(null);
        }
      } catch (err) {
        console.error('🔐 Failed to load token', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const setToken = async (newToken: string) => {
    const normalizedToken = normalizeAuthToken(newToken);
    if (!normalizedToken) {
      throw new Error('Invalid auth token');
    }

    try {
      await AsyncStorage.setItem(TOKEN_KEY, normalizedToken);
      await AsyncStorage.multiRemove(LEGACY_TOKEN_KEYS);
      setTokenState(normalizedToken);
      if (__DEV__) {
        console.log(`${AUTH_LOG_PREFIX} token saved -> ${tokenMeta(normalizedToken)}`);
      }
      try {
        const payload = parseJwt(normalizedToken);
        setUser(payload || null);
      } catch {}
    } catch (err) {
      console.error('❌ Failed to set token', err);
      throw err;
    }
  };

  const removeToken = async () => {
    try {
      await AsyncStorage.multiRemove(ALL_TOKEN_KEYS);
      setTokenState(null);
      setUser(null);
      if (__DEV__) {
        console.log(`${AUTH_LOG_PREFIX} token removed`);
      }
    } catch (err) {
      console.error('❌ Failed to remove token', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ token, setToken, removeToken, isLoading, user }}>
      {token && !isLoading ? (
        <SocketProvider token={token}>
          {children}
        </SocketProvider>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
