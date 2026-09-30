import type { JourneyPlan } from "@/entities/journey";

import type { JourneyPlanApiDto } from "../api/journey.api.types";

export function toJourneyPlan(dto: JourneyPlanApiDto): JourneyPlan {
  const selectedRoute =
    dto.candidates.find(
      (candidate) => candidate.id === dto.recommendedRouteId,
    ) ?? dto.candidates[0];
  if (!selectedRoute) {
    throw new Error("표시할 수 있는 경로가 없습니다.");
  }

  return {
    journeyId: dto.journeyId,
    originName: dto.origin.stationName,
    destinationName: dto.destination.stationName,
    dataVersion: dto.dataVersion,
    verifiedAt: dto.verifiedAt,
    selectionReason: dto.selectionReason,
    statusCheckedAt: dto.statusCheckedAt,
    maxSourceDelayMinutes: dto.maxSourceDelayMinutes,
    notice: dto.notice,
    route: {
      id: selectedRoute.id,
      label: selectedRoute.label,
      status: selectedRoute.status,
      isRecommended: selectedRoute.recommended,
      transferStation: selectedRoute.transferStation,
      blockingReasons: selectedRoute.blockingReasons,
      facilityGroups: selectedRoute.facilityGroups.map((group) => ({
        id: group.id,
        label: group.label,
        status: group.status,
      })),
      steps: selectedRoute.steps.map((step) => ({
        id: `${dto.journeyId}-${step.order}`,
        order: step.order,
        type: step.type,
        stationName: step.stationName,
        instruction: step.instruction,
        stationAccess: step.stationAccess,
        platformGap: step.platformGap,
      })),
      summary: selectedRoute.summary,
      trainSegments: selectedRoute.trainSegments,
      validationIssues: selectedRoute.validationIssues,
    },
  };
}
