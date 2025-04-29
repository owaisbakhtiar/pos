import React from "react";
import { Text as RNText, StyleSheet, TextStyle } from "react-native";
import { colors, typography } from "../../theme";

interface TextProps {
  children: React.ReactNode;
  variant?: keyof typeof typography;
  color?: keyof typeof colors;
  style?: TextStyle;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = "body",
  color = "text",
  style,
}) => {
  return (
    <RNText style={[typography[variant], { color: colors[color] }, style]}>
      {children}
    </RNText>
  );
};
