import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../services/api';
import Toast from 'react-native-toast-message';
import DropDownPicker from 'react-native-dropdown-picker';

// Define interface for regional settings
interface RegionalSettings {
  language: string;
  timezone: string;
  date_format: string;
  time_format: string;
  first_day_of_week: number;
}

export default function EditRegionalSettingsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = route.params as { regionalSettings: RegionalSettings };
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<RegionalSettings>({
    language: 'en',
    timezone: 'UTC',
    date_format: 'Y-m-d',
    time_format: 'H:i:s',
    first_day_of_week: 1,
  });
  
  // Dropdown open states
  const [languageOpen, setLanguageOpen] = useState(false);
  const [timezoneOpen, setTimezoneOpen] = useState(false);
  const [dateFormatOpen, setDateFormatOpen] = useState(false);
  const [timeFormatOpen, setTimeFormatOpen] = useState(false);
  const [weekStartOpen, setWeekStartOpen] = useState(false);
  
  // Dropdown items
  const [languages] = useState([
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' },
    { label: 'Chinese', value: 'zh' },
    { label: 'Arabic', value: 'ar' },
    { label: 'Urdu', value: 'ur' },
  ]);
  
  const [timezones] = useState([
    { label: 'UTC', value: 'UTC' },
    { label: 'America/New_York', value: 'America/New_York' },
    { label: 'America/Chicago', value: 'America/Chicago' },
    { label: 'America/Denver', value: 'America/Denver' },
    { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
    { label: 'Europe/London', value: 'Europe/London' },
    { label: 'Europe/Paris', value: 'Europe/Paris' },
    { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
    { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
    { label: 'Asia/Karachi', value: 'Asia/Karachi' },
    { label: 'Australia/Sydney', value: 'Australia/Sydney' },
  ]);
  
  const [dateFormats] = useState([
    { label: 'YYYY-MM-DD', value: 'Y-m-d' },
    { label: 'DD/MM/YYYY', value: 'd/m/Y' },
    { label: 'MM/DD/YYYY', value: 'm/d/Y' },
    { label: 'DD-MM-YYYY', value: 'd-m-Y' },
    { label: 'MM-DD-YYYY', value: 'm-d-Y' },
  ]);
  
  const [timeFormats] = useState([
    { label: '24-hour (HH:MM:SS)', value: 'H:i:s' },
    { label: '24-hour (HH:MM)', value: 'H:i' },
    { label: '12-hour (hh:mm:ss AM/PM)', value: 'h:i:s A' },
    { label: '12-hour (hh:mm AM/PM)', value: 'h:i A' },
  ]);
  
  const [weekStarts] = useState([
    { label: 'Monday', value: 1 },
    { label: 'Sunday', value: 0 },
    { label: 'Saturday', value: 6 },
  ]);
  
  // Load regional settings when component mounts
  useEffect(() => {
    if (routeParams?.regionalSettings) {
      setFormData(routeParams.regionalSettings);
    } else {
      fetchRegionalSettings();
    }
  }, [routeParams]);
  
  // Fetch regional settings from API
  const fetchRegionalSettings = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/v1/settings/general-settings/regional-settings');
      if (response.data.success && response.data.data) {
        setFormData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching regional settings:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not load regional settings',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form value changes
  const handleValueChange = (field: keyof RegionalSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Format the current date and time based on selected formats
  const getFormattedDateTime = () => {
    const now = new Date();
    
    // This is a simplified implementation - in a real app, you'd use a proper date formatting library
    let dateStr, timeStr;
    
    switch (formData.date_format) {
      case 'Y-m-d':
        dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        break;
      case 'd/m/Y':
        dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        break;
      case 'm/d/Y':
        dateStr = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()}`;
        break;
      case 'd-m-Y':
        dateStr = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
        break;
      case 'm-d-Y':
        dateStr = `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getFullYear()}`;
        break;
      default:
        dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    }
    
    const hours24 = now.getHours();
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours24 < 12 ? 'AM' : 'PM';
    
    switch (formData.time_format) {
      case 'H:i:s':
        timeStr = `${hours24.toString().padStart(2, '0')}:${minutes}:${seconds}`;
        break;
      case 'H:i':
        timeStr = `${hours24.toString().padStart(2, '0')}:${minutes}`;
        break;
      case 'h:i:s A':
        timeStr = `${hours12.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
        break;
      case 'h:i A':
        timeStr = `${hours12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
        break;
      default:
        timeStr = `${hours24.toString().padStart(2, '0')}:${minutes}:${seconds}`;
    }
    
    return { dateStr, timeStr };
  };
  
  // Save regional settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.put('/v1/settings/general-settings/regional-settings', formData);
      
      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Regional settings updated successfully',
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error updating regional settings:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update regional settings',
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
  
  const { dateStr, timeStr } = getFormattedDateTime();
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#3F4E6C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Regional Settings</Text>
          <View style={styles.placeholderButton} />
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
            <Text style={styles.description}>
              Configure language, date, time, and other regional preferences for your farm.
            </Text>
            
            {/* Language */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Language</Text>
              <DropDownPicker
                open={languageOpen}
                value={formData.language}
                items={languages}
                setOpen={setLanguageOpen}
                setValue={(callback) => {
                  const value = callback(formData.language);
                  handleValueChange('language', value);
                  return value;
                }}
                setItems={() => {}}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={5000}
                zIndexInverse={1000}
              />
            </View>
            
            {/* Timezone */}
            <View style={[styles.formGroup, { marginTop: languageOpen ? 150 : 20 }]}>
              <Text style={styles.label}>Timezone</Text>
              <DropDownPicker
                open={timezoneOpen}
                value={formData.timezone}
                items={timezones}
                setOpen={setTimezoneOpen}
                setValue={(callback) => {
                  const value = callback(formData.timezone);
                  handleValueChange('timezone', value);
                  return value;
                }}
                setItems={() => {}}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={4000}
                zIndexInverse={2000}
                searchable={true}
                placeholder="Select a timezone"
              />
            </View>
            
            {/* Date Format */}
            <View style={[styles.formGroup, { marginTop: timezoneOpen ? 200 : 20 }]}>
              <Text style={styles.label}>Date Format</Text>
              <DropDownPicker
                open={dateFormatOpen}
                value={formData.date_format}
                items={dateFormats}
                setOpen={setDateFormatOpen}
                setValue={(callback) => {
                  const value = callback(formData.date_format);
                  handleValueChange('date_format', value);
                  return value;
                }}
                setItems={() => {}}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={3000}
                zIndexInverse={3000}
              />
            </View>
            
            {/* Time Format */}
            <View style={[styles.formGroup, { marginTop: dateFormatOpen ? 150 : 20 }]}>
              <Text style={styles.label}>Time Format</Text>
              <DropDownPicker
                open={timeFormatOpen}
                value={formData.time_format}
                items={timeFormats}
                setOpen={setTimeFormatOpen}
                setValue={(callback) => {
                  const value = callback(formData.time_format);
                  handleValueChange('time_format', value);
                  return value;
                }}
                setItems={() => {}}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={2000}
                zIndexInverse={4000}
              />
            </View>
            
            {/* First Day of Week */}
            <View style={[styles.formGroup, { marginTop: timeFormatOpen ? 150 : 20 }]}>
              <Text style={styles.label}>First Day of Week</Text>
              <DropDownPicker
                open={weekStartOpen}
                value={formData.first_day_of_week}
                items={weekStarts}
                setOpen={setWeekStartOpen}
                setValue={(callback) => {
                  const value = callback(formData.first_day_of_week);
                  handleValueChange('first_day_of_week', value);
                  return value;
                }}
                setItems={() => {}}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={1000}
                zIndexInverse={5000}
              />
            </View>
            
            {/* Example Preview */}
            <View style={[styles.exampleContainer, { marginTop: weekStartOpen ? 120 : 20 }]}>
              <Text style={styles.label}>Preview:</Text>
              <Text style={styles.example}>
                {dateStr}
              </Text>
              <Text style={styles.example}>
                {timeStr}
              </Text>
              <Text style={styles.exampleLanguage}>
                Language: {languages.find(l => l.value === formData.language)?.label || formData.language}
              </Text>
              <Text style={styles.exampleTimezone}>
                Timezone: {formData.timezone}
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
    paddingBottom: 100, // Extra padding at bottom for dropdowns
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 20,
    zIndex: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  dropdown: {
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },
  dropdownContainer: {
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  exampleContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    zIndex: -1,
  },
  example: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3F4E6C',
    textAlign: 'center',
    marginTop: 8,
  },
  exampleLanguage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  exampleTimezone: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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