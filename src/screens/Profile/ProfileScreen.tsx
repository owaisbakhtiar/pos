import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "../../components/common";
import { colors, spacing } from "../../theme";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text variant="h1" style={styles.title}>
        Profile
      </Text>
      <Text variant="body" color="textSecondary" style={styles.subtitle}>
        Manage your account settings
      </Text>
      <Button
        title="Edit Profile"
        onPress={() => {}}
        variant="outline"
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
