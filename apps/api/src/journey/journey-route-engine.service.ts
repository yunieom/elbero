import { Injectable } from '@nestjs/common';
import {
  createJourneyContractError,
  createJourneyContractMeta,
  JOURNEY_ERROR_CODE,
  type JourneyContractError,
  type JourneyContractResult,
  type JourneyErrorCode,
} from '@elbero/contracts';
import {
  ELEVATOR_STATUS,
  type ElevatorStatus,
  type SeoulElevatorStatusSnapshot,
  type SeoulElevatorFacilityRow,
} from '../elevator-status/types/seoul-elevator-status.type.js';
import type {
  JourneyFacilityGroupResDto,
  JourneyFacilityStatusResDto,
  JourneyPlanResDto,
  JourneyRouteCandidateResDto,
} from './dto/res/journey-plan.res.dto.js';
import { calculateJourneySummary } from './journey-summary.js';
import { attachStationAccessDetails } from './station-access.js';
import type {
  EvaluatedFacility,
  EvaluatedFacilityGroup,
  FacilityRequirementGroup,
  VerifiedFacilityRef,
  VerifiedJourneyDefinition,
  VerifiedRouteCandidate,
} from './types/verified-journey.type.js';

const MAX_SOURCE_DELAY_MINUTES = 60;

