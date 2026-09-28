import { UnprocessableEntityException } from '@nestjs/common';
import { ElevatorStatusClient } from '../elevator-status/elevator-status.client.js';
import { ELEVATOR_STATUS } from '../elevator-status/types/seoul-elevator-status.type.js';
import { VERIFIED_JOURNEYS } from './data/verified-journeys.data.js';
import { JourneyService } from './journey.service.js';
import { createLine5JourneyDefinition } from './line-5-journey.factory.js';

describe('JourneyService', () => {
  const getSnapshot = vi.fn();
  const client = { getSnapshot } as unknown as ElevatorStatusClient;
  const service = new JourneyService(client);

  beforeEach(() => {
    getSnapshot.mockReset();
  });

  it('답십리→강동에서 현장 확인된 1번 출구만 사용한다', async () => {
    getSnapshot.mockResolvedValue(snapshotForJourney('dapsimni-to-gangdong'));

    const result = await service.plan('2543', '2549');

    expect(result.recommendedRouteId).toBe('line-5-direct');
    expect(result.candidates[0].status).toBe(ELEVATOR_STATUS.OPERATIONAL);
    expect(result.candidates[0].steps[4].platformGap).toEqual({
      distanceCm: 9,
      level: 'green',
      label: '안전',
    });

    const surfaceGroup = result.candidates[0].facilityGroups.find(
      (group) => group.id === 'gangdong-surface',
    );
    expect(surfaceGroup?.status).toBe(ELEVATOR_STATUS.OPERATIONAL);
    expect(surfaceGroup?.facilities).toHaveLength(1);
    expect(result.candidates[0].steps[6].instruction).not.toContain('2-1번');
  });

  it('답십리→굽은다리는 2번 출구 실시간 상태를 연결해 추천한다', async () => {
    getSnapshot.mockResolvedValue(
      snapshotForJourney('dapsimni-to-gubeundari'),
    );

    const result = await service.plan('2543', '2551');

    expect(result.recommendedRouteId).toBe('line-5-hanam-branch');
    expect(result.candidates[0].status).toBe(ELEVATOR_STATUS.OPERATIONAL);
    expect(result.candidates[0].blockingReasons).toEqual([]);

    const platformGroup = result.candidates[0].facilityGroups.find(
      (group) => group.id === 'gubeundari-platform',
    );
    const surfaceGroup = result.candidates[0].facilityGroups.find(
      (group) => group.id === 'gubeundari-surface',
    );
    expect(platformGroup?.status).toBe(ELEVATOR_STATUS.OPERATIONAL);
    expect(surfaceGroup?.facilities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'gubeundari-exit-2',
          status: ELEVATOR_STATUS.OPERATIONAL,
          matchStatus: 'verified',
        }),
      ]),
    );
    expect(result.candidates[0].steps[3].instruction).toContain('3호차 2번 문');
    expect(result.candidates[0].steps[5].instruction).toContain('2번 출구');
    expect(result.candidates[0].steps[3].platformGap).toEqual({
      distanceCm: 9,
      level: 'green',
      label: '안전',
    });
  });

  it('동대문역사문화공원 필수 승강기가 보수중이면 을지로4가를 추천한다', async () => {
    const snapshot = snapshotForJourney('dapsimni-to-hongik');
    const brokenElevator = snapshot.rows.find(
      (row) =>
        row.ELVTR_NM === '승강기)엘리베이터-동역사(5) 내부2',
    );
    brokenElevator!.USE_YN = '보수중';
    getSnapshot.mockResolvedValue(snapshot);

    const result = await service.plan('2543', '239');

    expect(result.recommendedRouteId).toBe('transfer-at-euljiro4');
    expect(result.candidates[0]).toMatchObject({
      id: 'transfer-at-ddp',
      status: ELEVATOR_STATUS.OUT_OF_SERVICE,
      recommended: false,
    });
    expect(result.candidates[1]).toMatchObject({
      id: 'transfer-at-euljiro4',
      status: ELEVATOR_STATUS.OPERATIONAL,
      recommended: true,
    });
    expect(result.selectionReason).toContain('을지로4가 환승 경로를 선택');
  });

  it('필수 시설 연결이 사라지면 정상으로 추정하지 않고 추천을 중단한다', async () => {
    const snapshot = snapshotForJourney('dapsimni-to-gangdong');
    snapshot.rows = snapshot.rows.filter(
      (row) => row.ELVTR_NM !== '승강기)엘리베이터-답십리 내부2',
    );
    getSnapshot.mockResolvedValue(snapshot);

    const result = await service.plan('2543', '2549');

    expect(result.recommendedRouteId).toBeNull();
    expect(result.candidates[0].status).toBe(ELEVATOR_STATUS.UNKNOWN);
    expect(result.selectionReason).toContain('안전하게 추천할 경로가 없습니다');
  });

  it('검증되지 않은 역 조합은 UNSUPPORTED_JOURNEY로 거절한다', async () => {
    await expect(service.plan('2543', '9999')).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
    expect(getSnapshot).not.toHaveBeenCalled();
  });

  it('하드코딩되지 않은 5호선 역 조합도 일반 경로를 반환한다', async () => {
    getSnapshot.mockResolvedValue({
      checkedAt: '2026-09-28T00:00:00.000Z',
      expiresAt: Date.now() + 60_000,
      rows: [],
    });

    const result = await service.plan('2534', '2558');

    expect(result.journeyId).toBe('line-5-2534-to-2558');
    expect(result.candidates[0]).toMatchObject({
      id: 'line-5-general-route',
      status: ELEVATOR_STATUS.UNKNOWN,
      recommended: false,
    });
    expect(result.recommendedRouteId).toBeNull();
    expect(result.candidates[0].steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'train',
          instruction: expect.stringContaining('5호차 1번 문'),
        }),
      ]),
    );
  });

  it('동적 5호선 경로도 검증된 서울 승강기 행과 연결해 현재 상태를 평가한다', async () => {
    const journey = createLine5JourneyDefinition('2534', '2558')!;
    getSnapshot.mockResolvedValue(snapshotForDefinition(journey));

    const result = await service.plan('2534', '2558');

    expect(result.recommendedRouteId).toBe('line-5-general-route');
    expect(result.candidates[0].status).toBe(ELEVATOR_STATUS.OPERATIONAL);
    expect(result.candidates[0].facilityGroups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          status: ELEVATOR_STATUS.OPERATIONAL,
        }),
      ]),
    );
  });
});

