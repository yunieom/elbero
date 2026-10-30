import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Screen } from '@/shared/ui';

import { legalDocuments, type LegalDocumentKind } from './legal-documents';

export function LegalDocumentScreen({ kind }: { kind: LegalDocumentKind }) {
  const router = useRouter();
  const document = legalDocuments[kind];

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="이전 화면으로 돌아가기"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={styles.backButton}
        >
          <Text allowFontScaling={false} style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text accessibilityRole="header" maxFontSizeMultiplier={2} style={styles.title}>
          {document.title}
        </Text>
      </View>

      <Text maxFontSizeMultiplier={2} style={styles.updatedAt}>
        시행·갱신일 {document.updatedAt}
      </Text>
      <Text maxFontSizeMultiplier={2} style={styles.introduction}>
        {document.introduction}
      </Text>

      {document.sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text accessibilityRole="header" maxFontSizeMultiplier={2} style={styles.sectionTitle}>
            {section.title}
          </Text>
          {section.paragraphs.map((paragraph) => (
            <Text key={paragraph} maxFontSizeMultiplier={2} style={styles.body}>
              {paragraph}
            </Text>
          ))}
          {section.bullets?.map((bullet) => (
            <View key={bullet} style={styles.bulletRow}>
              <Text accessibilityElementsHidden style={styles.bullet}>•</Text>
              <Text maxFontSizeMultiplier={2} style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.notice}>
        <Text maxFontSizeMultiplier={2} style={styles.noticeText}>
          이 문서는 앱의 현재 기능과 데이터 처리 기준을 설명합니다. 기능이 변경되면 함께 갱신합니다.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
  },
  backIcon: { color: colors.textPrimary, fontSize: 38, lineHeight: 38 },
  title: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '800',
  },
  updatedAt: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  introduction: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '600',
    marginTop: spacing.lg,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 23,
    marginBottom: spacing.sm,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xs },
  bullet: { color: colors.textSecondary, fontSize: 15, lineHeight: 23, marginRight: spacing.sm },
  bulletText: { flex: 1, color: colors.textSecondary, fontSize: 14, lineHeight: 23 },
  notice: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xxl,
    backgroundColor: colors.surfaceMuted,
  },
  noticeText: { color: colors.textSecondary, fontSize: 13, lineHeight: 21 },
});
