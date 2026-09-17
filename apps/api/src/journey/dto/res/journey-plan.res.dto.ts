import { ApiProperty } from '@nestjs/swagger';
import { ELEVATOR_STATUS } from '../../../elevator-status/types/seoul-elevator-status.type.js';
import { JOURNEY_STEP_TYPE } from '../../types/verified-journey.type.js';

const STATUS_VALUES = Object.values(ELEVATOR_STATUS);
const STEP_TYPE_VALUES = Object.values(JOURNEY_STEP_TYPE);

export class JourneyOriginStationResDto {
  @ApiProperty({ example: '2543' })
  stationCode: string;

  @ApiProperty({ example: '답십리' })
  stationName: string;
}

export class JourneyDestinationStationResDto {
  @ApiProperty({ example: '0239' })
  stationCode: string;

  @ApiProperty({ example: '홍대입구' })
  stationName: string;
}

export class JourneyStepResDto {
  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ enum: STEP_TYPE_VALUES, example: JOURNEY_STEP_TYPE.ENTRY })
  type: string;

  @ApiProperty({ example: '답십리' })
  stationName: string;

  @ApiProperty({
    example: '2번 출입구 옆 엘리베이터를 타고 B2 대합실로 이동하세요.',
  })
  instruction: string;

  @ApiProperty({
    nullable: true,
    example: 'dapsimni-west-surface',
  })
  facilityGroupId: string | null;

  @ApiProperty({ example: 'KRIC stationMovement · 답십리→마장 방면' })
  evidence: string;
}

export class JourneyFacilityStatusResDto {
  @ApiProperty({ example: 'dapsimni-exit-2' })
  id: string;

  @ApiProperty({ example: '2543' })
  stationCode: string;

  @ApiProperty({ example: '답십리' })
  stationName: string;

  @ApiProperty({ example: '2번 출입구에서 B2 대합실로 이동' })
  role: string;

  @ApiProperty({ enum: STATUS_VALUES, example: ELEVATOR_STATUS.OPERATIONAL })
  status: string;

  @ApiProperty({ nullable: true, example: '사용가능' })
  sourceStatus: string | null;

  @ApiProperty({
    nullable: true,
    example: '승강기)엘리베이터-답십리 외부3',
  })
  sourceFacilityName: string | null;

  @ApiProperty({ enum: ['verified', 'unmatched'], example: 'verified' })
  matchStatus: 'verified' | 'unmatched';
}

export class JourneyFacilityGroupResDto {
  @ApiProperty({ example: 'dapsimni-west-surface' })
  id: string;

  @ApiProperty({ example: '답십리 지상 출입구 엘리베이터' })
  label: string;

  @ApiProperty({
    enum: ['all', 'any'],
    description: 'all은 전부 필요, any는 하나 이상 운행하면 통과',
    example: 'any',
  })
  policy: 'all' | 'any';

  @ApiProperty({ enum: STATUS_VALUES, example: ELEVATOR_STATUS.OPERATIONAL })
  status: string;

  @ApiProperty({ type: [JourneyFacilityStatusResDto] })
  facilities: JourneyFacilityStatusResDto[];
}

export class JourneyRouteCandidateResDto {
  @ApiProperty({ example: 'transfer-at-ddp' })
  id: string;

  @ApiProperty({ example: '동대문역사문화공원 환승' })
  label: string;

  @ApiProperty({ example: 1 })
  priority: number;

  @ApiProperty({ nullable: true, example: '동대문역사문화공원' })
  transferStation: string | null;

  @ApiProperty({ example: ['5호선', '2호선'] })
  lines: string[];

  @ApiProperty({ enum: STATUS_VALUES, example: ELEVATOR_STATUS.OPERATIONAL })
  status: string;

  @ApiProperty({ example: true })
  recommended: boolean;

  @ApiProperty({
    type: [String],
    example: [],
    description: '운행 중지 또는 상태 미확인으로 이 경로를 막는 이유',
  })
  blockingReasons: string[];

  @ApiProperty({ type: [JourneyFacilityGroupResDto] })
  facilityGroups: JourneyFacilityGroupResDto[];

  @ApiProperty({ type: [JourneyStepResDto] })
  steps: JourneyStepResDto[];
}

export class JourneyPlanResDto {
  @ApiProperty({ example: 'dapsimni-to-hongik' })
  journeyId: string;

  @ApiProperty({
    type: JourneyOriginStationResDto,
  })
  origin: JourneyOriginStationResDto;

  @ApiProperty({
    type: JourneyDestinationStationResDto,
  })
  destination: JourneyDestinationStationResDto;

  @ApiProperty({ example: '2026-09-17.t02.1' })
  dataVersion: string;

  @ApiProperty({ format: 'date', example: '2026-09-17' })
  verifiedAt: string;

  @ApiProperty({
    nullable: true,
    example: 'transfer-at-ddp',
    description: '모든 필수 시설이 운행 중인 최우선 경로. 없으면 null',
  })
  recommendedRouteId: string | null;

  @ApiProperty({
    example: '현재 확인된 필수 승강기가 모두 운행 중인 우선 경로입니다.',
  })
  selectionReason: string;

  @ApiProperty({ format: 'date-time' })
  statusCheckedAt: string;

  @ApiProperty({ example: 60 })
  maxSourceDelayMinutes: number;

  @ApiProperty({
    example:
      '승강기 상태는 최대 1시간 지연될 수 있으며, 시설 연결이 확인되지 않으면 unknown으로 표시합니다.',
  })
  notice: string;

  @ApiProperty({ type: [JourneyRouteCandidateResDto] })
  candidates: JourneyRouteCandidateResDto[];
}
