import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CalfRegisterScreen from "../screens/CalfRegister/CalfRegisterScreen";
import AnimalListScreen from "../screens/AnimalList/AnimalListScreen";

const Stack = createNativeStackNavigator();

export default function RegisterStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="CalfRegister"
        component={CalfRegisterScreen}
      />
      <Stack.Screen
        name="AnimalList"
        component={AnimalListScreen}
      />
    </Stack.Navigator>
  );
} 