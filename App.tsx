import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./src/navigation/BottomTabs";
import AuthStack from "./src/navigation/AuthStack";
import { View } from "react-native";
import { colors } from "./src/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import AuthService from "./src/services/AuthService";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = AuthService.isAuthenticated();
      setIsAuthenticated(authStatus);
    };
    
    checkAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <StatusBar style="dark" backgroundColor={colors.background} />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
              <Stack.Screen name="Main" component={BottomTabs} />
            ) : (
              <Stack.Screen name="Auth" component={AuthStack} />
            )}
          </Stack.Navigator>
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
