import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Station } from '@/entities/station';
import { colors, radius, spacing } from '@/shared/theme';
import { PrimaryButton, Screen } from '@/shared/ui';

import { StationField } from '../components/station-field';
import { StationPickerModal } from '../components/station-picker-modal';
import { useLine5Stations } from '../hooks/use-line5-stations';

const DAPSIMNI: Station = {
  stationCode: '2543',
  stationName: '답십리',
  lineName: '5호선',
};
const GUBEUNDARI: Station = {
  stationCode: '2551',
  stationName: '굽은다리',
  lineName: '5호선',
};

type ActiveField = 'origin' | 'destination';

export function StationSearchScreen() {
  const router = useRouter();
  const { stations, isLoading, errorMessage, retry } = useLine5Stations();
  const [origin, setOrigin] = useState<Station | null>(null);
  const [destination, setDestination] = useState<Station | null>(null);
  const [activeField, setActiveField] = useState<ActiveField | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const handleSelect = (station: Station) => {
    if (activeField === 'origin') setOrigin(station);
    if (activeField === 'destination') setDestination(station);
    setActiveField(null);
    setValidationMessage(null);
  };

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
    setValidationMessage(null);
  };

  const handleSubmit = () => {
    if (!origin || !destination) {
      setValidationMessage('출발역과 도착역을 모두 선택해 주세요.');
      return;
    }
    if (origin.stationCode === destination.stationCode) {
      setValidationMessage('출발역과 도착역은 서로 달라야 합니다.');
      return;
    }
    router.push({
      pathname: '/journeys/result',
      params: {
        originStationCode: origin.stationCode,
        destinationStationCode: destination.stationCode,
      },
    });
  };

  const handleUseExample = () => {
    setOrigin(DAPSIMNI);
    setDestination(GUBEUNDARI);
    setValidationMessage(null);
  };

  const selectedStation = activeField === 'origin' ? origin : destination;
  return (
    <Screen>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>↕</Text>
        </View>
        <Text style={styles.brand}>엘베로</Text>
        <View style={styles.betaBadge}>
          <Text style={styles.betaText}>5호선 QA</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <Text accessibilityRole="header" style={styles.title}>
          출발지와 도착지를{`\n`}입력해 주세요
        </Text>
        <Text style={styles.description}>
          운행 중인 엘리베이터와 안전한 승하차 위치를 반영해 경로를 안내해요.
        </Text>
      </View>

      <View style={styles.formCard}>
        <StationField
          label="출발역"
          markerColor={colors.textPrimary}
          onPress={() => setActiveField('origin')}
          station={origin}
        />
        <View style={styles.connector} />
        <StationField
          label="도착역"
          markerColor={colors.primary}
          onPress={() => setActiveField('destination')}
          station={destination}
        />
        <Pressable
          accessibilityLabel="출발역과 도착역 바꾸기"
          accessibilityRole="button"
          disabled={!origin && !destination}
          onPress={handleSwap}
          style={({ pressed }) => [
            styles.swapButton,
            pressed && styles.swapPressed,
            !origin && !destination && styles.swapDisabled,
          ]}
        >
          <Text style={styles.swapIcon}>⇅</Text>
        </Pressable>
      </View>

      <View style={styles.optionRow}>
        <View accessibilityElementsHidden style={styles.checkBox}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <View style={styles.optionTextArea}>
          <Text style={styles.optionTitle}>승강기 운행 상태 반영</Text>
          <Text style={styles.optionDescription}>최대 1시간 지연될 수 있어요.</Text>
        </View>
      </View>

      {validationMessage ? (
        <Text accessibilityLiveRegion="polite" style={styles.validationMessage}>
          {validationMessage}
        </Text>
      ) : null}

      <PrimaryButton
        accessibilityLabel="엘리베이터 안전 경로 찾기"
        label="안전 경로 찾기"
        onPress={handleSubmit}
      />

      <Pressable
        accessibilityRole="button"
        onPress={handleUseExample}
        style={styles.exampleButton}
      >
        <Text style={styles.exampleText}>QA 예시 채우기 · 답십리 → 굽은다리</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/qa/states')}
        style={styles.qaStateButton}
      >
        <Text style={styles.qaStateButtonText}>QA 예외 상태 시제품 보기</Text>
      </Pressable>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>안내 기준</Text>
        <Text style={styles.infoText}>
          15cm를 초과하는 승강장 간격은 추천에서 제외하고, 정보가 부족하면 일반 경로와
          함께 ‘안전 경로 미확인’으로 표시합니다.
        </Text>
      </View>

      <StationPickerModal
        errorMessage={errorMessage}
        isLoading={isLoading}
        onClose={() => setActiveField(null)}
        onRetry={retry}
        onSelect={handleSelect}
        selectedStationCode={selectedStation?.stationCode}
        stations={stations}
        title={activeField === 'origin' ? '출발역 선택' : '도착역 선택'}
        visible={activeField !== null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  brandMark: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.primary,
  },
  brandMarkText: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '800',
  },
  brand: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  betaBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    marginLeft: 'auto',
    backgroundColor: colors.primarySoft,
  },
  betaText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  hero: {
    marginTop: 54,
    marginBottom: spacing.xxl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  description: {
    maxWidth: 430,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
  formCard: {
    position: 'relative',
    gap: spacing.xs,
    borderRadius: radius.lg,
    padding: spacing.xs,
    backgroundColor: colors.surface,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 20px rgba(28, 39, 69, 0.08)',
      },
      default: {
        shadowColor: '#1C2745',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 3,
      },
    }),
  },
  connector: {
    position: 'absolute',
    left: 27,
    top: 77,
    width: 2,
    height: 16,
    backgroundColor: colors.border,
    zIndex: 2,
  },
  swapButton: {
    position: 'absolute',
    right: spacing.lg,
    top: 68,
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    zIndex: 3,
  },
  swapPressed: {
    backgroundColor: colors.primarySoft,
  },
  swapDisabled: {
    opacity: 0.45,
  },
  swapIcon: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  checkBox: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    marginRight: spacing.sm,
    backgroundColor: colors.primary,
  },
  checkMark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  optionTextArea: {
    flex: 1,
  },
  optionTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  optionDescription: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  validationMessage: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  exampleButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exampleText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  qaStateButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  qaStateButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  infoCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.unknownSoft,
  },
  infoTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
