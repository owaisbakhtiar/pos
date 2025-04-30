import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../services/api';
import Toast from 'react-native-toast-message';

// Define interface for notification preferences
interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
}

export default function EditNotificationPrefsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = route.params as { notificationPrefs: NotificationPreferences };
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
  });
  
  // Load notification preferences when component mounts
  useEffect(() => {
    if (routeParams?.notificationPrefs) {
      setFormData(routeParams.notificationPrefs);
    } else {
      fetchNotificationPreferences();
    }
  }, [routeParams]);
  
  // Fetch notification preferences from API
  const fetchNotificationPreferences = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/v1/settings/general-settings/notification-preferences');
      if (response.data.success && response.data.data) {
        setFormData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not load notification preferences',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle switch toggle changes
  const handleSwitchToggle = (field: keyof NotificationPreferences) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };
  
  // Save notification preferences
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.put('/v1/settings/general-settings/notification-preferences', formData);
      
      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Notification preferences updated successfully',
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update notification preferences',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Cancel editing and go back
  const handleCancel = () => {
    navigation.goBack();
  };
  
  // Custom SwitchItem component
  const SwitchItem = ({ 
    title, 
    description, 
    value, 
    onToggle, 
    icon 
  }: { 
    title: string, 
    description: string, 
    value: boolean, 
    onToggle: () => void, 
    icon: keyof typeof Ionicons.glyphMap 
  }) => {
    return (
      <View style={styles.switchItem}>
        <View style={styles.switchItemLeft}>
          <View style={[styles.iconContainer, { backgroundColor: value ? '#EDEBFF' : '#F5F5F5' }]}>
            <Ionicons name={icon} size={24} color={value ? '#7367F0' : '#999'} />
          </View>
          <View style={styles.switchItemContent}>
            <Text style={styles.switchItemTitle}>{title}</Text>
            <Text style={styles.switchItemDescription}>{description}</Text>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#D1D1D6', true: '#7367F0' }}
          thumbColor="#FFFFFF"
        />
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
          <Text style={styles.headerTitle}>Notification Preferences</Text>
          <View style={styles.placeholderButton} />
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
            <Text style={styles.description}>
              Manage how you receive notifications and alerts from FarmApp.
            </Text>
            
            {/* Email Notifications */}
            <SwitchItem
              title="Email Notifications"
              description="Receive farm alerts and updates via email"
              value={formData.email_notifications}
              onToggle={() => handleSwitchToggle('email_notifications')}
              icon="mail-outline"
            />
            
            {/* Push Notifications */}
            <SwitchItem
              title="Push Notifications"
              description="Receive instant alerts on your device"
              value={formData.push_notifications}
              onToggle={() => handleSwitchToggle('push_notifications')}
              icon="notifications-outline"
            />
            
            {/* SMS Notifications */}
            <SwitchItem
              title="SMS Notifications"
              description="Receive text message alerts (charges may apply)"
              value={formData.sms_notifications}
              onToggle={() => handleSwitchToggle('sms_notifications')}
              icon="chatbubble-outline"
            />
            
            {/* Information card */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={24} color="#3F4E6C" style={styles.infoIcon} />
              <Text style={styles.infoText}>
                You will always receive critical system notifications regardless of these settings.
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
    marginBottom: 24,
    lineHeight: 20,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  switchItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  switchItemContent: {
    flex: 1,
  },
  switchItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3F4E6C',
    marginBottom: 4,
  },
  switchItemDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FB',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#3F4E6C',
    flex: 1,
    lineHeight: 20,
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