import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./src/navigation/BottomTabs";
import AuthStack from "./src/navigation/AuthStack";
import { View, ActivityIndicator, Text } from "react-native";
import { colors } from "./src/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import Toast from 'react-native-toast-message';
import SettingsStack from "./src/navigation/SettingsStack";
import AnimalRecordsScreen from "./src/screens/AnimalRecords/AnimalRecordsScreen";
import ProfileStack from "./src/navigation/ProfileStack";
import AddAnimalScreen from "./src/screens/AnimalRecords/AddAnimalScreen";
import AnimalDetailScreen from "./src/screens/AnimalRecords/AnimalDetailScreen";
import EditAnimalScreen from "./src/screens/AnimalRecords/EditAnimalScreen";
import HealthRecordsScreen from "./src/screens/HealthRecords/HealthRecordsScreen";
import AddHealthRecordScreen from "./src/screens/HealthRecords/AddHealthRecordScreen";
import EditHealthRecordScreen from "./src/screens/HealthRecords/EditHealthRecordScreen";
import HealthRecordDetailScreen from "./src/screens/HealthRecords/HealthRecordDetailScreen";
import ManageVeterinariansScreen from "./src/screens/HealthRecords/ManageVeterinariansScreen";

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Create a placeholder component for screens that don't exist yet
  const PlaceholderScreen = ({ route }: any) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
        {route.name} Screen Coming Soon
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={BottomTabs} />
            <Stack.Screen name="Settings" component={SettingsStack} />
            <Stack.Screen name="AnimalRecords" component={AnimalRecordsScreen} />
            <Stack.Screen name="AddAnimal" component={AddAnimalScreen} />
            <Stack.Screen name="AnimalDetail" component={AnimalDetailScreen} />
            <Stack.Screen name="EditAnimal" component={EditAnimalScreen} />
            <Stack.Screen name="HealthRecords" component={HealthRecordsScreen} />
            <Stack.Screen name="AddHealthRecord" component={AddHealthRecordScreen} />
            <Stack.Screen name="EditHealthRecord" component={EditHealthRecordScreen} />
            <Stack.Screen name="HealthRecordDetail" component={HealthRecordDetailScreen} />
            <Stack.Screen name="ManageVeterinarians" component={ManageVeterinariansScreen} />
            <Stack.Screen name="ManageVaccines" component={PlaceholderScreen} />
            <Stack.Screen name="Profile" component={ProfileStack} />
            
            {/* Placeholder screens for side menu items */}
            <Stack.Screen name="Feed" component={PlaceholderScreen} />
            <Stack.Screen name="Vaccination" component={PlaceholderScreen} />
            <Stack.Screen name="Milk" component={PlaceholderScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
