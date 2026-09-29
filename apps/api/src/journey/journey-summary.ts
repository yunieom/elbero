import type {
  JourneySummaryResDto,
  JourneyTrainSegmentResDto,
} from './dto/res/journey-plan.res.dto.js';
import {
  JOURNEY_STEP_TYPE,
  type JourneyDoorPosition,
  type VerifiedRouteCandidate,
} from './types/verified-journey.type.js';

export interface JourneySummaryCalculation {
  summary: JourneySummaryResDto;
  trainSegments: JourneyTrainSegmentResDto[];
  validationIssues: string[];
}

export function calculateJourneySummary(
  candidate: VerifiedRouteCandidate,
): JourneySummaryCalculation {
  const trainSteps = candidate.steps.filter(
    (step) => step.type === JOURNEY_STEP_TYPE.TRAIN,
  );
  const validationIssues: string[] = [];
  const trainSegments = trainSteps.flatMap((step, index) => {
    if (!step.trainSegment) {
      validationIssues.push(
        `${index + 1}번째 열차 구간의 구조화 정보가 없습니다.`,
      );
      return [];
    }
    if (
      !samePosition(
        step.trainSegment.boardingPosition,
        step.trainSegment.alightingPosition,
      )
    ) {
      validationIssues.push(
        `${step.trainSegment.originStationName}→${step.trainSegment.destinationStationName} 구간의 승차·하차 위치가 일치하지 않습니다.`,
      );
    }
    return [
      {
        order: index + 1,
        ...step.trainSegment,
        platformGap: step.platformGap ?? null,
      },
    ];
  });

  return {
    summary: {
      lineNames: [...new Set(trainSegments.map((segment) => segment.lineName))],
      directions: [
        ...new Set(trainSegments.map((segment) => segment.direction)),
      ],
      transferCount: candidate.steps.filter(
        (step) => step.type === JOURNEY_STEP_TYPE.TRANSFER,
      ).length,
      elevatorCount: candidate.facilityGroups.reduce((count, group) => {
        const matchedFacilities = group.facilities.filter(
          (facility) => facility.sourceFacilityName !== null,
        );
        return (
          count +
          (group.policy === 'any'
            ? Number(matchedFacilities.length > 0)
            : matchedFacilities.length)
        );
      }, 0),
    },
    trainSegments,
    validationIssues,
  };
}

function samePosition(
  boarding: JourneyDoorPosition | null,
  alighting: JourneyDoorPosition | null,
): boolean {
  if (boarding === null || alighting === null) return boarding === alighting;
  return (
    boarding.carNumber === alighting.carNumber &&
    boarding.doorNumber === alighting.doorNumber
  );
}
