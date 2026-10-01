import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from "react-native";

import { colors, radius, spacing } from "@/shared/theme";

interface PrimaryButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  isLoading?: boolean;
}

export function PrimaryButton({
  label,
  isLoading = false,
  disabled,
  style,
  ...pressableProps
}: PrimaryButtonProps) {
  const isDisabled = disabled || isLoading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        typeof style === "function" ? style({ pressed }) : style,
      ]}
      {...pressableProps}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text maxFontSizeMultiplier={2} style={styles.label}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "700",
  },
  pressed: {
    backgroundColor: colors.primaryPressed,
  },
  disabled: {
    backgroundColor: "#B9C2D8",
  },
});
