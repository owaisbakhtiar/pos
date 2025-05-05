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
  ActivityIndicator,
} from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SignupRequest } from '../../services/AuthService';
import api from '../../services/api';
import Toast from 'react-native-toast-message';
import axios from 'axios';

export default function SignupScreen() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SignupRequest>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    farm_name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }
    
    if (!formData.farm_name.trim()) {
      newErrors.farm_name = 'Farm name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleInputChange = (field: keyof SignupRequest, value: string) => {
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
  
  const formatValidationErrors = (errorData: any) => {
    const formattedErrors: {[key: string]: string} = {};
    if (errorData && errorData.errors) {
      Object.keys(errorData.errors).forEach(field => {
        formattedErrors[field] = errorData.errors[field][0];
      });
    }
    return formattedErrors;
  };
  
  const handleSignup = async () => {
    // First validate on the client side
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please check the form for errors',
        position: 'bottom',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Attempting to register user:', formData.email);
      // Call the API to register the user
      const response = await api.post('/v1/auth/register', formData);
      
      console.log('Registration successful:', response.data);
      
      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'User and farm registered successfully',
        position: 'bottom',
        visibilityTime: 4000,
      });
      
      // Navigate to Login screen after a delay
      setTimeout(() => {
        navigation.navigate('Login' as never);
      }, 1500);
      
    } catch (error) {
      console.log('Registration error:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        // Handle 422 validation errors
        if (error.response.status === 422) {
          const serverErrors = formatValidationErrors(error.response.data);
          setErrors(serverErrors);
          
          // Show toast with first error message
          const firstErrorMessage = Object.values(serverErrors)[0];
          Toast.show({
            type: 'error',
            text1: 'Validation Error',
            text2: firstErrorMessage,
            position: 'bottom',
          });
        } else {
          // Handle other errors (500, etc.)
          Toast.show({
            type: 'error',
            text1: 'Registration Failed',
            text2: error.response.data?.message || 'An unexpected error occurred',
            position: 'bottom',
          });
        }
      } else {
        // Handle network or other errors
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: 'Network error or server unavailable',
          position: 'bottom',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Display toast message for client-side validation errors
  useEffect(() => {
    const errorMessages = Object.values(errors);
    if (errorMessages.length > 0) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: errorMessages[0],
        position: 'bottom',
      });
    }
  }, [errors]);
  
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
            <Image 
              source={require('../../../assets/icon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started with FarmApp</Text>
          
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                <Ionicons name="person-outline" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  value={formData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  autoCapitalize="words"
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
            
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
            
            {/* Confirm Password Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputContainer, errors.password_confirmation && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="• • • • • • • •"
                  value={formData.password_confirmation}
                  onChangeText={(text) => handleInputChange('password_confirmation', text)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  style={styles.visibilityIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#777" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password_confirmation && (
                <Text style={styles.errorText}>{errors.password_confirmation}</Text>
              )}
            </View>
            
            {/* Farm Name Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Farm Name</Text>
              <View style={[styles.inputContainer, errors.farm_name && styles.inputError]}>
                <Ionicons name="business-outline" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Green Valley Farm"
                  value={formData.farm_name}
                  onChangeText={(text) => handleInputChange('farm_name', text)}
                />
              </View>
              {errors.farm_name && <Text style={styles.errorText}>{errors.farm_name}</Text>}
            </View>
          </View>
          
          <Button 
            title={isLoading ? "Creating Account..." : "Create Account"}
            onPress={handleSignup}
            style={styles.signupButton}
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
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <Text style={styles.loginLink}>Log In</Text>
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
    marginTop: 20,
    marginBottom: 30,
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
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
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
  signupButton: {
    height: 56,
    borderRadius: 30,
    marginVertical: 16,
  },
  loader: {
    marginTop: 10,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: '#777',
  },
  loginLink: {
    fontSize: 14,
    color: '#7367F0',
    fontWeight: '600',
    marginLeft: 5,
  },
}); 