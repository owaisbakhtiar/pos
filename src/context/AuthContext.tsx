import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import { User, AuthState, DecodedToken } from '../types/auth';
import axios from 'axios';
import { DeviceEventEmitter } from 'react-native-safe-area-context';

// Default auth state
const defaultAuthState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  userRole: null,
};

// Create context
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isTokenValid: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(defaultAuthState);

  // Effect to load auth data on startup
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        
        if (token) {
          // Check if token is expired
          const isValid = isTokenValidInternal(token);
          
          if (isValid) {
            // Load user data from secure storage
            const userDataStr = await SecureStore.getItemAsync('user_info');
            const userRole = await SecureStore.getItemAsync('user_role');
            
            if (userDataStr) {
              const user = JSON.parse(userDataStr) as User;
              setState({
                user,
                token,
                isLoading: false,
                isAuthenticated: true,
                userRole: userRole || null,
              });
              return;
            }
          } else {
            // Token is expired, clear storage
            await logout();
          }
        }
        
        // No valid token found
        setState({
          ...defaultAuthState,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error loading auth data:', error);
        setState({
          ...defaultAuthState,
          isLoading: false,
        });
      }
    };

    loadAuthData();
  }, []);

  // Listen for unauthorized events using DeviceEventEmitter instead of document
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    // Add event listener
    DeviceEventEmitter.addListener('unauthorized', handleUnauthorized);

    // Cleanup
    return () => {
      DeviceEventEmitter.removeAllListeners('unauthorized');
    };
  }, []);

  // Helper to check token validity
  const isTokenValidInternal = (token: string): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  // Public method to check token validity
  const isTokenValid = (): boolean => {
    return state.token ? isTokenValidInternal(state.token) : false;
  };

  // Login method
  const login = async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log("AuthContext: Initiating login request");
      // Use the correct path with leading slash for the API endpoint
      const response = await api.post('/v1/auth/mobile/login', { email, password });
      const { success, message, data } = response.data;
      
      console.log("AuthContext: Login response received:", success, message);
      
      if (!success) {
        console.log("AuthContext: Login unsuccessful:", message);
        // When login fails, reset loading state but don't change other state properties
        setState(prev => ({ ...prev, isLoading: false }));
        // Handle unsuccessful login - throw error with the message from API
        throw new Error(message || 'Login failed');
      }
      
      if (success && data) {
        console.log("AuthContext: Login successful, processing data");
        const { user, token, token_type, expires_in } = data;
        
        // Extract user role
        const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : null;
        
        // Store token and user data securely
        await SecureStore.setItemAsync('auth_token', token);
        await SecureStore.setItemAsync('user_info', JSON.stringify(user));
        if (userRole) {
          await SecureStore.setItemAsync('user_role', userRole);
        }
        
        // Update state
        setState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
          userRole,
        });
        
        console.log("AuthContext: Login state updated successfully");
      } else {
        // This should not happen if we properly handle the !success case above
        console.log("AuthContext: Login data missing despite success flag");
        setState(prev => ({ ...prev, isLoading: false }));
        throw new Error('Login data missing');
      }
    } catch (error: unknown) {
      console.error('Login error in AuthContext:', error);
      // Reset loading state on error, but keep other state values the same
      setState(prev => ({ ...prev, isLoading: false }));
      
      if (axios.isAxiosError(error)) {
        // Handle Axios errors
        const axiosError = error as any;
        
        // Check for API response with success: false
        if (axiosError.response?.data?.success === false) {
          console.log("AuthContext: API returned success=false:", axiosError.response.data.message);
          throw new Error(axiosError.response.data.message || 'Invalid login details');
        } else if (!axiosError.response) {
          throw new Error('Network Error. Please check your connection.');
        } else {
          throw new Error(`Error ${axiosError.response.status}: ${axiosError.response.statusText}`);
        }
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  };

  // Logout method
  const logout = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Get token for authorization header
      const token = await SecureStore.getItemAsync('auth_token');
      
      if (token) {
        try {
          // Call logout API with proper authorization
          await api.post('/v1/auth/logout', {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log('Logout API call successful');
        } catch (error) {
          // If the API call fails, we still want to clear local storage
          console.error('Logout API call failed:', error);
        }
      }
      
      // Clear secure storage
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_info');
      await SecureStore.deleteItemAsync('user_role');
      
      // Reset state
      setState({
        ...defaultAuthState,
        isLoading: false,
      });
      
      console.log('Logout completed - all auth data cleared');
    } catch (error) {
      console.error('Logout error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  // Expose context value
  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    isTokenValid,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Create hook for easy context access
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 