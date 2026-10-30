import { useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { JourneyStatus, JourneyStep } from "@/entities/journey";
import { JourneyReportModal } from "@/features/journey-report";
import { transitLines } from "@/entities/station/transit-lines";
import { colors, radius, readableTextColor, spacing } from "@/shared/theme";
import { PrimaryButton, Screen } from "@/shared/ui";

import { GuidanceStepCard } from "../components/guidance-step-card";
import { JourneySummaryCard } from "../components/journey-summary-card";
import { JourneyStatusCard } from "../components/journey-status-card";
import { useJourneyPlan } from "../hooks/use-journey-plan";
import { presentJourneyError } from "../model/journey-error";
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
  const [reportStep, setReportStep] = useState<JourneyStep | null>(null);
  const {
    journey,
    isLoading,
    error,
    currentStepOrder,
    savedAt,
    recoveryMode,
    storageNotice,
    retry,
    setCurrentStepOrder,
  } = useJourneyPlan(originStationCode, destinationStationCode);
  const returnToStationSearch = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  };

  if (isLoading && !journey) {
    return (
      <Screen>
        <Header onBack={returnToStationSearch} />
        <View accessibilityLiveRegion="polite" style={styles.centerState}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text maxFontSizeMultiplier={1.6} style={styles.loadingTitle}>
            승강기 상태를 확인하고 있어요
          </Text>
          <Text maxFontSizeMultiplier={2} style={styles.loadingText}>
            승강장 간격과 이용 가능한 엘리베이터를 연결하는 중입니다.
          </Text>
        </View>
      </Screen>
    );
  }

  if (error || !journey) {
    const presentation = presentJourneyError(error);
    return (
      <Screen>
        <Header onBack={returnToStationSearch} />
        <View accessibilityLiveRegion="assertive" style={styles.centerState}>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.errorIcon}
          >
            <Text allowFontScaling={false} style={styles.errorIconText}>
              !
            </Text>
          </View>
          <Text
            accessibilityRole="header"
            maxFontSizeMultiplier={1.6}
            style={styles.loadingTitle}
          >
            {presentation.title}
          </Text>
          <Text maxFontSizeMultiplier={2} style={styles.loadingText}>
            {presentation.description}
          </Text>
          <PrimaryButton
            label={presentation.actionLabel}
            onPress={
              presentation.action === "retry" ? retry : returnToStationSearch
            }
            style={styles.retry}
          />
        </View>
      </Screen>
    );
  }

  const route = journey.route;
  const currentStepIndex = Math.max(
    0,
    route.steps.findIndex((step) => step.order === currentStepOrder),
  );
  const previousStep = route.steps[currentStepIndex - 1] ?? null;
  const nextStep = route.steps[currentStepIndex + 1] ?? null;
  const sources = formatSources(
    route.steps.map((step) => step.stationAccess?.source),
  );
  const routeLines = route.summary.lineNames.map((lineName) =>
    transitLines.find((line) => line.name === lineName),
  );
  return (
    <Screen>
      <Header onBack={returnToStationSearch} />

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
              <Text
                style={[
                  styles.lineBadgeText,
                  {
                    color: readableTextColor(
                      routeLines[index]?.color ?? colors.primary,
                    ),
                  },
                ]}
              >
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

      {recoveryMode !== "live" || isLoading ? (
        <View
          accessibilityLiveRegion="polite"
          style={[
            styles.recoveryBanner,
            recoveryMode === "offline" || recoveryMode === "stale"
              ? styles.recoveryBannerWarning
              : null,
          ]}
        >
          <Text maxFontSizeMultiplier={2} style={styles.recoveryTitle}>
            {recoveryMode === "offline"
              ? "오프라인 저장 여정"
              : recoveryMode === "stale"
                ? "저장된 안내 · 시설 상태 재확인 필요"
                : "저장된 여정 복구 완료"}
          </Text>
          <Text maxFontSizeMultiplier={2} style={styles.recoveryText}>
            {recoveryMode === "offline" || recoveryMode === "stale"
              ? "이동 순서는 계속 볼 수 있지만 승강기 상태는 저장 시점 정보입니다."
              : "저장한 단계부터 이어서 보여드리며 최신 상태를 확인하고 있습니다."}
          </Text>
        </View>
      ) : null}

      {storageNotice ? (
        <Text accessibilityLiveRegion="polite" style={styles.storageNotice}>
          {storageNotice}
        </Text>
      ) : null}

      <JourneyStatusCard
        blockingReasons={[
          ...route.blockingReasons,
          ...(journey.warnings ?? []).map((warning) => warning.message),
        ]}
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
            isCurrent={step.order === currentStepOrder}
            isLast={index === route.steps.length - 1}
            key={step.id}
            onReport={() => setReportStep(step)}
            positionLabel={
              route.steps[index + 1]?.type === "transfer"
                ? "빠른환승"
                : "빠른하차"
            }
            step={step}
          />
        ))}
      </View>

      <View
        accessibilityLabel={`현재 ${currentStepOrder}단계, 전체 ${route.steps.length}단계`}
        style={styles.stepControls}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !previousStep }}
          disabled={!previousStep}
          onPress={() =>
            previousStep && void setCurrentStepOrder(previousStep.order)
          }
          style={[
            styles.stepButton,
            !previousStep && styles.stepButtonDisabled,
          ]}
        >
          <Text maxFontSizeMultiplier={2} style={styles.stepButtonText}>
            이전 단계
          </Text>
        </Pressable>
        <Text maxFontSizeMultiplier={2} style={styles.stepPosition}>
          {currentStepIndex + 1} / {route.steps.length}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !nextStep }}
          disabled={!nextStep}
          onPress={() => nextStep && void setCurrentStepOrder(nextStep.order)}
          style={[styles.stepButton, !nextStep && styles.stepButtonDisabled]}
        >
          <Text maxFontSizeMultiplier={2} style={styles.stepButtonText}>
            다음 단계
          </Text>
        </Pressable>
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
        <Text style={styles.dataText}>정보 출처 {sources}</Text>
        {savedAt ? (
          <Text style={styles.dataText}>
            여정 저장 {formatDateTime(savedAt)}
          </Text>
        ) : null}
        <Text style={styles.dataNotice}>{journey.notice}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={returnToStationSearch}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>다른 역으로 검색</Text>
      </Pressable>

      <JourneyReportModal
        journey={journey}
        onClose={() => setReportStep(null)}
        step={reportStep}
      />
    </Screen>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessible
        accessibilityLabel="역 선택으로 돌아가기"
        accessibilityRole="button"
        hitSlop={12}
        onPress={onBack}
        style={styles.backButton}
      >
        <Text allowFontScaling={false} style={styles.backIcon}>
          ‹
        </Text>
      </Pressable>
      <Text maxFontSizeMultiplier={2} style={styles.headerTitle}>
        엘리베이터 경로 안내
      </Text>
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
      accessible
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

