import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
  Text as RNText,
} from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LoginRequest } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Prevent automatic navigation if there was a login error
  useEffect(() => {
    // Only allow navigation to happen if we're not showing an error
    // This prevents the app from navigating away when there's an error
    if (isAuthenticated && !loginError && !isLoading) {
      // Navigation will happen automatically via App.tsx
      console.log("LoginScreen: Auth state changed, ready for navigation");
    }
  }, [isAuthenticated, loginError, isLoading]);
  
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    // Clear login error when user starts typing
    if (loginError) {
      setLoginError(null);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when typing
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };
  
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoginError(null);
    setIsLoading(true);
    
    try {
      console.log("LoginScreen: Attempting login with", formData.email);
      await login(formData.email, formData.password);
      console.log("LoginScreen: Login successful");
      // No need to navigate - AuthContext will handle the state change
      // that will trigger navigation in App.tsx
    } catch (error) {
      console.log("LoginScreen: Login failed with error:", error);
      // Extract and display the error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
        
      // Check if it's an invalid credentials error from the API
      if (errorMessage.includes('Invalid login details') || 
          errorMessage.toLowerCase().includes('invalid') ||
          errorMessage.toLowerCase().includes('incorrect')) {
        setLoginError(errorMessage);
        
        // Show Alert in addition to inline error
        setTimeout(() => {
          Alert.alert(
            "Login Failed",
            errorMessage,
            [{ text: "OK" }]
          );
        }, 100);
      } else if (errorMessage.toLowerCase().includes('network')) {
        setLoginError('Network error. Please check your internet connection and try again.');
        
        // Show Alert for network errors
        setTimeout(() => {
          Alert.alert(
            "Network Error",
            'Network error. Please check your internet connection and try again.',
            [{ text: "OK" }]
          );
        }, 100);
      } else {
        setLoginError(errorMessage);
        
        // Show Alert for other errors
        setTimeout(() => {
          Alert.alert(
            "Login Error",
            errorMessage,
            [{ text: "OK" }]
          );
        }, 100);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            {/* <Image 
              source={require('../../../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            /> */}
          </View>
          
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to continue using FarmApp</Text>
          
          {/* Display login error if any */}
          {loginError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#FF3B30" style={styles.errorIcon} />
              <RNText style={styles.loginErrorText}>{loginError}</RNText>
            </View>
          )}
          
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="johndoe@example.com"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>
            
            {/* Password Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="• • • • • • • •"
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.visibilityIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#777" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>
            
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          
          <Button 
            title={isLoading ? "Logging in..." : "Log In"}
            onPress={handleLogin}
            style={styles.loginButton}
            variant="primary"
            disabled={isLoading}
          />
          
          {isLoading && (
            <ActivityIndicator 
              size="small" 
              color="#7367F0" 
              style={styles.loader}
            />
          )}
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3F4E6C',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#777777',
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  visibilityIcon: {
    padding: 4,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#7367F0',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    height: 56,
    borderRadius: 30,
    marginVertical: 16,
  },
  loader: {
    marginTop: 10,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 14,
    color: '#777',
  },
  signupLink: {
    fontSize: 14,
    color: '#7367F0',
    fontWeight: '600',
    marginLeft: 5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEEEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorIcon: {
    marginRight: 8,
  },
  loginErrorText: {
    color: '#FF3B30',
    fontSize: 14,
    flex: 1,
  },
}); 