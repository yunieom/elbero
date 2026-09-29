import { JOURNEY_ERROR_CODE } from '@elbero/contracts';
import { ELEVATOR_STATUS } from '../elevator-status/types/seoul-elevator-status.type.js';
import { JourneyRouteEngine } from './journey-route-engine.service.js';
import type {
  VerifiedJourneyDefinition,
  VerifiedRouteCandidate,
} from './types/verified-journey.type.js';

describe('JourneyRouteEngine', () => {
  const engine = new JourneyRouteEngine();

  it('지상에서 목적지 지상까지 완성된 경로와 데이터 버전을 반환한다', () => {
    const result = engine.plan(
      definition(),
      snapshot('사용가능', '사용가능'),
      'request-1',
    );

    expect(result).toMatchObject({
      ok: true,
      data: { recommendedRouteId: 'primary' },
      warnings: [],
      meta: { requestId: 'request-1', dataVersion: '2026-09-29.t11.test' },
    });
  });

  it('우선 경로 승강기 운행 중지 시 대체 환승 경로를 선택한다', () => {
    const result = engine.plan(
      definition(),
      snapshot('보수중', '사용가능'),
      'request-2',
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.recommendedRouteId).toBe('alternate');
    expect(result.data.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'primary',
          status: ELEVATOR_STATUS.OUT_OF_SERVICE,
        }),
        expect.objectContaining({
          id: 'alternate',
          status: ELEVATOR_STATUS.OPERATIONAL,
        }),
      ]),
    );
  });

  it('모든 후보의 필수 승강기가 중지되면 NO_ACCESSIBLE_ROUTE를 반환한다', () => {
    const result = engine.plan(
      definition(),
      snapshot('보수중', '보수중'),
      'request-3',
    );

    expect(result).toMatchObject({
      ok: false,
      error: { code: JOURNEY_ERROR_CODE.NO_ACCESSIBLE_ROUTE },
      meta: { dataVersion: '2026-09-29.t11.test' },
    });
  });

  it('시설 연결 정보가 없으면 실패로 추정하지 않고 데이터 부족 warning을 반환한다', () => {
    const result = engine.plan(definition(), snapshot(null, null), 'request-4');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.recommendedRouteId).toBeNull();
    expect(result.warnings.map((warning) => warning.code)).toEqual([
      JOURNEY_ERROR_CODE.DATA_MISSING,
      JOURNEY_ERROR_CODE.FACILITY_STATUS_UNKNOWN,
    ]);
  });
});

function definition(): VerifiedJourneyDefinition {
  return {
    id: 'fixture-journey',
    originStationCode: '1000',
    originStationName: '출발역',
    destinationStationCode: '2000',
    destinationStationName: '도착역',
    dataVersion: '2026-09-29.t11.test',
    verifiedAt: '2026-09-29',
    candidates: [candidate('primary', 1, 'A'), candidate('alternate', 2, 'B')],
  };
}

function candidate(
  id: string,
  priority: number,
  facilityName: string,
): VerifiedRouteCandidate {
  return {
    id,
    label: `${id} 환승`,
    priority,
    transferStation: `${id}역`,
    lines: ['5호선', '2호선'],
    facilityGroups: [
      {
        id: `${id}-group`,
        label: `${id} 필수 승강기`,
        policy: 'all',
        facilities: [
          {
            id: `${id}-facility`,
            stationCode: priority === 1 ? '1000' : '2000',
            stationName: `${id}역`,
            role: '환승 필수 승강기',
            sourceFacilityName: facilityName,
            expectedOperatingSection: 'B1-B2',
            expectedLocation: '승강장',
          },
        ],
      },
    ],
    steps: [
      {
        order: 1,
        type: 'entry',
        stationName: '출발역',
        instruction: '지상 엘리베이터로 역사에 진입하세요.',
        evidence: 'fixture',
      },
      {
        order: 2,
        type: 'exit',
        stationName: '도착역',
        instruction: '지상 엘리베이터로 역에서 나오세요.',
        evidence: 'fixture',
      },
    ],
  };
}

function snapshot(
  primaryStatus: string | null,
  alternateStatus: string | null,
) {
  const rows = [
    primaryStatus === null ? null : row('1000', 'A', primaryStatus),
    alternateStatus === null ? null : row('2000', 'B', alternateStatus),
  ].filter((item): item is ReturnType<typeof row> => item !== null);
  return {
    checkedAt: '2026-09-29T00:00:00.000Z',
    expiresAt: Date.now() + 60_000,
    rows,
  };
}

function row(stationCode: string, facilityName: string, status: string) {
  return {
    STN_CD: stationCode,
    STN_NM: `${stationCode}역`,
    ELVTR_NM: facilityName,
    OPR_SEC: 'B1-B2',
    INSTL_PSTN: '승강장',
    USE_YN: status,
    ELVTR_SE: 'EV',
  };
}
