import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "../screens/Settings/SettingsScreen";
import EditFarmInfoScreen from "../screens/Settings/EditFarmInfoScreen";
import EditUnitsMeasurementsScreen from "../screens/Settings/EditUnitsMeasurementsScreen";
import EditRegionalSettingsScreen from "../screens/Settings/EditRegionalSettingsScreen";
import EditNotificationPrefsScreen from "../screens/Settings/EditNotificationPrefsScreen";

const Stack = createNativeStackNavigator();

export default function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
      />
      <Stack.Screen
        name="EditFarmInfo"
        component={EditFarmInfoScreen}
      />
      <Stack.Screen
        name="EditUnitsSettings"
        component={EditUnitsMeasurementsScreen}
      />
      <Stack.Screen
        name="EditRegionalSettings"
        component={EditRegionalSettingsScreen}
      />
      <Stack.Screen
        name="EditNotificationPrefs"
        component={EditNotificationPrefsScreen}
      />
    </Stack.Navigator>
  );
} 