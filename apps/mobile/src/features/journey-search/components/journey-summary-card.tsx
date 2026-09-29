import { StyleSheet, Text, View } from "react-native";

import type { JourneyRoute } from "@/entities/journey";
import { colors, radius, spacing } from "@/shared/theme";

export function JourneySummaryCard({ route }: { route: JourneyRoute }) {
  const { summary, trainSegments } = route;
  const accessibilityLabel = [
    `이용 노선 ${summary.lineNames.join(", ")}`,
    `방향 ${summary.directions.join(", ")}`,
    `환승 ${summary.transferCount}회`,
    `엘리베이터 ${summary.elevatorCount}회`,
    ...trainSegments.map(
      (segment) =>
        `${segment.originStationName}에서 ${segment.destinationStationName}, ${formatPosition(segment.boardingPosition)}`,
    ),
  ].join(". ");

  return (
    <View accessibilityLabel={accessibilityLabel} style={styles.card}>
      <View style={styles.metrics}>
        <SummaryMetric label="노선" value={summary.lineNames.join(" · ")} />
        <SummaryMetric label="환승" value={`${summary.transferCount}회`} />
        <SummaryMetric
          label="엘리베이터"
          value={`${summary.elevatorCount}회`}
        />
      </View>
      <Text style={styles.direction}>{summary.directions.join(" · ")}</Text>
      {trainSegments.map((segment) => (
        <View
          key={`${segment.order}-${segment.lineName}`}
          style={styles.segment}
        >
          <Text style={styles.segmentTitle}>
            {segment.lineName} · {segment.originStationName} →{" "}
            {segment.destinationStationName}
          </Text>
          <Text style={styles.segmentPosition}>
            {segment.positionBasis === "destination_elevator"
              ? `승차·하차 ${formatPosition(segment.boardingPosition)}`
              : "승차·하차 위치 미확인"}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function formatPosition(
  position: { carNumber: number; doorNumber: number } | null,
) {
  return position
    ? `${position.carNumber}호차 ${position.doorNumber}번 문`
    : "위치 미확인";
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
    marginTop: spacing.xxs,
  },
  direction: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
    marginTop: spacing.md,
  },
  segment: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  segmentTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  segmentPosition: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xxs,
  },
});
