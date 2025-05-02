import React from "react";
import { View } from "react-native";
import { Text } from "../../common";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";

interface StatsCardProps {
  title: string;
  value: string;
  bgColor: string;
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  bgColor,
  icon,
}) => (
  <View style={[styles.statsCard, { backgroundColor: bgColor }]}>
    <View style={styles.statsTextContainer}>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
    <View style={styles.iconCircle}>{icon}</View>
  </View>
);

export default StatsCard;
