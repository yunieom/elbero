import { StyleSheet, Text, View } from 'react-native';

import { transitLineById, type TransitLineId } from '@/entities/station';
import { colors, radius } from '@/shared/theme';

interface LineBadgeProps {
  lineId: TransitLineId;
  compact?: boolean;
}

export function LineBadge({ lineId, compact = false }: LineBadgeProps) {
  const line = transitLineById[lineId];
  return (
    <View
      accessibilityLabel={line.name}
      style={[
        styles.badge,
        compact && styles.compactBadge,
        { backgroundColor: line.color },
      ]}
    >
      <Text style={[styles.text, compact && styles.compactText]}>
        {line.badge}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  compactBadge: { width: 24, height: 24 },
  text: { color: colors.white, fontSize: 13, fontWeight: '900' },
  compactText: { fontSize: 11 },
});
