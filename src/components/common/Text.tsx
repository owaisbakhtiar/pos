import React from "react";
import { Text as RNText, StyleSheet, TextStyle, TextProps as RNTextProps } from "react-native";
import { colors, typography } from "../../theme";

interface TextProps extends Omit<RNTextProps, 'style'> {
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
  ...rest
}) => {
  return (
    <RNText 
      style={[typography[variant], { color: colors[color] }, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
};
