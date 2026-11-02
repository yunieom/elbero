import { colors } from "./colors.ts";

export function readableTextColor(backgroundColor: string) {
  const darkContrast = contrastRatio(backgroundColor, colors.black);
  const lightContrast = contrastRatio(backgroundColor, colors.white);
  return darkContrast >= lightContrast ? colors.black : colors.white;
}

export function accessibleAccentColor(
  accentColor: string,
  backgroundColor = colors.surface,
) {
  const channels = hexChannels(accentColor);
  for (let step = 0; step <= 20; step += 1) {
    const factor = 1 - step * 0.04;
    const candidate = toHex(
      channels.map((channel) => Math.round(channel * factor)),
    );
    if (contrastRatio(candidate, backgroundColor) >= 4.5) return candidate;
  }
  return colors.textPrimary;
}

function contrastRatio(first: string, second: string) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(hex: string) {
  const channels = hexChannels(hex);
  const [red, green, blue] = channels.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function hexChannels(hex: string) {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((index) =>
    Number.parseInt(value.slice(index, index + 2), 16),
  );
}

function toHex(channels: number[]) {
  return `#${channels
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}
