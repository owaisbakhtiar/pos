import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/Home/HomeScreen";
import RegisterStack from "./RegisterStack";
import { colors } from "../theme";
import { useAuth } from "../context/AuthContext";

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Get only the Register route
  const registerRoute = state.routes.find(route => route.name === "Register");
  
  if (!registerRoute) return null;
  
  const registerOptions = descriptors[registerRoute.key].options;
  
  const onPress = () => {
    const event = navigation.emit({
      type: "tabPress",
      target: registerRoute.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(registerRoute.name);
    }
  };

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.centerButtonContainer}>
        <TouchableOpacity
          onPress={onPress}
          style={styles.centerButton}
        >
          <View style={styles.addButton}>
            <Ionicons name="add" size={32} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function BottomTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ 
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen 
        name="Register" 
        component={RegisterStack} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 16,
  },
  centerButtonContainer: {
    alignItems: 'center',
  },
  centerButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    backgroundColor: "#7367F0",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7367F0",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
