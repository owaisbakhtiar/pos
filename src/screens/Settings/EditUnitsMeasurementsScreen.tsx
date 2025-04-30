import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../services/api';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';

// Define interface for units and measurements
interface UnitsMeasurements {
  weight_unit: string;
  volume_unit: string;
  area_unit: string;
  temperature_unit: string;
  currency: string;
  decimal_separator: string;
  thousand_separator: string;
}

export default function EditUnitsMeasurementsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = route.params as { unitsSettings: UnitsMeasurements };
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UnitsMeasurements>({
    weight_unit: 'kg',
    volume_unit: 'liters',
    area_unit: 'acres',
    temperature_unit: 'celsius',
    currency: 'USD',
    decimal_separator: '.',
    thousand_separator: ',',
  });
  
  // Options for each field
  const weightUnits = ['kg', 'lb', 'g', 'oz'];
  const volumeUnits = ['liters', 'gallons', 'ml', 'fl oz'];
  const areaUnits = ['acres', 'hectares', 'sq ft', 'sq m'];
  const temperatureUnits = ['celsius', 'fahrenheit'];
  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'PKR', 'JPY', 'CNY'];
  const separators = ['.', ',', ' ', "'"];
  
  // Load units settings when component mounts
  useEffect(() => {
    if (routeParams?.unitsSettings) {
      setFormData(routeParams.unitsSettings);
    } else {
      fetchUnitsSettings();
    }
  }, [routeParams]);
  
  // Fetch units and measurements settings from API
  const fetchUnitsSettings = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/v1/settings/general-settings/units-measurements');
      if (response.data.success && response.data.data) {
        setFormData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching units settings:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not load units and measurements settings',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form value changes
  const handleValueChange = (field: keyof UnitsMeasurements, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Save units and measurements settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.put('/v1/settings/general-settings/units-measurements', formData);
      
      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Units and measurements settings updated successfully',
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error updating units settings:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update units and measurements settings',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Cancel editing and go back
  const handleCancel = () => {
    navigation.goBack();
  };
  
  // Custom Picker component with label
  const PickerWithLabel = ({ 
    label, 
    selectedValue, 
    onValueChange, 
    items 
  }: { 
    label: string, 
    selectedValue: string, 
    onValueChange: (value: string) => void, 
    items: string[] 
  }) => {
    return (
      <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={styles.picker}
          >
            {items.map((item) => (
              <Picker.Item key={item} label={item} value={item} />
            ))}
          </Picker>
        </View>
      </View>
    );
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
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#3F4E6C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Units & Measurements</Text>
          <View style={styles.placeholderButton} />
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
            <Text style={styles.description}>
              Configure the units of measurement and number formatting for your farm.
            </Text>
            
            {/* Weight Unit */}
            <PickerWithLabel
              label="Weight Unit"
              selectedValue={formData.weight_unit}
              onValueChange={(value) => handleValueChange('weight_unit', value)}
              items={weightUnits}
            />
            
            {/* Volume Unit */}
            <PickerWithLabel
              label="Volume Unit"
              selectedValue={formData.volume_unit}
              onValueChange={(value) => handleValueChange('volume_unit', value)}
              items={volumeUnits}
            />
            
            {/* Area Unit */}
            <PickerWithLabel
              label="Area Unit"
              selectedValue={formData.area_unit}
              onValueChange={(value) => handleValueChange('area_unit', value)}
              items={areaUnits}
            />
            
            {/* Temperature Unit */}
            <PickerWithLabel
              label="Temperature Unit"
              selectedValue={formData.temperature_unit}
              onValueChange={(value) => handleValueChange('temperature_unit', value)}
              items={temperatureUnits}
            />
            
            {/* Currency */}
            <PickerWithLabel
              label="Currency"
              selectedValue={formData.currency}
              onValueChange={(value) => handleValueChange('currency', value)}
              items={currencies}
            />
            
            {/* Decimal Separator */}
            <PickerWithLabel
              label="Decimal Separator"
              selectedValue={formData.decimal_separator}
              onValueChange={(value) => handleValueChange('decimal_separator', value)}
              items={separators}
            />
            
            {/* Thousand Separator */}
            <PickerWithLabel
              label="Thousand Separator"
              selectedValue={formData.thousand_separator}
              onValueChange={(value) => handleValueChange('thousand_separator', value)}
              items={separators}
            />
            
            {/* Example Preview */}
            <View style={styles.exampleContainer}>
              <Text style={styles.label}>Number Formatting Example:</Text>
              <Text style={styles.example}>
                1{formData.thousand_separator}234{formData.decimal_separator}56 {formData.weight_unit}
              </Text>
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
      </View>
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
  formContainer: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  exampleContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  example: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3F4E6C',
    textAlign: 'center',
    marginTop: 8,
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