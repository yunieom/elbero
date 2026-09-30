import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { JourneyStatus } from "@/entities/journey";
import { transitLines } from "@/entities/station/transit-lines";
import { colors, radius, spacing } from "@/shared/theme";
import { PrimaryButton, Screen } from "@/shared/ui";

import { GuidanceStepCard } from "../components/guidance-step-card";
import { JourneySummaryCard } from "../components/journey-summary-card";
import { JourneyStatusCard } from "../components/journey-status-card";
import { useJourneyPlan } from "../hooks/use-journey-plan";
import { journeyStatusPresentation } from "../model/journey-status";

interface JourneyResultScreenProps {
  originStationCode: string;
  destinationStationCode: string;
}

export function JourneyResultScreen({
  originStationCode,
  destinationStationCode,
}: JourneyResultScreenProps) {
  const router = useRouter();
  const { journey, isLoading, errorMessage, retry } = useJourneyPlan(
    originStationCode,
    destinationStationCode,
  );

  if (isLoading && !journey) {
    return (
      <Screen>
        <Header onBack={() => router.back()} />
        <View accessibilityLiveRegion="polite" style={styles.centerState}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingTitle}>승강기 상태를 확인하고 있어요</Text>
          <Text style={styles.loadingText}>
            안전한 차량·문과 이용 가능한 엘리베이터를 연결하는 중입니다.
          </Text>
        </View>
      </Screen>
    );
  }

  if (errorMessage || !journey) {
    return (
      <Screen>
        <Header onBack={() => router.back()} />
        <View accessibilityLiveRegion="assertive" style={styles.centerState}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>
          <Text accessibilityRole="header" style={styles.loadingTitle}>
            경로를 불러오지 못했어요
          </Text>
          <Text style={styles.loadingText}>
            {errorMessage ?? "잠시 후 다시 시도해 주세요."}
          </Text>
          <PrimaryButton
            label="다시 시도"
            onPress={retry}
            style={styles.retry}
          />
        </View>
      </Screen>
    );
  }

  const route = journey.route;
  const routeLines = route.summary.lineNames.map((lineName) =>
    transitLines.find((line) => line.name === lineName),
  );
  return (
    <Screen>
      <Header onBack={() => router.back()} />

      <View style={styles.routeTitleArea}>
        <View style={styles.lineBadges}>
          {route.summary.lineNames.map((lineName, index) => (
            <View
              key={lineName}
              style={[
                styles.lineBadge,
                { backgroundColor: routeLines[index]?.color ?? colors.primary },
              ]}
            >
              <Text style={styles.lineBadgeText}>
                {routeLines[index]?.badge ?? lineName}
              </Text>
            </View>
          ))}
        </View>
        <Text accessibilityRole="header" style={styles.routeTitle}>
          {journey.originName} → {journey.destinationName}
        </Text>
        <Text style={styles.routeSubtitle}>
          {route.transferStation
            ? `${route.transferStation} 환승 · ${route.summary.lineNames.join(" → ")}`
            : `환승 없는 ${route.summary.lineNames.join("·")} 경로`}
        </Text>
      </View>

      <JourneyStatusCard
        blockingReasons={route.blockingReasons}
        reason={journey.selectionReason}
        status={route.status}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>여정 요약</Text>
      </View>
      <JourneySummaryCard route={route} />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>이동 순서</Text>
        <Text style={styles.sectionCount}>{route.steps.length}단계</Text>
      </View>
      <View>
        {route.steps.map((step, index) => (
          <GuidanceStepCard
            isLast={index === route.steps.length - 1}
            key={step.id}
            step={step}
          />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>실시간 승강기 확인</Text>
      </View>
      <View style={styles.facilityCard}>
        {route.facilityGroups.map((group, index) => (
          <FacilityStatusRow
            isLast={index === route.facilityGroups.length - 1}
            key={group.id}
            label={group.label}
            status={group.status}
          />
        ))}
      </View>

      <View style={styles.dataCard}>
        <Text style={styles.dataTitle}>데이터 확인 정보</Text>
        <Text style={styles.dataText}>
          상태 확인 {formatDateTime(journey.statusCheckedAt)} · 최대{" "}
          {journey.maxSourceDelayMinutes}분 지연
        </Text>
        <Text style={styles.dataText}>경로 검증일 {journey.verifiedAt}</Text>
        <Text style={styles.dataNotice}>{journey.notice}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>다른 역으로 검색</Text>
      </Pressable>
    </Screen>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="역 선택으로 돌아가기"
        accessibilityRole="button"
        hitSlop={12}
        onPress={onBack}
        style={styles.backButton}
      >
        <Text style={styles.backIcon}>‹</Text>
      </Pressable>
      <Text style={styles.headerTitle}>안전 경로 안내</Text>
    </View>
  );
}

function FacilityStatusRow({
  label,
  status,
  isLast,
}: {
  label: string;
  status: JourneyStatus;
  isLast: boolean;
}) {
  const presentation = journeyStatusPresentation[status];
  return (
    <View
      accessibilityLabel={`${label}, ${presentation.label}`}
      style={[styles.facilityRow, !isLast && styles.facilityDivider]}
    >
      <View
        accessible={false}
        style={[styles.statusDot, { backgroundColor: presentation.color }]}
      />
      <Text style={styles.facilityLabel}>{label}</Text>
      <Text style={[styles.facilityStatus, { color: presentation.color }]}>
        {presentation.label}
      </Text>
    </View>
  );
}

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.xs,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backIcon: {
    color: colors.textPrimary,
    fontSize: 38,
    lineHeight: 38,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "800",
  },
  centerState: {
    flex: 1,
    minHeight: 520,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  loadingTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginTop: spacing.lg,
  },
  loadingText: {
    maxWidth: 340,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  errorIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
  },
  errorIconText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "900",
  },
  retry: {
    minWidth: 180,
    marginTop: spacing.xl,
  },
  routeTitleArea: {
    alignItems: "flex-start",
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  lineBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  lineBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  lineBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "800",
  },
  routeTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: -0.7,
    marginTop: spacing.sm,
  },
  routeSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
  },
  sectionCount: {
    color: colors.textSecondary,
    fontSize: 13,
    marginLeft: "auto",
  },
  facilityCard: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  facilityRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
  },
  facilityDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    marginRight: spacing.sm,
  },
  facilityLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    paddingRight: spacing.sm,
  },
  facilityStatus: {
    fontSize: 12,
    fontWeight: "800",
  },
  dataCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xxl,
    backgroundColor: colors.unknownSoft,
  },
  dataTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  dataText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 19,
  },
  dataNotice: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  secondaryButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});
