import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors, spacing, typography } from "../../theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  style,
  textStyle,
  disabled = false,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return disabled ? [styles.primaryButton, styles.disabledButton] : styles.primaryButton;
      case "secondary":
        return disabled ? [styles.secondaryButton, styles.disabledButton] : styles.secondaryButton;
      case "outline":
        return disabled ? [styles.outlineButton, styles.disabledOutlineButton] : styles.outlineButton;
      default:
        return disabled ? [styles.primaryButton, styles.disabledButton] : styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    if (disabled) {
      return styles.disabledText;
    }
    
    switch (variant) {
      case "outline":
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, getTextStyle(), textStyle]} numberOfLines={1} adjustsFontSizeToFit={true} minimumFontScale={0.7}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: '#7367F0',
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: '#7367F0',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  disabledOutlineButton: {
    borderColor: '#CCCCCC',
  },
  text: {
    ...typography.body,
    fontWeight: "600",
    fontSize: 15,
    textAlign: 'center',
  },
  primaryText: {
    color: 'white',
  },
  outlineText: {
    color: '#7367F0',
  },
  disabledText: {
    color: '#999999',
  },
});
