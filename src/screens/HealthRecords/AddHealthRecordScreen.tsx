import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/common';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import HealthRecordService, { Veterinarian, HealthRecordFormData } from '../../services/HealthRecordService';
import AnimalService, { Animal } from '../../services/AnimalService';
import * as ImagePicker from 'expo-image-picker';

// Define status options
const statusOptions = ['Healthy', 'Sick', 'Under Treatment'];

// Define navigation type
type RootStackParamList = {
  Home: undefined;
  HealthRecords: undefined;
  AddHealthRecord: undefined;
  EditHealthRecord: { recordId: number };
  HealthRecordDetail: { recordId: number };
  ManageVeterinarians: undefined;
  ManageVaccines: undefined;
};

// Main component
export default function AddHealthRecordScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // Form state
  const [formData, setFormData] = useState<HealthRecordFormData>({
    animal_id: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'Healthy',
    treatment: '',
    diagnosis: '',
    notes: '',
    next_checkup_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    veterinarian_id: 0,
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNextCheckupPicker, setShowNextCheckupPicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<'date' | 'next_checkup_date'>('date');
  
  // Image state
  const [images, setImages] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  
  // Data state
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true);
  const [loadingVets, setLoadingVets] = useState(true);
  
  // Load animals and veterinarians on component mount
  useEffect(() => {
    fetchAnimals();
    fetchVeterinarians();
    requestCameraPermissions();
  }, []);
  
  // Request camera and media library permissions
  const requestCameraPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and media library permissions to attach images.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Fetch animals from API
  const fetchAnimals = async () => {
    setLoadingAnimals(true);
    try {
      const response = await AnimalService.getAnimals(1, '', '');
      setAnimals(response.animals);
      
      // Set first animal as default if available
      if (response.animals.length > 0) {
        setFormData(prev => ({
          ...prev,
          animal_id: response.animals[0].id
        }));
      }
    } catch (error) {
      console.error('Error fetching animals:', error);
      Alert.alert('Error', 'Failed to load animals. Please try again.');
    } finally {
      setLoadingAnimals(false);
    }
  };
  
  // Fetch veterinarians from API
  const fetchVeterinarians = async () => {
    setLoadingVets(true);
    try {
      const response = await HealthRecordService.getVeterinarians(1, '');
      setVeterinarians(response.vets);
      
      // Set first vet as default if available
      if (response.vets.length > 0) {
        setFormData(prev => ({
          ...prev,
          veterinarian_id: response.vets[0].id
        }));
      }
    } catch (error) {
      console.error('Error fetching veterinarians:', error);
      Alert.alert('Error', 'Failed to load veterinarians. Please try again.');
    } finally {
      setLoadingVets(false);
    }
  };
  
  // Handle input changes
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle date picker
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    setShowNextCheckupPicker(false);
    
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        [currentDateField]: formattedDate
      }));
    }
  };
  
  // Show date picker
  const showDatePickerModal = (field: 'date' | 'next_checkup_date') => {
    setCurrentDateField(field);
    if (field === 'date') {
      setShowDatePicker(true);
    } else {
      setShowNextCheckupPicker(true);
    }
  };
  
  // Take photo with camera
  const takePhoto = async () => {
    try {
      setImageUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages = [...images, result.assets[0].uri];
        setImages(newImages);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };
  
  // Pick image from gallery
  const pickImage = async () => {
    try {
      setImageUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUris = result.assets.map(asset => asset.uri);
        setImages([...images, ...selectedUris]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };
  
  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  // Prepare images for upload
  const prepareImagesForUpload = () => {
    if (images.length === 0) return undefined;
    
    const formData = new FormData();
    
    images.forEach((uri, index) => {
      const filenameParts = uri.split('/');
      const filename = filenameParts[filenameParts.length - 1];
      
      // @ts-ignore - React Native's FormData implementation needs this format
      formData.append('images', {
        uri,
        name: filename,
        type: 'image/jpeg',
      });
    });
    
    return formData;
  };
  
  // Validate form
  const validateForm = () => {
    if (formData.animal_id === 0) {
      Alert.alert('Validation Error', 'Please select an animal');
      return false;
    }
    
    if (formData.diagnosis.trim() === '') {
      Alert.alert('Validation Error', 'Please enter a diagnosis');
      return false;
    }
    
    if (formData.treatment.trim() === '') {
      Alert.alert('Validation Error', 'Please enter a treatment');
      return false;
    }
    
    if (formData.veterinarian_id === 0) {
      Alert.alert('Validation Error', 'Please select a veterinarian');
      return false;
    }
    
    return true;
  };
  
  // Save health record
  const saveHealthRecord = async () => {
    if (!validateForm()) return;
    
    setSavingRecord(true);
    try {
      // Prepare images if we have any
      const imagesFormData = prepareImagesForUpload();
      
      // Add images to the form data
      const recordData = {
        ...formData,
        images: imagesFormData
      };
      
      await HealthRecordService.createHealthRecord(recordData);
      Alert.alert('Success', 'Health record created successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving health record:', error);
      Alert.alert('Error', 'Failed to save health record. Please try again.');
    } finally {
      setSavingRecord(false);
    }
  };
  
  // Loading state
  if (loadingAnimals || loadingVets) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7367F0" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3F4E6C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Health Record</Text>
        <View style={styles.spacer} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView style={styles.formContainer}>
          {/* Animal Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Animal</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.animal_id}
                onValueChange={(value) => handleInputChange('animal_id', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select an animal" value={0} color="#999" />
                {animals.map((animal) => (
                  <Picker.Item
                    key={animal.id}
                    label={`${animal.name} (${animal.tag_id})`}
                    value={animal.id}
                  />
                ))}
              </Picker>
            </View>
          </View>
          
          {/* Status */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Health Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
                style={styles.picker}
              >
                {statusOptions.map((status) => (
                  <Picker.Item 
                    key={status} 
                    label={status} 
                    value={status} 
                  />
                ))}
              </Picker>
            </View>
          </View>
          
          {/* Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Record Date</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => showDatePickerModal('date')}
            >
              <Text style={styles.dateText}>{formData.date}</Text>
              <Ionicons name="calendar" size={22} color="#7367F0" />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={new Date(formData.date)}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
          
          {/* Diagnosis */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Diagnosis</Text>
            <TextInput
              style={styles.input}
              value={formData.diagnosis}
              onChangeText={(value) => handleInputChange('diagnosis', value)}
              placeholder="Enter diagnosis"
              multiline
            />
          </View>
          
          {/* Treatment */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Treatment</Text>
            <TextInput
              style={styles.input}
              value={formData.treatment}
              onChangeText={(value) => handleInputChange('treatment', value)}
              placeholder="Enter treatment"
              multiline
            />
          </View>
          
          {/* Notes */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              placeholder="Enter notes (optional)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          {/* Next Checkup Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Next Checkup Date</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => showDatePickerModal('next_checkup_date')}
            >
              <Text style={styles.dateText}>{formData.next_checkup_date}</Text>
              <Ionicons name="calendar" size={22} color="#7367F0" />
            </TouchableOpacity>
            
            {showNextCheckupPicker && (
              <DateTimePicker
                value={new Date(formData.next_checkup_date)}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
          
          {/* Veterinarian Selection */}
          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Veterinarian</Text>
              {veterinarians.length === 0 && (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('ManageVeterinarians')}
                  style={styles.addNewButton}
                >
                  <Text style={styles.addNewButtonText}>Add New</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.veterinarian_id}
                onValueChange={(value) => handleInputChange('veterinarian_id', value)}
                style={styles.picker}
                enabled={veterinarians.length > 0}
              >
                {veterinarians.length === 0 ? (
                  <Picker.Item label="No veterinarians found" value={0} color="#999" />
                ) : (
                  <>
                    <Picker.Item label="Select a veterinarian" value={0} color="#999" />
                    {veterinarians.map((vet) => (
                      <Picker.Item 
                        key={vet.id} 
                        label={vet.name} 
                        value={vet.id} 
                      />
                    ))}
                  </>
                )}
              </Picker>
            </View>
          </View>
          
          {/* Images Section */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Images</Text>
            <View style={styles.imagesContainer}>
              {images.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {images.map((uri, index) => (
                    <View key={`${uri}-${index}`} style={styles.imageContainer}>
                      <Image source={{ uri }} style={styles.image} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.noImagesText}>No images attached</Text>
              )}
            </View>
            
            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={takePhoto}
                disabled={imageUploading}
              >
                <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
                <Text style={styles.imageButtonText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.imageButton}
                onPress={pickImage}
                disabled={imageUploading}
              >
                <Ionicons name="image-outline" size={24} color="#FFFFFF" />
                <Text style={styles.imageButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
            
            {imageUploading && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color="#7367F0" />
                <Text style={styles.uploadingText}>Processing image...</Text>
              </View>
            )}
          </View>
          
          {/* Save Button */}
          <View style={styles.submitButtonContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={saveHealthRecord}
              disabled={savingRecord}
            >
              {savingRecord ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Save Health Record</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3F4E6C',
  },
  backButton: {
    padding: 4,
  },
  spacer: {
    width: 32,
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3F4E6C',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9EDF5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#3F4E6C',
    minHeight: 50,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9EDF5',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#3F4E6C',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9EDF5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  submitButtonContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  submitButton: {
    backgroundColor: '#7367F0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#3F4E6C',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addNewButton: {
    backgroundColor: '#7367F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  addNewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  imagesContainer: {
    marginTop: 8,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E9EDF5',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#F8F9FB',
  },
  noImagesText: {
    textAlign: 'center',
    color: '#7A869A',
    padding: 16,
  },
  imageContainer: {
    marginRight: 8,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  imageButton: {
    backgroundColor: '#7367F0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  imageButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  uploadingText: {
    marginLeft: 8,
    color: '#7A869A',
  },
}); 