function snapshotForJourney(journeyId: string) {
  const journey = VERIFIED_JOURNEYS.find((item) => item.id === journeyId)!;
  return snapshotForDefinition(journey);
}

function snapshotForDefinition(
  journey: NonNullable<ReturnType<typeof createLine5JourneyDefinition>>,
) {
  const uniqueFacilities = new Map<
    string,
    (typeof journey.candidates)[number]['facilityGroups'][number]['facilities'][number]
  >();

  for (const candidate of journey.candidates) {
    for (const group of candidate.facilityGroups) {
      for (const facility of group.facilities) {
        if (facility.sourceFacilityName) {
          uniqueFacilities.set(
            `${facility.stationCode}:${facility.sourceFacilityName}`,
            facility,
          );
        }
      }
    }
  }

  return {
    checkedAt: '2026-09-17T12:00:00.000Z',
    expiresAt: Date.now() + 60_000,
    rows: [...uniqueFacilities.values()].map((facility) => ({
      STN_CD: facility.stationCode,
      STN_NM: facility.stationName,
      ELVTR_NM: facility.sourceFacilityName!,
      OPR_SEC: facility.expectedOperatingSection!,
      INSTL_PSTN: facility.expectedLocation!,
      USE_YN: '사용가능',
      ELVTR_SE: 'EV',
    })),
  };
}
