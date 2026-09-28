import { StyleSheet, Text, View } from 'react-native';

import type { JourneyStatus } from '@/entities/journey';
import { radius, spacing } from '@/shared/theme';

import { journeyStatusPresentation } from '../model/journey-status';

interface JourneyStatusCardProps {
  status: JourneyStatus;
  reason: string;
}

export function JourneyStatusCard({ status, reason }: JourneyStatusCardProps) {
  const presentation = journeyStatusPresentation[status];
  return (
    <View
      accessibilityLabel={`${presentation.label}. ${reason}`}
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
});
