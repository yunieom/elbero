import { StyleSheet, Text, View } from 'react-native';

import type { JourneyStatus } from '@/entities/journey';
import { radius, spacing } from '@/shared/theme';

import { journeyStatusPresentation } from '../model/journey-status';

interface JourneyStatusCardProps {
  status: JourneyStatus;
  reason: string;
  blockingReasons: string[];
}

export function JourneyStatusCard({
  status,
  reason,
  blockingReasons,
}: JourneyStatusCardProps) {
  const presentation = journeyStatusPresentation[status];
  const uniqueBlockingReasons = [...new Set(blockingReasons)];
  const accessibilityLabel = [
    `${presentation.label}. ${reason}`,
    ...uniqueBlockingReasons.map((blockingReason) =>
      `확인이 필요한 내용. ${blockingReason}`,
    ),
  ].join(' ');
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.card,
        { backgroundColor: presentation.backgroundColor },
      ]}
    >
      <View
        style={[styles.icon, { backgroundColor: presentation.color }]}
        accessible={false}
      >
        <Text style={styles.iconText}>{presentation.icon}</Text>
      </View>
      <View style={styles.textArea}>
        <Text style={[styles.title, { color: presentation.color }]}>
          {presentation.label}
        </Text>
        <Text style={[styles.reason, { color: presentation.color }]}>{reason}</Text>
        {uniqueBlockingReasons.length > 0 ? (
          <View
            style={[
              styles.blockingArea,
              { borderTopColor: presentation.color },
            ]}
          >
            <Text style={[styles.blockingTitle, { color: presentation.color }]}>
              확인이 필요한 내용
            </Text>
            {uniqueBlockingReasons.map((blockingReason, index) => (
              <Text
                key={`${index}-${blockingReason}`}
                style={[styles.blockingReason, { color: presentation.color }]}
              >
                • {blockingReason}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  icon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    marginRight: spacing.sm,
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  textArea: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  reason: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xxs,
  },
  blockingArea: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
  },
  blockingTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  blockingReason: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xxs,
  },
});
