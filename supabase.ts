import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Fallback for web/testing environments
const getLocalStorage = () => {
  return {
    setItem: (key: string, value: string) => {
      return localStorage.setItem(key, value);
    },
    getItem: (key: string) => {
      return localStorage.getItem(key);
    },
    removeItem: (key: string) => {
      return localStorage.removeItem(key);
    },
  };
};

// Custom storage object for Supabase
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return getLocalStorage().getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      return getLocalStorage().setItem(key, value);
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return getLocalStorage().removeItem(key);
    }
    return SecureStore.deleteItemAsync(key);
  },
};

// Set environment variables - would be stored in a .env file
const SUPABASE_URL = 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';

// Create a single instance of the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;