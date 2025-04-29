import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "../../components/common";
import { colors, spacing } from "../../theme";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text variant="h1" style={styles.title}>
        Welcome
      </Text>
      <Text variant="body" color="textSecondary" style={styles.subtitle}>
        This is your home screen
      </Text>
      <Button
        title="Get Started"
        onPress={() => {}}
        variant="primary"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: spacing.md,
  },
  subtitle: {
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  button: {
    width: "100%",
    maxWidth: 300,
  },
});
