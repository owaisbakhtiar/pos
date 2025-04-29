export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  farm_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  farm_name: string;
  token: string;
}

class AuthService {
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

  // Mock login functionality
  async login(credentials: LoginRequest): Promise<UserData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For demo purposes, any valid email/password combination works
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }
    
    return {
      id: 'user_' + Math.floor(Math.random() * 10000),
      name: 'Demo User',
      email: credentials.email,
      farm_name: 'Demo Farm',
      token: 'mock_token_' + Math.random().toString(36).substring(2, 15)
    };
  }

  // Mock logout functionality
  async logout(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, this would clear the token from storage
    return;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    // In a real app, this would check for a valid token in storage
    return false;
  }
}

export default new AuthService(); 