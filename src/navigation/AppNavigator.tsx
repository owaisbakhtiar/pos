import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import HealthRecordsScreen from '../screens/HealthRecords/HealthRecordsScreen';
import AddHealthRecordScreen from '../screens/HealthRecords/AddHealthRecordScreen';
import EditHealthRecordScreen from '../screens/HealthRecords/EditHealthRecordScreen';
import HealthRecordDetailScreen from '../screens/HealthRecords/HealthRecordDetailScreen';
import ManageVeterinariansScreen from '../screens/HealthRecords/ManageVeterinariansScreen';
import ManageVaccinesScreen from '../screens/HealthRecords/ManageVaccinesScreen';

// Define stack navigator types
export type RootStackParamList = {
  Home: undefined;
  HealthRecords: undefined;
  AddHealthRecord: undefined;
  EditHealthRecord: { recordId: number };
  HealthRecordDetail: { recordId: number };
  ManageVeterinarians: undefined;
  ManageVaccines: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="HealthRecords" component={HealthRecordsScreen} />
        <Stack.Screen name="AddHealthRecord" component={AddHealthRecordScreen} />
        <Stack.Screen name="EditHealthRecord" component={EditHealthRecordScreen} />
        <Stack.Screen name="HealthRecordDetail" component={HealthRecordDetailScreen} />
        <Stack.Screen name="ManageVeterinarians" component={ManageVeterinariansScreen} />
        <Stack.Screen name="ManageVaccines" component={ManageVaccinesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 