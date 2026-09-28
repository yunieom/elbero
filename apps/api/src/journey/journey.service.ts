import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ElevatorStatusClient } from '../elevator-status/elevator-status.client.js';
import {
  ELEVATOR_STATUS,
  type ElevatorStatus,
  type SeoulElevatorFacilityRow,
} from '../elevator-status/types/seoul-elevator-status.type.js';
import { VERIFIED_JOURNEYS } from './data/verified-journeys.data.js';
import { createLine5JourneyDefinition } from './line-5-journey.factory.js';
import type {
  JourneyFacilityGroupResDto,
  JourneyFacilityStatusResDto,
  JourneyPlanResDto,
  JourneyRouteCandidateResDto,
} from './dto/res/journey-plan.res.dto.js';
import type {
  EvaluatedFacility,
  EvaluatedFacilityGroup,
  FacilityRequirementGroup,
  VerifiedFacilityRef,
  VerifiedRouteCandidate,
} from './types/verified-journey.type.js';

const MAX_SOURCE_DELAY_MINUTES = 60;

@Injectable()
export class JourneyService {
  constructor(private readonly elevatorStatusClient: ElevatorStatusClient) {}

  async plan(
    originStationCode: string,
    destinationStationCode: string,
  ): Promise<JourneyPlanResDto> {
    const normalizedOrigin = originStationCode.padStart(4, '0');
    const normalizedDestination = destinationStationCode.padStart(4, '0');
    const definition =
      VERIFIED_JOURNEYS.find(
      (journey) =>
        journey.originStationCode === normalizedOrigin &&
        journey.destinationStationCode === normalizedDestination,
      ) ??
      createLine5JourneyDefinition(normalizedOrigin, normalizedDestination);

    if (!definition) {
      throw new UnprocessableEntityException({
        code: 'UNSUPPORTED_JOURNEY',
        message: '아직 검증된 이동 경로가 없는 출발역·도착역 조합입니다.',
      });
    }

    const snapshot = await this.elevatorStatusClient.getSnapshot();
    const evaluatedCandidates = definition.candidates
      .map((candidate) => this.evaluateCandidate(candidate, snapshot.rows))
      .sort((left, right) => left.priority - right.priority);
    const recommendedCandidate = evaluatedCandidates.find(
      (candidate) => candidate.status === ELEVATOR_STATUS.OPERATIONAL,
    );

    const candidates = evaluatedCandidates.map((candidate) => ({
      ...candidate,
      recommended: candidate.id === recommendedCandidate?.id,
    }));

    return {
      journeyId: definition.id,
      origin: {
        stationCode: definition.originStationCode,
        stationName: definition.originStationName,
      },
      destination: {
        stationCode: definition.destinationStationCode,
        stationName: definition.destinationStationName,
      },
      dataVersion: definition.dataVersion,
      verifiedAt: definition.verifiedAt,
      recommendedRouteId: recommendedCandidate?.id ?? null,
      selectionReason: this.toSelectionReason(
        evaluatedCandidates,
        recommendedCandidate,
      ),
      statusCheckedAt: snapshot.checkedAt,
      maxSourceDelayMinutes: MAX_SOURCE_DELAY_MINUTES,
      notice:
        '승강기 상태는 최대 1시간 지연될 수 있으며, 시설 연결이 확인되지 않으면 unknown으로 표시합니다.',
      candidates,
    };
  }

  private evaluateCandidate(
    candidate: VerifiedRouteCandidate,
    rows: SeoulElevatorFacilityRow[],
  ): JourneyRouteCandidateResDto {
    const facilityGroups = candidate.facilityGroups.map((group) =>
      this.evaluateGroup(group, rows),
    );
    const status = this.toRequiredStatus(facilityGroups);

    return {
      id: candidate.id,
      label: candidate.label,
      priority: candidate.priority,
      transferStation: candidate.transferStation,
      lines: candidate.lines,
      status,
      recommended: false,
      blockingReasons: facilityGroups
        .filter((group) => group.status !== ELEVATOR_STATUS.OPERATIONAL)
        .map((group) => this.toBlockingReason(group)),
      facilityGroups: facilityGroups.map(
        (group): JourneyFacilityGroupResDto => ({
          id: group.id,
          label: group.label,
          policy: group.policy,
          status: group.status,
          facilities: group.facilities.map(
            (facility): JourneyFacilityStatusResDto => ({ ...facility }),
          ),
        }),
      ),
      steps: candidate.steps.map((step) => ({
        ...step,
        facilityGroupId: step.facilityGroupId ?? null,
        platformGap: step.platformGap ?? null,
      })),
    };
  }

  private evaluateGroup(
    group: FacilityRequirementGroup,
    rows: SeoulElevatorFacilityRow[],
  ): EvaluatedFacilityGroup {
    const facilities = group.facilities.map((facility) =>
      this.evaluateFacility(facility, rows),
    );

    return {
      id: group.id,
      label: group.label,
      policy: group.policy,
      status:
        group.policy === 'any'
          ? this.toAnyStatus(facilities)
          : this.toRequiredStatus(facilities),
      facilities,
    };
  }

