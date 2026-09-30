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
  const train = step.trainSegment;
  const isGapWarning = gap?.level === "yellow";
  const isGapDanger = gap?.level === "red";
  const isGapUnknown = Boolean(train) && !gap;
  const isExitPlatformElevator =
    access?.phase === "exit" && access.kind === "platform_elevator";
  const isPlatformElevator = access?.kind === "platform_elevator";
  const showLocation = Boolean(access?.location) && !isPlatformElevator;
  const showDirection = Boolean(access?.direction) && !isExitPlatformElevator;
  const displayInstruction = toDisplayInstruction(step);
  const boardingPosition = train?.boardingPosition
    ? `${train.boardingPosition.carNumber}-${train.boardingPosition.doorNumber}`
    : null;
  const accessLabel = access
    ? [
        access.fromFloor && access.toFloor
          ? `${access.fromFloor}에서 ${access.toFloor}`
          : null,
        showLocation ? access.location : null,
        showDirection && access.direction
          ? toAccessDirection(access.direction)
          : null,
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
        accessibilityLabel={`${step.order}단계, ${stepTypeLabels[step.type] ?? step.type}, ${step.stationName}, ${displayInstruction}${boardingPosition ? `, 빠른환승 ${boardingPosition}` : ""}${train?.direction ? `, ${toTerminalDirection(train.direction, train.lineName)}` : ""}${accessLabel ? `, ${accessLabel}` : ""}${gap ? `, 승강장 간격 ${gap.label}` : isGapUnknown ? ", 승강장 간격 미확인" : ""}`}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.typeLabel}>
            {stepTypeLabels[step.type] ?? step.type}
          </Text>
          <Text style={styles.stationName}>{step.stationName}</Text>
        </View>
        <Text style={styles.instruction}>{displayInstruction}</Text>
        {train ? (
          <View style={styles.trainDetails}>
            <Text style={styles.quickTransfer}>
              {boardingPosition
                ? `빠른환승 ${boardingPosition}`
                : "빠른환승 위치 미확인"}
            </Text>
            <Text style={styles.trainDirection}>
              {toTerminalDirection(train.direction, train.lineName)}
            </Text>
          </View>
        ) : null}
        {access ? (
          <View style={styles.accessDetails}>
            {access.fromFloor && access.toFloor ? (
              <DetailRow
                label="이동 층"
                value={`${access.fromFloor} → ${access.toFloor}`}
              />
            ) : null}
            {showLocation && access.location ? (
              <DetailRow label="위치" value={access.location} />
            ) : null}
            {showDirection && access.direction ? (
              <DetailRow
                label="방향"
                value={toAccessDirection(access.direction)}
              />
            ) : null}
          </View>
        ) : null}
        {gap || isGapUnknown ? (
          <View
            style={[
              styles.gapBadge,
              isGapUnknown
                ? styles.gapUnknown
                : isGapDanger
                  ? styles.gapDanger
                  : isGapWarning
                    ? styles.gapWarning
                    : styles.gapSafe,
            ]}
          >
            <Text
              style={[
                styles.gapText,
                isGapUnknown
                  ? styles.gapUnknownText
                  : isGapDanger
                    ? styles.gapDangerText
                    : isGapWarning
                      ? styles.gapWarningText
                      : styles.gapSafeText,
              ]}
            >
              {gap ? `승강장 간격 ${gap.label}` : "승강장 간격 미확인"}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function toAccessDirection(direction: string) {
  return direction.trim().replace(/\s*방면$/u, " 방향");
}

function toTerminalDirection(direction: string, lineName: string) {
  if (lineName === "2호선") return direction;
  if (direction === "하남검단산·마천 방면") {
    return "하남검단산·상일동행 / 마천행";
  }
  return direction.replace(/\s*방면$/u, "행");
}

function toDisplayInstruction(step: JourneyStep) {
  if (step.trainSegment) {
    return `${step.trainSegment.lineName} 열차를 타고 ${step.trainSegment.destinationStationName}까지 이동하세요.`;
  }
  if (
    step.stationAccess?.phase === "exit" &&
    step.stationAccess.kind === "platform_elevator"
  ) {
    return step.instruction
      .replace(/^하차 후\s*/u, "")
      .replace(/(\d+)호차\s*(\d+)번 문/gu, "$1-$2");
  }
  return step.instruction;
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
  trainDetails: {
    marginTop: spacing.sm,
    gap: spacing.xxs,
  },
  quickTransfer: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "800",
  },
  trainDirection: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
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
  gapDanger: {
    backgroundColor: colors.dangerSoft,
  },
  gapUnknown: {
    backgroundColor: colors.unknownSoft,
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
  gapDangerText: {
    color: colors.danger,
  },
  gapUnknownText: {
    color: colors.unknown,
  },
});
