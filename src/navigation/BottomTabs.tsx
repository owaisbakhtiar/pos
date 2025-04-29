import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/Home/HomeScreen";
import FeedCalculatorScreen from "../screens/FeedCalculator/FeedCalculatorScreen";
import InseminationScreen from "../screens/Insemination/InseminationScreen";
import VaccinationScreen from "../screens/Vaccination/VaccinationScreen";
import MilkRecordScreen from "../screens/MilkRecord/MilkRecordScreen";
import AnimalListScreen from "../screens/AnimalList/AnimalListScreen";
import AnimalRecordsScreen from "../screens/AnimalRecords/AnimalRecordsScreen";
import RegisterStack from "./RegisterStack";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Create center add button for Register tab
          if (route.name === "Register") {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.centerButton}
              >
                <View style={styles.addButton}>
                  <Ionicons name="add" size={32} color="white" />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tab, isFocused && styles.tabFocused]}
            >
              {options.tabBarIcon &&
                options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? "#7367F0" : colors.textSecondary,
                  size: 24,
                })}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function BottomTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            case "Feed":
              iconName = "nutrition-outline";
              break;
            case "Register":
              iconName = "add";
              break;
            case "Vaccination":
              iconName = "medkit-outline";
              break;
            case "Milk":
              iconName = "help-circle-outline";
              break;
            case "AnimalList":
              iconName = "list-outline";
              break;
            case "AnimalRecords":
              iconName = "paw-outline";
              break;
            default:
              iconName = "help-circle-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Feed" component={FeedCalculatorScreen} />
      <Tab.Screen name="Register" component={RegisterStack} />
      <Tab.Screen name="AnimalList" component={AnimalListScreen} />
      <Tab.Screen name="AnimalRecords" component={AnimalRecordsScreen} />
      <Tab.Screen name="Vaccination" component={VaccinationScreen} />
      <Tab.Screen name="Milk" component={MilkRecordScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 30,
    height: 60,
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  tabFocused: {
    borderRadius: 20,
  },
  centerButton: {
    flex: 1,
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
    marginBottom: 24,
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
