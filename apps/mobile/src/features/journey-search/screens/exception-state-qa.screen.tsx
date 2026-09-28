import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { PrimaryButton, Screen } from '@/shared/ui';

import { JourneyStatusCard } from '../components/journey-status-card';

type QaScenario = 'unknown' | 'outage' | 'request-error' | 'offline';

interface ScenarioDefinition {
  id: QaScenario;
  label: string;
  title: string;
  description: string;
}

const scenarios: ScenarioDefinition[] = [
  {
    id: 'unknown',
    label: '안전 경로 미확인',
    title: '안전 경로 미확인',
    description: '필수 시설의 위치 또는 현재 상태를 확인하지 못했습니다.',
  },
  {
    id: 'outage',
    label: '승강기 운행 중지',
    title: '운행 중지 시설 있음',
    description: '여정에 필요한 엘리베이터가 현재 보수 중입니다.',
  },
  {
    id: 'request-error',
    label: '조회 실패',
    title: '경로를 불러오지 못했어요',
    description: '서버 응답을 받지 못했습니다. 잠시 후 다시 시도해 주세요.',
  },
  {
    id: 'offline',
    label: '오프라인',
    title: '인터넷 연결을 확인해 주세요',
    description: '연결이 복구되면 현재 선택을 유지한 채 다시 시도할 수 있습니다.',
  },
];

export function ExceptionStateQaScreen() {
  const router = useRouter();
  const [selectedScenario, setSelectedScenario] = useState<QaScenario>('unknown');
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const scenario = scenarios.find(({ id }) => id === selectedScenario)!;

  const handleSelect = (id: QaScenario) => {
    setSelectedScenario(id);
    setRetryMessage(null);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="역 선택 화면으로 돌아가기"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>T05 클릭 시제품</Text>
          <Text accessibilityRole="header" style={styles.title}>
            예외 상태 QA
          </Text>
        </View>
      </View>

      <Text style={styles.description}>
        상태를 선택해 작은 화면과 큰 글씨에서도 제목, 설명, 복구 행동이 순서대로 읽히는지
        확인하세요.
      </Text>

      <View accessibilityRole="tablist" style={styles.scenarioList}>
        {scenarios.map(({ id, label }) => {
          const isSelected = id === selectedScenario;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              key={id}
              onPress={() => handleSelect(id)}
              style={[styles.scenarioButton, isSelected && styles.selectedScenario]}
            >
              <Text
                style={[
                  styles.scenarioButtonText,
                  isSelected && styles.selectedScenarioText,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View accessibilityLiveRegion="polite" style={styles.previewArea}>
        <Text style={styles.previewLabel}>선택한 상태</Text>
        {selectedScenario === 'unknown' ? (
          <JourneyStatusCard
            blockingReasons={[
              '필수 승강기의 위치와 실시간 상태 연결이 확인되지 않았습니다.',
            ]}
            reason="일반 경로는 표시하지만 안전한 엘리베이터 경로로 추천하지 않습니다."
            status="unknown"
          />
        ) : selectedScenario === 'outage' ? (
          <JourneyStatusCard
            blockingReasons={['도착 승강장의 필수 엘리베이터가 보수 중입니다.']}
            reason="현재 경로 대신 이용 가능한 다른 경로를 확인해 주세요."
            status="out_of_service"
          />
        ) : (
          <View accessibilityRole="alert" style={styles.errorCard}>
            <View style={styles.errorIcon} accessible={false}>
              <Text style={styles.errorIconText}>!</Text>
            </View>
            <Text style={styles.errorTitle}>{scenario.title}</Text>
            <Text style={styles.errorDescription}>{scenario.description}</Text>
            <PrimaryButton
              label="다시 시도"
              onPress={() => setRetryMessage('재시도 요청을 확인했습니다.')}
              style={styles.retryButton}
            />
            {retryMessage ? (
              <Text accessibilityLiveRegion="polite" style={styles.retryMessage}>
                {retryMessage}
              </Text>
            ) : null}
          </View>
        )}
      </View>

      <View style={styles.checkCard}>
        <Text style={styles.checkTitle}>확인 항목</Text>
        <Text style={styles.checkText}>• 상태가 색상 외 제목과 아이콘으로 구분되는지</Text>
        <Text style={styles.checkText}>• 48px 이상의 버튼을 한 손으로 누를 수 있는지</Text>
        <Text style={styles.checkText}>• 큰 글씨에서도 설명과 복구 버튼이 잘리지 않는지</Text>
        <Text style={styles.checkText}>• 스크린리더가 상태 → 이유 → 행동 순서로 읽는지</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  backButton: {
    width: 48,
    minHeight: 48,
    justifyContent: 'center',
  },
  backIcon: {
    color: colors.textPrimary,
    fontSize: 38,
    lineHeight: 38,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    marginTop: spacing.lg,
  },
  scenarioList: {
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  scenarioButton: {
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  selectedScenario: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  scenarioButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  selectedScenarioText: {
    color: colors.primary,
  },
  previewArea: {
    marginTop: spacing.xl,
  },
  previewLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  errorCard: {
    alignItems: 'flex-start',
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: colors.dangerSoft,
  },
  errorIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
  },
  errorIconText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 19,
    lineHeight: 27,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  errorDescription: {
    color: colors.danger,
    fontSize: 15,
    lineHeight: 23,
    marginTop: spacing.xs,
  },
  retryButton: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
  retryMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  checkCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
  },
  checkTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  checkText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
});