function formatSources(sources: Array<string | undefined>) {
  const labels = sources
    .filter((source): source is string => Boolean(source))
    .map((source) => {
      if (source === "SeoulMetroFaciInfo") return "서울교통공사";
      if (source === "manual_verification") return "사용자·현장 검증";
      if (source === "unverified") return "미확인";
      if (
        source === "stationElevatorCarNumber" ||
        source === "stationPlatformTrainDistance"
      ) {
        return "국가철도공단(KRIC)";
      }
      return "공공데이터·검증 자료";
    });
  return [...new Set(labels)].join(" · ") || "확인 중";
}

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
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
    flexShrink: 1,
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
    maxWidth: "100%",
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginTop: spacing.lg,
    textAlign: "center",
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
  recoveryBanner: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.primarySoft,
  },
  recoveryBannerWarning: {
    borderColor: colors.warning,
    backgroundColor: colors.warningSoft,
  },
  recoveryTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  recoveryText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.xxs,
  },
  storageNotice: {
    color: colors.warning,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.md,
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
  stepControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  stepButton: {
    minHeight: 48,
    minWidth: 112,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  stepButtonDisabled: {
    borderColor: colors.border,
    opacity: 0.45,
  },
  stepButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  stepPosition: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
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
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
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
    minWidth: 160,
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
