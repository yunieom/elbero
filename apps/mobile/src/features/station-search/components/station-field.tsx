import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import type { Station } from '@/entities/station';

import { LineBadge } from './line-badge';

interface StationFieldProps {
  label: string;
  markerColor: string;
  station: Station | null;
  onPress: () => void;
}

export function StationField({
  label,
  markerColor,
  station,
  onPress,
}: StationFieldProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} 선택, ${station?.stationName ?? '선택되지 않음'}`}
      onPress={onPress}
      style={({ pressed }) => [styles.field, pressed && styles.pressed]}
    >
      <View style={[styles.marker, { backgroundColor: markerColor }]} />
      <View style={styles.textArea}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, !station && styles.placeholder]}>
          {station?.stationName ?? '역을 선택해 주세요'}
        </Text>
      </View>
      {station ? (
        <LineBadge lineId={station.lineId} />
      ) : (
        <Text aria-hidden style={styles.chevron}>
          ›
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  pressed: {
    backgroundColor: colors.primarySoft,
  },
  marker: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    marginRight: spacing.md,
  },
  textArea: {
    flex: 1,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    color: colors.textMuted,
    fontWeight: '500',
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 28,
  },
});
