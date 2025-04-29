import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import BottomTabs from "./src/navigation/BottomTabs";
import { View, SafeAreaView } from "react-native";
import { colors } from "./src/theme";

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, paddingBottom: 0 }}>
          <StatusBar style="dark" backgroundColor={colors.background} />
          <BottomTabs />
        </View>
      </SafeAreaView>
    </NavigationContainer>
  );
}
