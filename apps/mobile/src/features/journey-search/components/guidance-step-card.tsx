import { StyleSheet, Text, View } from "react-native";

import type { JourneyStep } from "@/entities/journey";
import { colors, radius, spacing } from "@/shared/theme";

const stepTypeLabels: Record<string, string> = {
  entry: "역 진입",
  gate: "개찰구",
  elevator: "엘리베이터",
  train: "열차 이동",
  transfer: "환승",
  exit: "역 퇴장",
};

interface GuidanceStepCardProps {
  step: JourneyStep;
  isLast: boolean;
}

export function GuidanceStepCard({ step, isLast }: GuidanceStepCardProps) {
  const gap = step.platformGap;
  const access = step.stationAccess;
  const isGapWarning = gap?.level === "yellow";
  const accessLabel = access
    ? [
        access.fromFloor && access.toFloor
          ? `${access.fromFloor}에서 ${access.toFloor}`
          : null,
        access.location,
        access.direction,
      ]
        .filter(Boolean)
        .join(", ")
    : "";
  return (
    <View style={styles.row}>
      <View style={styles.timeline} accessible={false}>
        <View style={styles.numberCircle}>
          <Text style={styles.number}>{step.order}</Text>
        </View>
        {!isLast ? <View style={styles.line} /> : null}
      </View>
      <View
        accessibilityLabel={`${step.order}단계, ${stepTypeLabels[step.type] ?? step.type}, ${step.stationName}, ${step.instruction}${accessLabel ? `, ${accessLabel}` : ""}${gap ? `, 승강장 간격 ${gap.label}` : ""}`}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.typeLabel}>
            {stepTypeLabels[step.type] ?? step.type}
          </Text>
          <Text style={styles.stationName}>{step.stationName}</Text>
        </View>
        <Text style={styles.instruction}>{step.instruction}</Text>
        {access ? (
          <View style={styles.accessDetails}>
            {access.fromFloor && access.toFloor ? (
              <DetailRow
                label="이동 층"
                value={`${access.fromFloor} → ${access.toFloor}`}
              />
            ) : null}
            {access.location ? (
              <DetailRow label="위치" value={access.location} />
            ) : null}
            {access.direction ? (
              <DetailRow label="방향" value={access.direction} />
            ) : null}
            <View style={styles.verificationBlock}>
              {access.facilityIds.length > 0 ? (
                <Text style={styles.verificationText}>
                  시설 {access.facilityIds.join(", ")}
                </Text>
              ) : null}
              <Text style={styles.verificationText}>{access.source}</Text>
              <Text style={styles.verificationText}>
                {access.verifiedAt} 확인
              </Text>
            </View>
          </View>
        ) : null}
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
              승강장 간격 {gap.label}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  timeline: {
    width: 52,
    alignItems: "center",
  },
  numberCircle: {
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    zIndex: 1,
  },
  number: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 32,
    backgroundColor: colors.border,
  },
  card: {
    flex: 1,
    minWidth: 0,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  typeLabel: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    backgroundColor: colors.primarySoft,
    overflow: "hidden",
  },
  stationName: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  instruction: {
    color: colors.textPrimary,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: "700",
  },
  accessDetails: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  detailLabel: {
    minWidth: 52,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  detailValue: {
    flex: 1,
    minWidth: 140,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  verificationBlock: {
    marginTop: spacing.xs,
  },
  verificationText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
  },
  gapBadge: {
    alignSelf: "flex-start",
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
    fontWeight: "800",
  },
  gapSafeText: {
    color: colors.success,
  },
  gapWarningText: {
    color: colors.warning,
  },
});