@Injectable()
export class JourneyRouteEngine {
  plan(
    definition: VerifiedJourneyDefinition | null,
    snapshot: SeoulElevatorStatusSnapshot | null,
    requestId: string,
  ): JourneyContractResult<JourneyPlanResDto> {
    if (!definition) {
      return this.failure(
        JOURNEY_ERROR_CODE.UNSUPPORTED_JOURNEY,
        '아직 검증된 이동 경로가 없는 출발역·도착역 조합입니다.',
        requestId,
        null,
      );
    }
    if (!snapshot) {
      return this.failure(
        JOURNEY_ERROR_CODE.SOURCE_UNAVAILABLE,
        '서울 승강기 상태를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
        requestId,
        definition.dataVersion,
      );
    }

    const evaluatedCandidates = definition.candidates
      .map((candidate) =>
        this.evaluateCandidate(candidate, snapshot.rows, definition.verifiedAt),
      )
      .sort((left, right) => left.priority - right.priority);
    const recommendedCandidate = evaluatedCandidates.find(
      (candidate) => candidate.status === ELEVATOR_STATUS.OPERATIONAL,
    );
    const hasUnknown = evaluatedCandidates.some(
      (candidate) => candidate.status === ELEVATOR_STATUS.UNKNOWN,
    );

    if (!recommendedCandidate && !hasUnknown) {
      return this.failure(
        JOURNEY_ERROR_CODE.NO_ACCESSIBLE_ROUTE,
        '현재 운행 중인 필수 승강기로 완성되는 안전 경로가 없습니다.',
        requestId,
        definition.dataVersion,
        { candidateCount: evaluatedCandidates.length },
      );
    }

    const candidates = evaluatedCandidates.map((candidate) => ({
      ...candidate,
      recommended: candidate.id === recommendedCandidate?.id,
    }));
    const warnings: JourneyContractError[] = [];
    const positionValidationIssues = candidates.flatMap(
      (candidate) => candidate.validationIssues,
    );
    if (positionValidationIssues.length > 0) {
      warnings.push(
        createJourneyContractError(
          JOURNEY_ERROR_CODE.DATA_CONFLICT,
          '열차 승차·하차 위치 기준이 일치하지 않는 구간이 있습니다.',
          { issueCount: positionValidationIssues.length },
        ),
      );
    }
    if (!recommendedCandidate && hasUnknown) {
      warnings.push(
        createJourneyContractError(
          JOURNEY_ERROR_CODE.DATA_MISSING,
          '필수 시설 연결 정보가 부족해 일반 경로만 제공합니다.',
          {
            unknownCandidateCount: candidates.filter(
              (item) => item.status === ELEVATOR_STATUS.UNKNOWN,
            ).length,
          },
        ),
        createJourneyContractError(
          JOURNEY_ERROR_CODE.FACILITY_STATUS_UNKNOWN,
          '일부 필수 승강기의 현재 상태를 확인할 수 없습니다.',
        ),
      );
    }

    const data: JourneyPlanResDto = {
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

    return {
      ok: true,
      data,
      warnings,
      meta: createJourneyContractMeta(
        requestId,
        definition.dataVersion,
        snapshot.checkedAt,
      ),
    };
  }

  sourceFailure(
    requestId: string,
    dataVersion: string,
    timedOut: boolean,
  ): JourneyContractResult<never> {
    return this.failure(
      timedOut
        ? JOURNEY_ERROR_CODE.SOURCE_TIMEOUT
        : JOURNEY_ERROR_CODE.SOURCE_UNAVAILABLE,
      timedOut
        ? '서울 승강기 상태 조회 시간이 초과되었습니다.'
        : '서울 승강기 상태를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
      requestId,
      dataVersion,
    );
  }

  private failure(
    code: JourneyErrorCode,
    message: string,
    requestId: string,
    dataVersion: string | null,
    details: JourneyContractError['details'] = {},
  ): JourneyContractResult<never> {
    return {
      ok: false,
      error: createJourneyContractError(code, message, details),
      meta: createJourneyContractMeta(requestId, dataVersion),
    };
  }

  private evaluateCandidate(
    candidate: VerifiedRouteCandidate,
    rows: SeoulElevatorFacilityRow[],
    verifiedAt: string,
  ): JourneyRouteCandidateResDto {
    const facilityGroups = candidate.facilityGroups.map((group) =>
      this.evaluateGroup(group, rows),
    );
    const calculated = calculateJourneySummary(candidate);
    const facilityStatus = this.toRequiredStatus(facilityGroups);
    const status =
      calculated.validationIssues.length > 0
        ? ELEVATOR_STATUS.UNKNOWN
        : facilityStatus;
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
      steps: attachStationAccessDetails(candidate, verifiedAt).map((step) => ({
        ...step,
        facilityGroupId: step.facilityGroupId ?? null,
        stationAccess: step.stationAccess ?? null,
        platformGap: step.platformGap ?? null,
      })),
      summary: calculated.summary,
      trainSegments: calculated.trainSegments,
      validationIssues: calculated.validationIssues,
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
    if (!facility.sourceFacilityName) return this.unmatched(facility);
    const matchedRow = rows.find(
      (row) =>
        row.ELVTR_SE === 'EV' &&
        row.STN_CD === facility.stationCode &&
        row.ELVTR_NM === facility.sourceFacilityName &&
        row.OPR_SEC === facility.expectedOperatingSection &&
        row.INSTL_PSTN === facility.expectedLocation,
    );
    if (!matchedRow) return this.unmatched(facility);
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

  private unmatched(facility: VerifiedFacilityRef): EvaluatedFacility {
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

  private toStatus(sourceStatus: string): ElevatorStatus {
    if (sourceStatus === '사용가능') return ELEVATOR_STATUS.OPERATIONAL;
    if (sourceStatus === '보수중') return ELEVATOR_STATUS.OUT_OF_SERVICE;
    return ELEVATOR_STATUS.UNKNOWN;
  }

  private toAnyStatus(facilities: EvaluatedFacility[]): ElevatorStatus {
    if (facilities.some((item) => item.status === ELEVATOR_STATUS.OPERATIONAL))
      return ELEVATOR_STATUS.OPERATIONAL;
    if (facilities.some((item) => item.status === ELEVATOR_STATUS.UNKNOWN))
      return ELEVATOR_STATUS.UNKNOWN;
    return ELEVATOR_STATUS.OUT_OF_SERVICE;
  }

  private toRequiredStatus(
    items: Array<{ status: ElevatorStatus }>,
  ): ElevatorStatus {
    if (items.some((item) => item.status === ELEVATOR_STATUS.OUT_OF_SERVICE))
      return ELEVATOR_STATUS.OUT_OF_SERVICE;
    if (
      items.length === 0 ||
      items.some((item) => item.status === ELEVATOR_STATUS.UNKNOWN)
    )
      return ELEVATOR_STATUS.UNKNOWN;
    return ELEVATOR_STATUS.OPERATIONAL;
  }

  private toSelectionReason(
    candidates: JourneyRouteCandidateResDto[],
    recommendedCandidate: JourneyRouteCandidateResDto | undefined,
  ): string {
    if (!recommendedCandidate) {
      const hasConflict = candidates.some((candidate) =>
        candidate.facilityGroups.some((group) =>
          group.facilities.some(
            (facility) =>
              facility.status === ELEVATOR_STATUS.UNKNOWN &&
              facility.role.includes('충돌'),
          ),
        ),
      );
      return hasConflict
        ? '필수 시설의 위치 정보가 출처별로 충돌하여 현장 확인 전에는 안전한 경로로 추천하지 않습니다.'
        : '필수 승강기가 운행 중지이거나 상태를 확인할 수 없어 안전하게 추천할 경로가 없습니다.';
    }
    if (recommendedCandidate.priority === 1)
      return '현재 확인된 필수 승강기가 모두 운행 중인 우선 경로입니다.';
    const reasons = candidates
      .filter((candidate) => candidate.priority < recommendedCandidate.priority)
      .flatMap((candidate) => candidate.blockingReasons);
    return `${reasons.join(' ')} 따라서 ${recommendedCandidate.label} 경로를 선택했습니다.`;
  }

  private toBlockingReason(group: EvaluatedFacilityGroup): string {
    if (group.status === ELEVATOR_STATUS.OUT_OF_SERVICE)
      return `${group.label}에 운행 중지 시설이 있어 이용할 수 없습니다.`;
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
