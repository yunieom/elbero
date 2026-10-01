import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { JourneyPlan, JourneyStep } from "@/entities/journey";
import { reportEmail } from "@/shared/config/report-email";
import { colors, radius, spacing } from "@/shared/theme";
import { PrimaryButton } from "@/shared/ui";

import {
  buildJourneyReportMail,
  journeyReportTypes,
  type JourneyReportType,
} from "../model/journey-report";
import { deliverJourneyReport } from "../service/journey-report-delivery";

interface JourneyReportModalProps {
  journey: JourneyPlan;
  step: JourneyStep | null;
  onClose: () => void;
}

export function JourneyReportModal({
  journey,
  step,
  onClose,
}: JourneyReportModalProps) {
  const [reportType, setReportType] =
    useState<JourneyReportType>("wrong_route");
  const [description, setDescription] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  useEffect(() => {
    setReportType("wrong_route");
    setDescription("");
    setIsReviewing(false);
    setIsSending(false);
    setResultMessage(null);
  }, [step?.id]);

  const mail = useMemo(
    () =>
      step
        ? buildJourneyReportMail({
            recipient: reportEmail,
            type: reportType,
            description,
            journey,
            step,
          })
        : null,
    [description, journey, reportType, step],
  );

  if (!step) return null;

  const selectedTypeLabel =
    journeyReportTypes.find((item) => item.value === reportType)?.label ??
    "기타";
  const facilityIds = step.stationAccess?.facilityIds ?? [];

  async function handleDeliver() {
    if (!mail) return;
    setIsSending(true);
    setResultMessage(null);
    try {
      const result = await deliverJourneyReport(mail);
      setResultMessage(
        result === "mail_opened"
          ? "메일 작성 앱을 열었습니다. 내용을 확인한 뒤 직접 보내 주세요."
          : reportEmail
            ? "메일 앱을 열 수 없어 받는 주소와 제보 내용을 복사했습니다."
            : "제보 이메일이 아직 설정되지 않아 제목과 내용을 복사했습니다.",
      );
    } catch {
      setResultMessage(
        "제보 내용을 복사하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      visible
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          <View style={styles.header}>
            <Text
              accessibilityRole="header"
              maxFontSizeMultiplier={2}
              style={styles.headerTitle}
            >
              안내 정보 제보
            </Text>
            <Pressable
              accessibilityLabel="제보 화면 닫기"
              accessibilityRole="button"
              hitSlop={12}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text allowFontScaling={false} style={styles.closeText}>
                ×
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {!isReviewing ? (
              <>
                <Text maxFontSizeMultiplier={2} style={styles.description}>
                  잘못된 동선이나 시설 정보를 알려주세요. 현재 위치와 이동
                  이력은 수집하지 않습니다.
                </Text>

                <View style={styles.contextCard}>
                  <Text maxFontSizeMultiplier={2} style={styles.contextTitle}>
                    {step.order}단계 · {step.stationName}
                  </Text>
                  <Text maxFontSizeMultiplier={2} style={styles.contextText}>
                    {step.instruction}
                  </Text>
                </View>

                <Text maxFontSizeMultiplier={2} style={styles.fieldLabel}>
                  어떤 정보가 잘못됐나요?
                </Text>
                <View accessibilityRole="radiogroup" style={styles.typeList}>
                  {journeyReportTypes.map((item) => {
                    const selected = item.value === reportType;
                    return (
                      <Pressable
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        key={item.value}
                        onPress={() => setReportType(item.value)}
                        style={[
                          styles.typeButton,
                          selected && styles.typeButtonSelected,
                        ]}
                      >
                        <View
                          accessible={false}
                          style={[
                            styles.radio,
                            selected && styles.radioSelected,
                          ]}
                        />
                        <Text
                          maxFontSizeMultiplier={2}
                          style={[
                            styles.typeText,
                            selected && styles.typeTextSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text maxFontSizeMultiplier={2} style={styles.fieldLabel}>
                  자세한 설명
                </Text>
                <TextInput
                  accessibilityLabel="오류에 대한 자세한 설명"
                  maxFontSizeMultiplier={2}
                  multiline
                  onChangeText={setDescription}
                  placeholder="예: 실제 엘리베이터는 2번 출구 쪽에 있습니다."
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  textAlignVertical="top"
                  value={description}
                />

                <PrimaryButton
                  disabled={!description.trim()}
                  label="포함할 정보 확인"
                  onPress={() => setIsReviewing(true)}
                />
              </>
            ) : (
              <>
                <Text maxFontSizeMultiplier={2} style={styles.description}>
                  아래 정보가 메일에 포함됩니다. 확인 후 메일 작성 앱을 열어
                  직접 보내 주세요.
                </Text>

                <View style={styles.reviewCard}>
                  <ReviewRow label="오류 유형" value={selectedTypeLabel} />
                  <ReviewRow
                    label="여정"
                    value={`${journey.originName} → ${journey.destinationName}`}
                  />
                  <ReviewRow label="여정 ID" value={journey.journeyId} />
                  <ReviewRow label="데이터 버전" value={journey.dataVersion} />
                  <ReviewRow
                    label="단계"
                    value={`${step.order} · ${step.stationName}`}
                  />
                  <ReviewRow
                    label="시설 ID"
                    value={facilityIds.length ? facilityIds.join(", ") : "없음"}
                  />
                  <ReviewRow label="설명" value={description.trim()} />
                  <ReviewRow
                    label="받는 주소"
                    value={reportEmail || "환경변수 설정 필요"}
                  />
                </View>

                <View style={styles.privacyCard}>
                  <Text maxFontSizeMultiplier={2} style={styles.privacyText}>
                    현재 위치, GPS 좌표, 이전 이동 이력은 포함하지 않습니다.
                  </Text>
                </View>

                {resultMessage ? (
                  <Text
                    accessibilityLiveRegion="assertive"
                    maxFontSizeMultiplier={2}
                    style={styles.resultMessage}
                  >
                    {resultMessage}
                  </Text>
                ) : null}

                <PrimaryButton
                  isLoading={isSending}
                  label={reportEmail ? "메일 작성 앱 열기" : "제보 내용 복사"}
                  onPress={() => void handleDeliver()}
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setIsReviewing(false);
                    setResultMessage(null);
                  }}
                  style={styles.editButton}
                >
                  <Text maxFontSizeMultiplier={2} style={styles.editButtonText}>
                    내용 수정
                  </Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text maxFontSizeMultiplier={2} style={styles.reviewLabel}>
        {label}
      </Text>
      <Text selectable maxFontSizeMultiplier={2} style={styles.reviewValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: "800",
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  closeText: { color: colors.textSecondary, fontSize: 32, lineHeight: 32 },
  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: spacing.lg,
  },
  contextCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    backgroundColor: colors.primarySoft,
  },
  contextTitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  contextText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.xs,
  },
  fieldLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  typeList: { gap: spacing.xs, marginBottom: spacing.xl },
  typeButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  typeButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.textMuted,
    marginRight: spacing.sm,
  },
  radioSelected: {
    borderWidth: 5,
    borderColor: colors.primary,
  },
  typeText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  typeTextSelected: { color: colors.primary, fontWeight: "800" },
  input: {
    minHeight: 132,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.xl,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 23,
    backgroundColor: colors.surface,
  },
  reviewCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  reviewRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  reviewLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  reviewValue: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.xxs,
  },
  privacyCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.lg,
    backgroundColor: colors.successSoft,
  },
  privacyText: {
    color: colors.success,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  resultMessage: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  editButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  editButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
});
