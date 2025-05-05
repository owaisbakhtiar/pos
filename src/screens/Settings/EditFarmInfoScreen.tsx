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
  Alert,
} from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../services/api';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';

// Farm information interface
interface FarmInformation {
  id?: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  logo_path: string | null;
}

export default function EditFarmInfoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = route.params as { farmInfo: FarmInformation };
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FarmInformation>({
    name: '',
    address: null,
    city: null,
    state: null,
    country: null,
    postal_code: null,
    phone: null,
    email: null,
    website: null,
    description: null,
    logo_path: null,
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [logoImage, setLogoImage] = useState<string | null>(null);
  
  // Load farm info data when component mounts
  useEffect(() => {
    if (routeParams?.farmInfo) {
      setFormData(routeParams.farmInfo);
      if (routeParams.farmInfo.logo_path) {
        setLogoImage(routeParams.farmInfo.logo_path);
      }
    } else {
      fetchFarmInformation();
    }
  }, [routeParams]);
  
  // Fetch farm information from API
  const fetchFarmInformation = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/v1/settings/general-settings/farm-information');
      if (response.data.success && response.data.data) {
        setFormData(response.data.data);
        if (response.data.data.logo_path) {
          setLogoImage(response.data.data.logo_path);
        }
      }
    } catch (error) {
      console.error('Error fetching farm information:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not load farm information',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle input changes
  const handleInputChange = (field: keyof FarmInformation, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value.trim() === '' ? null : value 
    }));
    
    // Clear error when typing
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };
  
  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Farm name is required';
    }
    
    if (formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }
    
    if (formData.website && formData.website.trim() !== '') {
      if (!formData.website.startsWith('http://') && !formData.website.startsWith('https://')) {
        newErrors.website = 'Website URL must start with http:// or https://';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle logo image selection
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(
        'Permission Required', 
        'You need to allow access to your photos to set a farm logo'
      );
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setLogoImage(result.assets[0].uri);
      // The actual file upload would happen during save
    }
  };
  
  // Save farm information
  const handleSave = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please check the form for errors',
      });
      return;
    }
    
    setIsSaving(true);
    try {
      // If we have a new logo, we would upload it first and get a path
      // This is simplified, in a real app you'd use FormData to upload the file
      let updatedFormData = { ...formData };
      
      if (logoImage && logoImage !== formData.logo_path) {
        // In a real implementation, this would be an actual file upload
        // For now, just set the path directly
        updatedFormData.logo_path = logoImage;
      }
      
      const response = await api.put('/v1/settings/general-settings/farm-information', updatedFormData);
      
      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Farm information updated successfully',
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error updating farm information:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update farm information',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Cancel editing and go back
  const handleCancel = () => {
    navigation.goBack();
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7367F0" />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#3F4E6C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Farm Information</Text>
          <View style={styles.placeholderButton} />
        </View>
        
        <ScrollView style={styles.scrollView}>
          {/* Logo Picker */}
          <View style={styles.logoContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.logoPickerButton}>
              {logoImage ? (
                <Image 
                  source={{ uri: logoImage }} 
                  style={styles.logoImage} 
                />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Ionicons name="image-outline" size={40} color="#999" />
                  <Text style={styles.logoPlaceholderText}>Add Logo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Farm Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Farm Name *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name || ''}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Enter farm name"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
            
            {/* Address */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={formData.address || ''}
                onChangeText={(text) => handleInputChange('address', text)}
                placeholder="Enter address"
              />
            </View>
            
            {/* City */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={formData.city || ''}
                onChangeText={(text) => handleInputChange('city', text)}
                placeholder="Enter city"
              />
            </View>
            
            {/* State/Province */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>State/Province</Text>
              <TextInput
                style={styles.input}
                value={formData.state || ''}
                onChangeText={(text) => handleInputChange('state', text)}
                placeholder="Enter state or province"
              />
            </View>
            
            {/* Country */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                value={formData.country || ''}
                onChangeText={(text) => handleInputChange('country', text)}
                placeholder="Enter country"
              />
            </View>
            
            {/* Postal Code */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Postal Code</Text>
              <TextInput
                style={styles.input}
                value={formData.postal_code || ''}
                onChangeText={(text) => handleInputChange('postal_code', text)}
                placeholder="Enter postal code"
                keyboardType="numeric"
              />
            </View>
            
            {/* Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone || ''}
                onChangeText={(text) => handleInputChange('phone', text)}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>
            
            {/* Email */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email || ''}
                onChangeText={(text) => handleInputChange('email', text)}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>
            
            {/* Website */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={[styles.input, errors.website && styles.inputError]}
                value={formData.website || ''}
                onChangeText={(text) => handleInputChange('website', text)}
                placeholder="https://yourfarm.com"
                autoCapitalize="none"
              />
              {errors.website && <Text style={styles.errorText}>{errors.website}</Text>}
            </View>
            
            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description || ''}
                onChangeText={(text) => handleInputChange('description', text)}
                placeholder="Describe your farm"
                multiline
                textAlignVertical="top"
                numberOfLines={4}
              />
            </View>
          </View>
        </ScrollView>
        
        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button 
            title="Cancel" 
            onPress={handleCancel} 
            style={styles.cancelButton} 
            variant="outline"
          />
          <Button 
            title={isSaving ? "Saving..." : "Save Changes"} 
            onPress={handleSave} 
            style={styles.saveButton} 
            variant="primary"
            disabled={isSaving}
          />
        </View>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3F4E6C',
  },
  placeholderButton: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  logoPickerButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 0.48,
    minWidth: 120,
  },
  saveButton: {
    flex: 0.48,
    minWidth: 120,
  },
}); 