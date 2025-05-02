import React from "react";
import { View } from "react-native";
import { Text } from "../../common";
import { styles } from "./styles";

interface FertilityStatusProps {
  label: string;
  count: number;
}

const FertilityStatus: React.FC<FertilityStatusProps> = ({ label, count }) => (
  <View style={styles.fertilityStatusContainer}>
    <View style={styles.countCircle}>
      <Text style={styles.countText}>{count}</Text>
    </View>
    <Text style={styles.statusLabel}>{label}</Text>
  </View>
);

export default FertilityStatus;
