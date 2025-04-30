import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Text, Button } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AnimalService, { AnimalUpdateRequest } from '../../services/AnimalService';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

// Define the route params type
type EditAnimalRouteProp = RouteProp<{
  EditAnimal: {
    animalId: number;
  };
}, 'EditAnimal'>;

// Interface for shed location data from API
interface ShedLocation {
  id: number;
  farmId: number;
  name: string;
  description: string;
  capacity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditAnimalScreen() {
  const navigation = useNavigation();
  const route = useRoute<EditAnimalRouteProp>();
  const { animalId } = route.params;
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [shedLocations, setShedLocations] = useState<ShedLocation[]>([]);
  const [showShedPicker, setShowShedPicker] = useState(false);
  const [showLactationPicker, setShowLactationPicker] = useState(false);
  const [formData, setFormData] = useState<AnimalUpdateRequest>({
    name: '',
    tag_id: '',
    date_of_birth: new Date().toISOString().split('T')[0],
    breed: '',
    animal_type: 'Cow',
    gender: 'Female',
    health_status: 'Healthy',
    price: '',
    lactation: 'Not Applicable',
    shed_location_id: '',
    image_path: '',
  });

  // Animal type options - matching backend enum exactly
  const animalTypes = ['Cow', 'Heifer', 'Bull', 'Weaner', 'Calf'];
  
  // Gender options
  const genderOptions = ['Male', 'Female'];
  
  // Health status options
  const healthOptions = ['Healthy', 'Sick', 'Under Treatment'];

  // Lactation options
  const lactationOptions = ['Active', 'Non-Active', 'Dry', 'Not Applicable'];

  // Fetch animal data and shed locations when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch animal data and shed locations in parallel
        const [animal, locationsResponse] = await Promise.all([
          AnimalService.getAnimalById(animalId),
          api.get('/v1/livestock/shedLocation')
        ]);
        
        // Set shed locations
        if (locationsResponse.data.success) {
          setShedLocations(locationsResponse.data.data.data || []);
        }
        
        // Set form data from animal
        setFormData({
          name: animal.name,
          tag_id: animal.tag_id,
          date_of_birth: animal.date_of_birth,
          breed: animal.breed,
          animal_type: animal.animal_type,
          gender: animal.gender,
          health_status: animal.health_status,
          price: animal.price || '',
          lactation: animal.lactation || 'Not Applicable',
          shed_location_id: animal.shed_location_id.toString(),
          image_path: animal.image_path || '',
        });
        
        // Set image URI if available
        if (animal.image_path) {
          setImageUri(animal.image_path);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load animal data. Please try again.');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [animalId]);

  // Handle input changes
  const handleInputChange = (field: keyof AnimalUpdateRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleInputChange('date_of_birth', formattedDate);
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(
        'Permission Required', 
        'You need to allow access to your photos to set an animal image'
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
      setImageUri(result.assets[0].uri);
      handleInputChange('image_path', result.assets[0].uri);
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      Alert.alert('Validation Error', 'Animal name is required');
      return false;
    }
    
    if (!formData.tag_id?.trim()) {
      Alert.alert('Validation Error', 'Tag ID is required');
      return false;
    }
    
    if (!formData.breed?.trim()) {
      Alert.alert('Validation Error', 'Breed is required');
      return false;
    }
    
    if (!formData.shed_location_id) {
      Alert.alert('Validation Error', 'Shed location is required');
      return false;
    }
    
    return true;
  };

  // Save updated animal data
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      await AnimalService.updateAnimal(animalId, formData);
      Alert.alert(
        'Success',
        'Animal updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating animal:', error);
      Alert.alert('Error', 'Failed to update animal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel and go back
  const handleCancel = () => {
    navigation.goBack();
  };

  // Select a shed location
  const handleSelectShed = (shed: ShedLocation) => {
    setFormData(prev => ({
      ...prev,
      shed_location_id: shed.id.toString()
    }));
    setShowShedPicker(false);
  };

  // Select a lactation status
  const handleSelectLactation = (lactation: string) => {
    setFormData(prev => ({
      ...prev,
      lactation
    }));
    setShowLactationPicker(false);
  };

  // Get selected shed name
  const getSelectedShedName = () => {
    if (!formData.shed_location_id) return 'Select a shed location';
    const selectedShed = shedLocations.find(shed => shed.id.toString() === formData.shed_location_id);
    return selectedShed ? selectedShed.name : 'Select a shed location';
  };

  // Radio button component
  const RadioButton = ({ 
    selected, 
    label, 
    onPress 
  }: { 
    selected: boolean; 
    label: string; 
    onPress: () => void; 
  }) => (
    <TouchableOpacity style={styles.radioOption} onPress={onPress}>
      <View style={[styles.radioButton, selected && styles.radioButtonSelected]}>
        {selected && <View style={styles.radioButtonInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // Loading indicator
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7367F0" />
        <Text style={styles.loadingText}>Loading animal data...</Text>
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
          <Text style={styles.headerTitle}>Edit Animal</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Animal Image */}
          <View style={styles.imageSection}>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.animalImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={40} color="#999" />
                  <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {/* Name Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Animal Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Enter animal name"
              />
            </View>

            {/* Tag ID Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tag ID *</Text>
              <TextInput
                style={styles.input}
                value={formData.tag_id}
                onChangeText={(text) => handleInputChange('tag_id', text)}
                placeholder="Enter tag ID"
              />
            </View>

            {/* Breed Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Breed *</Text>
              <TextInput
                style={styles.input}
                value={formData.breed}
                onChangeText={(text) => handleInputChange('breed', text)}
                placeholder="Enter breed"
              />
            </View>

            {/* Date of Birth Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {formData.date_of_birth || 'Select date of birth'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(formData.date_of_birth || Date.now())}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Animal Type Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Animal Type</Text>
              <View style={styles.radioGroup}>
                {animalTypes.map((type) => (
                  <RadioButton
                    key={type}
                    selected={formData.animal_type === type}
                    label={type}
                    onPress={() => handleInputChange('animal_type', type)}
                  />
                ))}
              </View>
            </View>

            {/* Gender Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.radioGroupRow}>
                {genderOptions.map((gender) => (
                  <RadioButton
                    key={gender}
                    selected={formData.gender === gender}
                    label={gender}
                    onPress={() => handleInputChange('gender', gender)}
                  />
                ))}
              </View>
            </View>

            {/* Health Status Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Health Status</Text>
              <View style={styles.radioGroup}>
                {healthOptions.map((status) => (
                  <RadioButton
                    key={status}
                    selected={formData.health_status === status}
                    label={status}
                    onPress={() => handleInputChange('health_status', status)}
                  />
                ))}
              </View>
            </View>

            {/* Price Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Price (optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => handleInputChange('price', text)}
                placeholder="Enter price"
                keyboardType="numeric"
              />
            </View>

            {/* Lactation Field - Only show for female animals */}
            {formData.gender === 'Female' && formData.animal_type === 'Cow' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Lactation Status</Text>
                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => setShowLactationPicker(true)}
                >
                  <View style={styles.pickerButton}>
                    <Text style={styles.pickerButtonText}>
                      {formData.lactation || 'Select lactation status'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#777" />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Shed Location Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Shed Location *</Text>
              <TouchableOpacity 
                style={styles.input}
                onPress={() => setShowShedPicker(true)}
              >
                <View style={styles.pickerButton}>
                  <Text style={styles.pickerButtonText}>
                    {getSelectedShedName()}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#777" />
                </View>
              </TouchableOpacity>
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

        {/* Shed Location Picker Modal */}
        <Modal
          visible={showShedPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowShedPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Shed Location</Text>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setShowShedPicker(false)}
                >
                  <Ionicons name="close" size={24} color="#3F4E6C" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={shedLocations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.listItem}
                    onPress={() => handleSelectShed(item)}
                  >
                    <View>
                      <Text style={styles.listItemTitle}>{item.name}</Text>
                      <Text style={styles.listItemSubtitle}>{item.description}</Text>
                    </View>
                    {formData.shed_location_id === item.id.toString() && (
                      <Ionicons name="checkmark" size={24} color="#7367F0" />
                    )}
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                  <Text style={styles.emptyList}>No shed locations available</Text>
                }
              />
            </View>
          </View>
        </Modal>

        {/* Lactation Picker Modal */}
        <Modal
          visible={showLactationPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLactationPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Lactation Status</Text>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setShowLactationPicker(false)}
                >
                  <Ionicons name="close" size={24} color="#3F4E6C" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={lactationOptions}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.listItem}
                    onPress={() => handleSelectLactation(item)}
                  >
                    <Text style={styles.listItemTitle}>{item}</Text>
                    {formData.lactation === item && (
                      <Ionicons name="checkmark" size={24} color="#7367F0" />
                    )}
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          </View>
        </Modal>
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
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3F4E6C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3F4E6C',
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  imageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imagePicker: {
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
  animalImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  formContainer: {
    padding: 16,
    backgroundColor: '#F8F9FB',
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  radioGroup: {
    marginTop: 8,
  },
  radioGroupRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginRight: 24,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7367F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    borderColor: '#7367F0',
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#7367F0',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3F4E6C',
  },
  modalCloseButton: {
    padding: 4,
  },
  listItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listItemTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#EAEAEA',
  },
  emptyList: {
    padding: 16,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
}); 