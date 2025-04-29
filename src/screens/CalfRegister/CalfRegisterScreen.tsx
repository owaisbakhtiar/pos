import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { Text, Button } from "../../components/common";
import { colors } from "../../theme";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

type AnimalType = "Cow" | "Heifer" | "Bull" | "Weaner" | "Calf";
type Gender = "male" | "female";
type HealthStatus = "Healthy" | "Sick" | "Under Treatment";
type LactationStatus = "Active" | "Dry" | "Not Applicable";

interface CalfFormData {
  tag_id: string;
  date_of_birth: Date;
  breed: string;
  animal_type: AnimalType;
  gender: Gender;
  health_status: HealthStatus;
  price: string;
  lactation: LactationStatus;
  shed_location_id: string;
  image_path: string | null;
}

// Dropdown component for form selects
const Dropdown = ({ 
  label, 
  value, 
  options, 
  onSelect 
}: { 
  label: string; 
  value: string; 
  options: string[]; 
  onSelect: (value: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.formSection}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity 
        style={styles.dropdownTrigger} 
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.dropdownValue}>{value || `Select ${label}`}</Text>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#777" 
        />
      </TouchableOpacity>
      
      {isOpen && (
        <View style={styles.dropdownList}>
          {options.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(option);
                setIsOpen(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default function CalfRegisterScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<CalfFormData>({
    tag_id: '',
    date_of_birth: new Date(),
    breed: '',
    animal_type: 'Cow',
    gender: 'female',
    health_status: 'Healthy',
    price: '',
    lactation: 'Not Applicable',
    shed_location_id: '',
    image_path: null,
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const updateForm = (field: keyof CalfFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = () => {
    // Validate form
    if (!formData.tag_id) {
      Alert.alert("Error", "Tag ID is required");
      return;
    }
    
    // Check other required fields
    if (!formData.breed) {
      Alert.alert("Error", "Breed is required");
      return;
    }
    
    if (!formData.shed_location_id) {
      Alert.alert("Error", "Shed location ID is required");
      return;
    }
    
    // Submit form to API
    console.log("Submitting form:", formData);
    
    // Show success message
    Alert.alert(
      "Success", 
      "Animal registered successfully!",
      [
        { 
          text: "OK", 
          onPress: () => {
            // Navigate to the animal list screen
            navigation.navigate('AnimalList' as never);
          }
        }
      ]
    );
    
    // Reset form
    setFormData({
      tag_id: '',
      date_of_birth: new Date(),
      breed: '',
      animal_type: 'Cow',
      gender: 'female',
      health_status: 'Healthy',
      price: '',
      lactation: 'Not Applicable',
      shed_location_id: '',
      image_path: null,
    });
  };
  
  const animalTypes = ["Cow", "Heifer", "Bull", "Weaner", "Calf"];
  const genderOptions = ["male", "female"];
  const healthOptions = ["Healthy", "Sick", "Under Treatment"];
  const lactationOptions = ["Active", "Dry", "Not Applicable"];
  const breedOptions = ["Holstein", "Jersey", "Angus", "Hereford", "Brahman", "Gir", "Sahiwal"];
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.date_of_birth;
    setShowDatePicker(Platform.OS === 'ios');
    updateForm('date_of_birth', currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.navbar}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.navbarTitle}>Calf Register</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Unique tag ID*</Text>
            <TextInput
              style={styles.textInput}
              value={formData.tag_id}
              onChangeText={(text) => updateForm('tag_id', text)}
              placeholder="e.g. TAG001"
            />
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Date of birth*</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={showDatepicker}
            >
              <Text>{formatDate(formData.date_of_birth)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#777" />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={formData.date_of_birth}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}
          </View>
          
          <Dropdown
            label="Breed*"
            value={formData.breed}
            options={breedOptions}
            onSelect={(value) => updateForm('breed', value)}
          />
          
          <Dropdown
            label="Animal type*"
            value={formData.animal_type}
            options={animalTypes}
            onSelect={(value) => updateForm('animal_type', value as AnimalType)}
          />
          
          <Dropdown
            label="Gender*"
            value={formData.gender}
            options={genderOptions}
            onSelect={(value) => updateForm('gender', value as Gender)}
          />
          
          <Dropdown
            label="Health status*"
            value={formData.health_status}
            options={healthOptions}
            onSelect={(value) => updateForm('health_status', value as HealthStatus)}
          />
          
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Price (optional)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.price}
              onChangeText={(text) => updateForm('price', text)}
              placeholder="e.g. 1000"
              keyboardType="numeric"
            />
          </View>
          
          <Dropdown
            label="Lactation status (optional)"
            value={formData.lactation}
            options={lactationOptions}
            onSelect={(value) => updateForm('lactation', value as LactationStatus)}
          />
          
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Shed location ID*</Text>
            <TextInput
              style={styles.textInput}
              value={formData.shed_location_id}
              onChangeText={(text) => updateForm('shed_location_id', text)}
              placeholder="e.g. 1"
            />
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Animal image (optional)</Text>
            <TouchableOpacity style={styles.uploadButton}>
              <Ionicons name="image-outline" size={20} color="#7367F0" />
              <Text style={styles.uploadText}>Select image</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formSection}>
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Register Animal</Text>
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
    backgroundColor: '#F8F9FB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3F4E6C',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  navbarTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  formSection: {
    marginBottom: 16,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  dateInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  dropdownTrigger: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  dropdownValue: {
    fontSize: 16,
    color: '#333',
  },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    maxHeight: 200,
    zIndex: 10,
    position: 'absolute',
    top: 74,
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  uploadButton: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  uploadText: {
    color: '#7367F0',
    marginLeft: 8,
    fontSize: 16,
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 30,
    height: 56,
    backgroundColor: '#7468F0',
    shadowColor: "#7468F0",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});
