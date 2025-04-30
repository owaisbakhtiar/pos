import api from './api';
import { LoginRequest, AuthResponse, User } from '../types/auth';
import axios, { AxiosError } from 'axios';

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  farm_name: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  farm_name: string;
  token: string;
}

// For testing/demo purposes
const MOCK_USERS = [
  {
    email: 'john1@example.com',
    password: 'password123',
    user: {
      id: 8,
      name: 'John Doe',
      email: 'john1@example.com',
      email_verified_at: null,
      farm_id: 9,
      roles: [{ id: 2, name: 'farm-admin', guard_name: 'web', created_at: '2025-04-23T11:11:09.000000Z', updated_at: '2025-04-23T11:11:09.000000Z' }],
      created_at: '2025-04-30T05:03:53.000000Z',
      updated_at: '2025-04-30T05:03:53.000000Z'
    }
  }
];

// IMPORTANT: Set to true to use mock data instead of real API
const MOCK_MODE = false; // Change to false when you have a real API endpoint working

class AuthService {
  /**
   * Login with email and password
   * @param credentials User credentials
   * @returns Authentication response data
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    if (MOCK_MODE) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find user in mock data
      const user = MOCK_USERS.find(u => 
        u.email === credentials.email && u.password === credentials.password
      );
      
      if (user) {
        // Return successful mock response
        return {
          success: true,
          message: 'Login successful',
          data: {
            user: user.user,
            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvYXBpL3YxL2F1dGgvbW9iaWxlL2xvZ2luIiwiaWF0IjoxNzEyODIwOTc0LCJleHAiOjE3NDQzNTY5NzQsIm5iZiI6MTcxMjgyMDk3NCwianRpIjoiTUV1eWlhb21iMTRpUFdxYyIsInN1YiI6IjgiLCJwcnYiOiIyM2JkNWM4OTQ5ZjYwMGFkYjM5ZTcwMWM0MDA4NzJkYjdhNTk3NmY3In0.RDGYgdK6X0J7jFNqS_KptrYTHvL0D4Dym3-5DYJiHkQ',
            token_type: 'bearer',
            expires_in: 3600,
          }
        };
      } else {
        // Return error for invalid credentials
        return {
          success: false,
          message: 'Invalid login details',
          data: null
        };
      }
    }
    
    // Real API implementation
    try {
      console.log("Attempting login with:", credentials.email);
      const response = await api.post<AuthResponse>('/v1/auth/mobile/login', credentials);
      
      // Check if the API responded with success: false
      if (response.data && response.data.success === false) {
        console.log("Login failed with API response:", response.data);
        // The API responded with an error, but it's not a network error
        // We need to throw this as an error to be caught by the login method
        throw new Error(response.data.message || 'Invalid login details');
      }
      
      return response.data;
    } catch (error: unknown) {
      console.log("Login error caught:", error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        // Handle API response errors (when API returns success: false)
        if (axiosError.response?.data) {
          const responseData = axiosError.response.data as any;
          
          // Check if it's a validation error with invalid credentials
          if (responseData.success === false) {
            throw new Error(responseData.message || 'Invalid login details');
          }
          
          throw new Error(responseData.message || 'Authentication failed');
        }
        
        // Handle network errors
        if (!axiosError.response) {
          throw new Error('Network Error. Please check your connection.');
        }
      }
      throw error;
    }
  }

  /**
   * Get the current user profile
   * @returns User profile data
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/v1/user/profile');
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
          throw new Error((axiosError.response.data as any).message || 'Failed to get user profile');
        }
      }
      throw error;
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/v1/auth/logout');
    } catch (error: unknown) {
      console.error('Logout error:', error);
      // Even if the server-side logout fails, we still want to clear local storage
      throw error;
    }
  }

  // Mock signup functionality
  async signup(userData: SignupRequest): Promise<UserData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validation
    if (userData.password !== userData.password_confirmation) {
      throw new Error('Passwords do not match');
    }
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format');
    }
    
    // Simulate successful signup
    return {
      id: 'user_' + Math.floor(Math.random() * 10000),
      name: userData.name,
      email: userData.email,
      farm_name: userData.farm_name,
      token: 'mock_token_' + Math.random().toString(36).substring(2, 15)
    };
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    // In a real app, this would check for a valid token in storage
    return false;
  }
}

export default new AuthService(); 