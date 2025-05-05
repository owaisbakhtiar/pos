import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../types/auth';
import { DeviceEventEmitter, Platform } from 'react-native-safe-area-context';

// Configuration for different environments
const API_CONFIG = {
  // Production API URL
  production: 'https://farm-management.outscalers.com/api',
};

// Set the environment to use
const ENVIRONMENT = 'production';

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG[ENVIRONMENT],
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // Increased timeout
});

// Add a method to check if network is connected
export const isNetworkConnected = async (): Promise<boolean> => {
  try {
    // Perform a simple network request to check connectivity
    await fetch('https://www.google.com', { 
      method: 'HEAD', 
      mode: 'no-cors',
      // Short timeout for quick network check
      signal: AbortSignal.timeout(5000)
    });
    return true;
  } catch (error) {
    console.log('Network connectivity check failed:', error);
    return false;
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    console.log(`Making request to: ${config.baseURL}${config.url}`);

    // Get token from secure storage
    const token = await SecureStore.getItemAsync('auth_token');
    
    if (token) {
      // Check if token is expired
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token expired - handle logout
          // We'll let the AuthContext handle the logout
          throw new Error('Token expired');
        }
        
        // Add token to headers
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        // Token is invalid or expired
        console.error('Token validation error:', error);
        await SecureStore.deleteItemAsync('auth_token');
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Log the error for debugging
    console.log('API Error:', JSON.stringify(error, null, 2));
    
    const originalRequest = error.config;
    
    // Check if the error is a network error
    if (!error.response) {
      const isConnected = await isNetworkConnected();
      if (!isConnected) {
        return Promise.reject(new Error('No internet connection. Please check your network settings.'));
      }
      
      // If we have internet but still get a network error, it might be a CORS or server issue
      return Promise.reject(new Error('Unable to connect to the server. Please try again later.'));
    }
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear token and user info from storage
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_info');
      await SecureStore.deleteItemAsync('user_role');
      
      // Emit event using DeviceEventEmitter
      DeviceEventEmitter.emit('unauthorized', { message: 'Session expired' });
    }
    
    // Handle validation errors (usually 422)
    if (error.response && error.response.status === 422) {
      const validationMessage = error.response.data.message || 'Validation failed';
      return Promise.reject(new Error(validationMessage));
    }
    
    return Promise.reject(error);
  }
);

export default api; 