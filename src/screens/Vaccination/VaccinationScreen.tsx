import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../../components/common";
import { colors } from "../../theme";

export default function VaccinationScreen() {
  return (
    <View style={styles.container}>
      <Text variant="h1">Vaccination</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
});
