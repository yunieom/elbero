import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { journeySnapshotRepository } from '@/features/journey-search/repository/journey-snapshot.repository';
import { serviceInfo } from '@/shared/config/service-info';
import { colors, radius, spacing } from '@/shared/theme';
import { Screen } from '@/shared/ui';

const links = [
  { label: '개인정보 처리방침', href: '/privacy' as const },
  { label: '이용약관', href: '/terms' as const },
  { label: '지원 및 안전 안내', href: '/support' as const },
];

export function ServiceInfoScreen() {
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  async function removeSavedJourney() {
    try {
      await journeySnapshotRepository.remove();
      setConfirmingDelete(false);
      setDeleteMessage('기기에 저장된 여정을 삭제했습니다.');
    } catch {
      setDeleteMessage('저장된 여정을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="홈으로 돌아가기"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={styles.backButton}
        >
          <Text allowFontScaling={false} style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text accessibilityRole="header" maxFontSizeMultiplier={2} style={styles.title}>
          서비스 정보
        </Text>
      </View>

      <View style={styles.appCard}>
        <Text maxFontSizeMultiplier={2} style={styles.appName}>{serviceInfo.appName}</Text>
        <Text maxFontSizeMultiplier={2} style={styles.meta}>
          버전 {serviceInfo.appVersion} · 운영 {serviceInfo.operatorName}
        </Text>
        <Text maxFontSizeMultiplier={2} style={styles.meta}>
          문의 {serviceInfo.supportEmail || '출시 전 지원 이메일 설정 필요'}
        </Text>
      </View>

      <View accessibilityRole="menu" style={styles.linkList}>
        {links.map((item) => (
          <Pressable
            accessibilityRole="link"
            key={item.href}
            onPress={() => router.push(item.href)}
            style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
          >
            <Text maxFontSizeMultiplier={2} style={styles.linkText}>{item.label}</Text>
            <Text accessibilityElementsHidden allowFontScaling={false} style={styles.arrow}>›</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.dataCard}>
        <Text accessibilityRole="header" maxFontSizeMultiplier={2} style={styles.sectionTitle}>
          내 기기의 저장 데이터
        </Text>
        <Text maxFontSizeMultiplier={2} style={styles.body}>
          오프라인 복구용 최근 여정과 현재 단계만 기기에 저장됩니다. 계정이나 서버 이동 이력은 없습니다.
        </Text>

        {confirmingDelete ? (
          <View style={styles.confirmCard}>
            <Text accessibilityLiveRegion="polite" maxFontSizeMultiplier={2} style={styles.confirmText}>
              저장된 최근 여정과 진행 단계를 삭제할까요?
            </Text>
            <View style={styles.confirmActions}>
              <Pressable accessibilityRole="button" onPress={() => setConfirmingDelete(false)} style={styles.cancelButton}>
                <Text maxFontSizeMultiplier={2} style={styles.cancelText}>취소</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => void removeSavedJourney()} style={styles.deleteButton}>
                <Text maxFontSizeMultiplier={2} style={styles.deleteText}>삭제</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            accessibilityHint="최근 여정과 진행 단계를 이 기기에서 제거합니다."
            accessibilityRole="button"
            onPress={() => {
              setDeleteMessage(null);
              setConfirmingDelete(true);
            }}
            style={styles.outlineButton}
          >
            <Text maxFontSizeMultiplier={2} style={styles.outlineButtonText}>저장된 여정 삭제</Text>
          </Pressable>
        )}

        {deleteMessage ? (
          <Text accessibilityLiveRegion="assertive" maxFontSizeMultiplier={2} style={styles.resultMessage}>
            {deleteMessage}
          </Text>
        ) : null}
      </View>

      <Text maxFontSizeMultiplier={2} style={styles.disclaimer}>
        현장 공사와 시설 상태는 바뀔 수 있습니다. 역내 표지와 직원 안내를 우선해 주세요.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingTop: spacing.sm },
  backButton: { width: 48, height: 48, justifyContent: 'center' },
  backIcon: { color: colors.textPrimary, fontSize: 38, lineHeight: 38 },
  title: { flex: 1, color: colors.textPrimary, fontSize: 22, lineHeight: 30, fontWeight: '800' },
  appCard: { borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg, backgroundColor: colors.surface },
  appName: { color: colors.textPrimary, fontSize: 22, lineHeight: 30, fontWeight: '800' },
  meta: { color: colors.textSecondary, fontSize: 13, lineHeight: 21, marginTop: spacing.xs },
  linkList: { overflow: 'hidden', borderRadius: radius.lg, marginTop: spacing.lg, backgroundColor: colors.surface },
  linkRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  pressed: { backgroundColor: colors.primarySoft },
  linkText: { flex: 1, color: colors.textPrimary, fontSize: 15, lineHeight: 23, fontWeight: '700' },
  arrow: { color: colors.primary, fontSize: 28, marginLeft: spacing.sm },
  dataCard: { borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg, backgroundColor: colors.surface },
  sectionTitle: { color: colors.textPrimary, fontSize: 17, lineHeight: 25, fontWeight: '800' },
  body: { color: colors.textSecondary, fontSize: 14, lineHeight: 23, marginTop: spacing.sm },
  outlineButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.danger, borderRadius: radius.md, paddingHorizontal: spacing.md, marginTop: spacing.lg },
  outlineButtonText: { color: colors.danger, fontSize: 15, fontWeight: '800' },
  confirmCard: { borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg, backgroundColor: colors.dangerSoft },
  confirmText: { color: colors.textPrimary, fontSize: 14, lineHeight: 22, fontWeight: '700' },
  confirmActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  cancelButton: { minHeight: 48, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.surface },
  cancelText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  deleteButton: { minHeight: 48, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.danger },
  deleteText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  resultMessage: { color: colors.textSecondary, fontSize: 13, lineHeight: 21, marginTop: spacing.md },
  disclaimer: { color: colors.textSecondary, fontSize: 13, lineHeight: 21, marginTop: spacing.lg, textAlign: 'center' },
});
