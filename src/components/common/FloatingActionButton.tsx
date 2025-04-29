import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";

interface FABProps {
  onPress: () => void;
  icon?: string;
  color?: string;
}

export const FloatingActionButton: React.FC<FABProps> = ({
  onPress,
  icon = "add",
  color = "#6C63FF",
}) => {
  return (
    <View style={styles.fabContainer}>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: color }]}
        onPress={onPress}
      >
        <Ionicons name={icon as any} size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    zIndex: 999,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
}); 