  private evaluateFacility(
    facility: VerifiedFacilityRef,
    rows: SeoulElevatorFacilityRow[],
  ): EvaluatedFacility {
    if (!facility.sourceFacilityName) {
      return {
        id: facility.id,
        stationCode: facility.stationCode,
        stationName: facility.stationName,
        role: facility.role,
        status: ELEVATOR_STATUS.UNKNOWN,
        sourceStatus: null,
        sourceFacilityName: null,
        matchStatus: 'unmatched',
      };
    }

    const matchedRow = rows.find(
      (row) =>
        row.ELVTR_SE === 'EV' &&
        row.STN_CD === facility.stationCode &&
        row.ELVTR_NM === facility.sourceFacilityName &&
        row.OPR_SEC === facility.expectedOperatingSection &&
        row.INSTL_PSTN === facility.expectedLocation,
    );

    if (!matchedRow) {
      return {
        id: facility.id,
        stationCode: facility.stationCode,
        stationName: facility.stationName,
        role: facility.role,
        status: ELEVATOR_STATUS.UNKNOWN,
        sourceStatus: null,
        sourceFacilityName: facility.sourceFacilityName,
        matchStatus: 'unmatched',
      };
    }

    return {
      id: facility.id,
      stationCode: facility.stationCode,
      stationName: facility.stationName,
      role: facility.role,
      status: this.toStatus(matchedRow.USE_YN),
      sourceStatus: matchedRow.USE_YN,
      sourceFacilityName: matchedRow.ELVTR_NM,
      matchStatus: 'verified',
    };
  }

  private toStatus(sourceStatus: string): ElevatorStatus {
    if (sourceStatus === '사용가능') {
      return ELEVATOR_STATUS.OPERATIONAL;
    }
    if (sourceStatus === '보수중') {
      return ELEVATOR_STATUS.OUT_OF_SERVICE;
    }
    return ELEVATOR_STATUS.UNKNOWN;
  }

  private toAnyStatus(facilities: EvaluatedFacility[]): ElevatorStatus {
    if (
      facilities.some(
        (facility) => facility.status === ELEVATOR_STATUS.OPERATIONAL,
      )
    ) {
      return ELEVATOR_STATUS.OPERATIONAL;
    }
    if (
      facilities.some(
        (facility) => facility.status === ELEVATOR_STATUS.UNKNOWN,
      )
    ) {
      return ELEVATOR_STATUS.UNKNOWN;
    }
    return ELEVATOR_STATUS.OUT_OF_SERVICE;
  }

  private toRequiredStatus(
    items: Array<{ status: ElevatorStatus }>,
  ): ElevatorStatus {
    if (
      items.some((item) => item.status === ELEVATOR_STATUS.OUT_OF_SERVICE)
    ) {
      return ELEVATOR_STATUS.OUT_OF_SERVICE;
    }
    if (
      items.length === 0 ||
      items.some((item) => item.status === ELEVATOR_STATUS.UNKNOWN)
    ) {
      return ELEVATOR_STATUS.UNKNOWN;
    }
    return ELEVATOR_STATUS.OPERATIONAL;
  }

  private toSelectionReason(
    candidates: JourneyRouteCandidateResDto[],
    recommendedCandidate: JourneyRouteCandidateResDto | undefined,
  ): string {
    if (!recommendedCandidate) {
      const hasConflictingEvidence = candidates.some((candidate) =>
        candidate.facilityGroups.some((group) =>
          group.facilities.some(
            (facility) =>
              facility.status === ELEVATOR_STATUS.UNKNOWN &&
              facility.role.includes('충돌'),
          ),
        ),
      );
      if (hasConflictingEvidence) {
        return '필수 시설의 위치 정보가 출처별로 충돌하여 현장 확인 전에는 안전한 경로로 추천하지 않습니다.';
      }
      return '필수 승강기가 운행 중지이거나 상태를 확인할 수 없어 안전하게 추천할 경로가 없습니다.';
    }
    if (recommendedCandidate.priority === 1) {
      return '현재 확인된 필수 승강기가 모두 운행 중인 우선 경로입니다.';
    }

    const skippedCandidates = candidates
      .filter((candidate) => candidate.priority < recommendedCandidate.priority)
      .flatMap((candidate) => candidate.blockingReasons);
    return `${skippedCandidates.join(' ')} 따라서 ${recommendedCandidate.label} 경로를 선택했습니다.`;
  }

  private toBlockingReason(group: EvaluatedFacilityGroup): string {
    if (group.status === ELEVATOR_STATUS.OUT_OF_SERVICE) {
      return `${group.label}에 운행 중지 시설이 있어 이용할 수 없습니다.`;
    }
    if (
      group.facilities.some(
        (facility) =>
          facility.status === ELEVATOR_STATUS.UNKNOWN &&
          facility.role.includes('충돌'),
      )
    ) {
      return `${group.label}의 출구 번호가 출처별로 충돌하여 현장 확인이 필요합니다.`;
    }
    return `${group.label}의 가동 여부를 확인할 수 없습니다.`;
  }
}
