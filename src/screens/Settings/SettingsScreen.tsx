import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextStyle,
  ViewStyle,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';

// Types for our settings data
interface FarmInformation {
  id: number;
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

interface UnitsMeasurements {
  weight_unit: string;
  volume_unit: string;
  area_unit: string;
  temperature_unit: string;
  currency: string;
  decimal_separator: string;
  thousand_separator: string;
}

interface RegionalSettings {
  language: string;
  timezone: string;
  date_format: string;
  time_format: string;
  first_day_of_week: number;
}

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
}

// Define the navigation param list
type SettingsStackParamList = {
  SettingsMain: undefined;
  EditFarmInfo: { farmInfo: FarmInformation };
  EditUnitsSettings: { unitsSettings: UnitsMeasurements };
  EditRegionalSettings: { regionalSettings: RegionalSettings };
  EditNotificationPrefs: { notificationPrefs: NotificationPreferences };
};

// Type the navigation prop
type SettingsScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [farmInfo, setFarmInfo] = useState<FarmInformation | null>(null);
  const [unitsSettings, setUnitsSettings] = useState<UnitsMeasurements | null>(null);
  const [regionalSettings, setRegionalSettings] = useState<RegionalSettings | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences | null>(null);
  const [activeTab, setActiveTab] = useState('farmInfo');
  const scrollViewRef = useRef<ScrollView>(null);
  const tabScrollViewRef = useRef<ScrollView>(null);

  // Fetch all settings on initial load
  useEffect(() => {
    fetchFarmInformation();
    fetchUnitsSettings();
    fetchRegionalSettings();
    fetchNotificationPreferences();
  }, []);

  // API calls to fetch settings data
  const fetchFarmInformation = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/v1/settings/general-settings/farm-information');
      if (response.data.success) {
        setFarmInfo(response.data.data);
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

  const fetchUnitsSettings = async () => {
    try {
      const response = await api.get('/v1/settings/general-settings/units-measurements');
      if (response.data.success) {
        setUnitsSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching units settings:', error);
    }
  };

  const fetchRegionalSettings = async () => {
    try {
      const response = await api.get('/v1/settings/general-settings/regional-settings');
      if (response.data.success) {
        setRegionalSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching regional settings:', error);
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      const response = await api.get('/v1/settings/general-settings/notification-preferences');
      if (response.data.success) {
        setNotificationPrefs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  };

  // Navigation functions to specific settings screens
  const navigateToEditFarmInfo = () => {
    if (farmInfo) {
      navigation.navigate('EditFarmInfo', { farmInfo });
    }
  };

  const navigateToEditUnitsSettings = () => {
    if (unitsSettings) {
      navigation.navigate('EditUnitsSettings', { unitsSettings });
    }
  };

  const navigateToEditRegionalSettings = () => {
    if (regionalSettings) {
      navigation.navigate('EditRegionalSettings', { regionalSettings });
    }
  };

  const navigateToEditNotificationPrefs = () => {
    if (notificationPrefs) {
      navigation.navigate('EditNotificationPrefs', { notificationPrefs });
    }
  };

  // Go back to previous screen
  const goBack = () => {
    navigation.dispatch(CommonActions.goBack());
  };

  // Function to handle tab change with scrolling
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    
    // Scroll to the top of the content
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
    }
  };

  // Function to determine tab text style
  const getTabTextStyle = (tabName: string): TextStyle => {
    return {
      ...styles.tabText,
      ...(activeTab === tabName ? styles.activeTabText : {}),
    };
  };
  
  // Get tab button style
  const getTabStyle = (tabName: string): ViewStyle => {
    return {
      ...styles.tab,
      ...(activeTab === tabName ? styles.activeTab : {}),
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginRight: 16,
    };
  };

  if (isLoading && !farmInfo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7367F0" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TouchableOpacity 
            onPress={goBack} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#3F4E6C" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>General Settings</Text>
            <Text style={styles.headerSubtitle} numberOfLines={2}>Manage your farm's basic settings and preferences</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.tabBarWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          ref={tabScrollViewRef}
          style={styles.tabScrollContainer}
          contentContainerStyle={styles.tabContentContainer}
        >
          <TouchableOpacity 
            style={getTabStyle('farmInfo')} 
            onPress={() => handleTabChange('farmInfo')}
          >
            <Text style={getTabTextStyle('farmInfo')}>
              Farm Information
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={getTabStyle('units')} 
            onPress={() => handleTabChange('units')}
          >
            <Text style={getTabTextStyle('units')}>
              Units & Measurements
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={getTabStyle('regional')} 
            onPress={() => handleTabChange('regional')}
          >
            <Text style={getTabTextStyle('regional')}>
              Regional Settings
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={getTabStyle('notifications')} 
            onPress={() => handleTabChange('notifications')}
          >
            <Text style={getTabTextStyle('notifications')}>
              Notification Preferences
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <ScrollView 
        style={styles.container}
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {activeTab === 'farmInfo' && (
          <View style={styles.section}>
            {farmInfo ? (
              <View style={styles.farmInfoContent}>
                <View style={styles.farmInfoRow}>
                  <Text style={styles.farmInfoLabel}>Name:</Text>
                  <Text style={styles.farmInfoValue}>{farmInfo.name}</Text>
                </View>
                <View style={styles.farmInfoRow}>
                  <Text style={styles.farmInfoLabel}>Address:</Text>
                  <Text style={styles.farmInfoValue}>{farmInfo.address || 'Not provided'}</Text>
                </View>
                <View style={styles.farmInfoRow}>
                  <Text style={styles.farmInfoLabel}>City:</Text>
                  <Text style={styles.farmInfoValue}>{farmInfo.city || 'Not provided'}</Text>
                </View>
                <View style={styles.farmInfoRow}>
                  <Text style={styles.farmInfoLabel}>Email:</Text>
                  <Text style={styles.farmInfoValue}>{farmInfo.email || 'Not provided'}</Text>
                </View>
                <View style={styles.farmInfoRow}>
                  <Text style={styles.farmInfoLabel}>Phone:</Text>
                  <Text style={styles.farmInfoValue}>{farmInfo.phone || 'Not provided'}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={navigateToEditFarmInfo}
                >
                  <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.editButtonText}>Update Farm Information</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.emptyText}>No farm information available. Please add your farm details.</Text>
            )}
          </View>
        )}

        {activeTab === 'units' && (
          <View style={styles.section}>
            {unitsSettings ? (
              <View style={styles.unitsContent}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Weight Unit:</Text>
                  <Text style={styles.settingValue}>{unitsSettings.weight_unit}</Text>
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Volume Unit:</Text>
                  <Text style={styles.settingValue}>{unitsSettings.volume_unit}</Text>
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Area Unit:</Text>
                  <Text style={styles.settingValue}>{unitsSettings.area_unit}</Text>
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Temperature Unit:</Text>
                  <Text style={styles.settingValue}>{unitsSettings.temperature_unit}</Text>
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Currency:</Text>
                  <Text style={styles.settingValue}>{unitsSettings.currency}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={navigateToEditUnitsSettings}
                >
                  <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.editButtonText}>Update Units & Measurements</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.emptyText}>No units configuration available.</Text>
            )}
          </View>
        )}

        {activeTab === 'regional' && (
          <View style={styles.section}>
            {regionalSettings ? (
              <View style={styles.regionalContent}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Language:</Text>
                  <Text style={styles.settingValue}>{regionalSettings.language}</Text>
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Timezone:</Text>
                  <Text style={styles.settingValue}>{regionalSettings.timezone}</Text>
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Date Format:</Text>
                  <Text style={styles.settingValue}>{regionalSettings.date_format}</Text>
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Time Format:</Text>
                  <Text style={styles.settingValue}>{regionalSettings.time_format}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={navigateToEditRegionalSettings}
                >
                  <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.editButtonText}>Update Regional Settings</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.emptyText}>No regional settings available.</Text>
            )}
          </View>
        )}

        {activeTab === 'notifications' && (
          <View style={styles.section}>
            {notificationPrefs ? (
              <View style={styles.notificationContent}>
                <View style={styles.notificationItem}>
                  <View style={styles.notificationDetails}>
                    <Ionicons 
                      name="mail-outline" 
                      size={20} 
                      color={notificationPrefs.email_notifications ? "#7367F0" : "#888"} 
                    />
                    <Text style={styles.notificationText}>Email Notifications</Text>
                  </View>
                  <View style={[
                    styles.statusBadge, 
                    notificationPrefs.email_notifications ? styles.enabledBadge : styles.disabledBadge
                  ]}>
                    <Text style={styles.statusText}>
                      {notificationPrefs.email_notifications ? "Enabled" : "Disabled"}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.notificationItem}>
                  <View style={styles.notificationDetails}>
                    <Ionicons 
                      name="notifications-outline" 
                      size={20} 
                      color={notificationPrefs.push_notifications ? "#7367F0" : "#888"} 
                    />
                    <Text style={styles.notificationText}>Push Notifications</Text>
                  </View>
                  <View style={[
                    styles.statusBadge, 
                    notificationPrefs.push_notifications ? styles.enabledBadge : styles.disabledBadge
                  ]}>
                    <Text style={styles.statusText}>
                      {notificationPrefs.push_notifications ? "Enabled" : "Disabled"}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.notificationItem}>
                  <View style={styles.notificationDetails}>
                    <Ionicons 
                      name="chatbubble-outline" 
                      size={20} 
                      color={notificationPrefs.sms_notifications ? "#7367F0" : "#888"} 
                    />
                    <Text style={styles.notificationText}>SMS Notifications</Text>
                  </View>
                  <View style={[
                    styles.statusBadge, 
                    notificationPrefs.sms_notifications ? styles.enabledBadge : styles.disabledBadge
                  ]}>
                    <Text style={styles.statusText}>
                      {notificationPrefs.sms_notifications ? "Enabled" : "Disabled"}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={navigateToEditNotificationPrefs}
                >
                  <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.editButtonText}>Update Notification Preferences</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.emptyText}>No notification preferences available.</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3F4E6C',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    flexWrap: 'wrap',
  },
  tabBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  tabScrollContainer: {
    backgroundColor: '#FFFFFF',
  },
  tabContentContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    height: 45,
    alignItems: 'center',
  },
  tab: {
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    height: '100%',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomColor: '#7367F0',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#7367F0',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollViewContent: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 16,
    marginBottom: 8, 
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  farmInfoContent: {
    marginBottom: 8,
  },
  farmInfoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexWrap: 'wrap',
  },
  farmInfoLabel: {
    width: 100,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  farmInfoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingRight: 8,
  },
  unitsContent: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexWrap: 'wrap',
  },
  settingLabel: {
    width: 130,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  settingValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    paddingLeft: 8,
  },
  regionalContent: {
    marginBottom: 16,
  },
  notificationContent: {
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexWrap: 'wrap',
  },
  notificationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  enabledBadge: {
    backgroundColor: '#E3F2FD',
  },
  disabledBadge: {
    backgroundColor: '#F5F5F5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7367F0',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    shadowColor: '#7367F0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
});

export default SettingsScreen; 