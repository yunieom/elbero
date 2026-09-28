import { StyleSheet, Text, View } from 'react-native';

import type { JourneyStep } from '@/entities/journey';
import { colors, radius, spacing } from '@/shared/theme';

const stepTypeLabels: Record<string, string> = {
  entry: '역 진입',
  gate: '개찰구',
  elevator: '엘리베이터',
  train: '열차 이동',
  transfer: '환승',
  exit: '역 퇴장',
  safety: '안전 안내',
};

interface GuidanceStepCardProps {
  step: JourneyStep;
  isLast: boolean;
}

export function GuidanceStepCard({ step, isLast }: GuidanceStepCardProps) {
  const gap = step.platformGap;
  const isGapWarning = gap?.level === 'yellow';
  return (
    <View style={styles.row}>
      <View style={styles.timeline} accessible={false}>
        <View style={styles.numberCircle}>
          <Text style={styles.number}>{step.order}</Text>
        </View>
        {!isLast ? <View style={styles.line} /> : null}
      </View>
      <View
        accessibilityLabel={`${step.order}단계, ${stepTypeLabels[step.type] ?? step.type}, ${step.stationName}, ${step.instruction}${gap ? `, 승강장 간격 ${gap.distanceCm}센티미터 ${gap.label}` : ''}`}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.typeLabel}>
            {stepTypeLabels[step.type] ?? step.type}
          </Text>
          <Text style={styles.stationName}>{step.stationName}</Text>
        </View>
        <Text style={styles.instruction}>{step.instruction}</Text>
        {gap ? (
          <View
            style={[
              styles.gapBadge,
              isGapWarning ? styles.gapWarning : styles.gapSafe,
            ]}
          >
            <Text
              style={[
                styles.gapText,
                isGapWarning ? styles.gapWarningText : styles.gapSafeText,
              ]}
            >
              {isGapWarning ? '주의' : '안전'} · 승강장 간격 {gap.distanceCm}cm
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  timeline: {
    width: 42,
    alignItems: 'center',
  },
  numberCircle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    zIndex: 1,
  },
  number: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 32,
    backgroundColor: colors.border,
  },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeLabel: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: colors.primarySoft,
    overflow: 'hidden',
  },
  stationName: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  instruction: {
    color: colors.textPrimary,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '700',
  },
  gapBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginTop: spacing.sm,
  },
  gapSafe: {
    backgroundColor: colors.successSoft,
  },
  gapWarning: {
    backgroundColor: colors.warningSoft,
  },
  gapText: {
    fontSize: 12,
    fontWeight: '800',
  },
  gapSafeText: {
    color: colors.success,
  },
  gapWarningText: {
    color: colors.warning,
  },
});
