import type { JourneyStatus } from '@/entities/journey';
import { colors } from '@/shared/theme';

export const journeyStatusPresentation = {
  operational: {
    label: '현재 이용 가능',
    icon: '✓',
    color: colors.success,
    backgroundColor: colors.successSoft,
  },
  out_of_service: {
    label: '운행 중지 시설 있음',
    icon: '!',
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  unknown: {
    label: '안전 경로 미확인',
    icon: '?',
    color: colors.unknown,
    backgroundColor: colors.unknownSoft,
  },
} satisfies Record<
  JourneyStatus,
  { label: string; icon: string; color: string; backgroundColor: string }
>;
