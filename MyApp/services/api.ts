import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:5000/api' 
  : 'http://localhost:5000/api';

export const setAuthToken = async (token: string | null) => {
  if (token) {
    await SecureStore.setItemAsync('token', token);
  } else {
    await SecureStore.deleteItemAsync('token');
  }
};

export const getAuthToken = async () => {
  return await SecureStore.getItemAsync('token');
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await setAuthToken(null);
  }

  return response;
};
