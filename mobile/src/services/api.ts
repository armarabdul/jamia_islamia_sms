import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_API_URL_KEY = 'jamia_custom_api_url';
const ACCESS_TOKEN_KEY = 'jamia_mobile_access_token';
const REFRESH_TOKEN_KEY = 'jamia_mobile_refresh_token';
const USER_DATA_KEY = 'jamia_mobile_user_data';

/**
 * Default API URL:
 * - Android Emulator uses 10.0.2.2 to reach host machine's localhost
 * - iOS Simulator / Web uses localhost
 * - Developers on physical phones can set custom IP via mobile Settings
 */
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api/v1' : 'http://localhost:8000/api/v1';

export const getApiBaseUrl = async (): Promise<string> => {
  try {
    const custom = await AsyncStorage.getItem(STORAGE_API_URL_KEY);
    if (custom && custom.trim().length > 0) return custom.trim();
  } catch {}
  return process.env.EXPO_PUBLIC_API_URL || DEFAULT_HOST;
};

export const setCustomApiBaseUrl = async (url: string): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_API_URL_KEY, url);
};

export const getAuthTokens = async () => {
  const access = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  const refresh = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  return { access, refresh };
};

export const setAuthTokens = async (access: string, refresh: string) => {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access);
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

export const clearAuthSession = async () => {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
};

export const storeUserData = async (userData: any) => {
  await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

export const getStoredUserData = async () => {
  const raw = await AsyncStorage.getItem(USER_DATA_KEY);
  return raw ? JSON.parse(raw) : null;
};

const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const baseUrl = await getApiBaseUrl();
  config.baseURL = baseUrl;

  const { access } = await getAuthTokens();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refresh } = await getAuthTokens();
      if (refresh) {
        try {
          const baseUrl = await getApiBaseUrl();
          const res = await axios.post(`${baseUrl}/auth/refresh/`, { refresh });
          const newAccess = res.data.access;
          const newRefresh = res.data.refresh || refresh;
          await setAuthTokens(newAccess, newRefresh);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return apiClient(originalRequest);
        } catch (refreshErr) {
          await clearAuthSession();
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
