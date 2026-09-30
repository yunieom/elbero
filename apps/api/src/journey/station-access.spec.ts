import { attachStationAccessDetails } from './station-access.js';
import type { VerifiedRouteCandidate } from './types/verified-journey.type.js';

describe('attachStationAccessDetails', () => {
  it('출발 진입과 도착 퇴장을 각각의 시설 층 구간으로 구성한다', () => {
    const steps = attachStationAccessDetails(candidate(), '2026-09-30');

    expect(steps.map((step) => step.stationAccess?.phase ?? null)).toEqual([
      'entry',
      'entry',
      'entry',
      null,
      'exit',
      'exit',
      'exit',
    ]);
    expect(steps[0].stationAccess).toMatchObject({
      kind: 'surface_elevator',
      fromFloor: '1F',
      toFloor: 'B2',
      facilityIds: ['origin-surface-elevator'],
    });
    expect(steps[2].stationAccess).toMatchObject({
      kind: 'platform_elevator',
      fromFloor: 'B2',
      toFloor: 'B3',
      location: '을지로입구 방면5-3',
      direction: '을지로입구 방면',
    });
    expect(steps[4].stationAccess).toMatchObject({
      kind: 'platform_elevator',
      fromFloor: 'B3',
      toFloor: 'B1',
      facilityIds: ['destination-platform-elevator'],
    });
    expect(steps[6].stationAccess).toMatchObject({
      kind: 'surface_elevator',
      fromFloor: 'B1',
      toFloor: '1F',
      facilityIds: ['destination-surface-elevator'],
      verifiedAt: '2026-09-30',
    });
  });
});

function candidate(): VerifiedRouteCandidate {
  return {
    id: 'station-access-fixture',
    label: '역사 내부 이동 fixture',
    priority: 1,
    transferStation: null,
    lines: ['5호선'],
    facilityGroups: [
      facilityGroup('origin-surface', 'origin-surface-elevator', 'B2-1F'),
      facilityGroup(
        'origin-platform',
        'origin-platform-elevator',
        'B2-B3',
        '충정로 방면6-2, 을지로입구 방면5-3',
      ),
      facilityGroup(
        'destination-platform',
        'destination-platform-elevator',
        'B1-B3',
      ),
      facilityGroup(
        'destination-surface',
        'destination-surface-elevator',
        'B1-1F',
      ),
    ],
    steps: [
      step(1, 'entry', '출발역', 'origin-surface'),
      step(2, 'gate', '출발역'),
      {
        ...step(3, 'elevator', '출발역', 'origin-platform'),
        instruction: '을지로입구 방면 승강장 엘리베이터를 이용하세요.',
      },
      {
        ...step(4, 'train', '출발역'),
        trainSegment: {
          lineName: '5호선',
          direction: '도착역 방면',
          originStationName: '출발역',
          destinationStationName: '도착역',
          boardingPosition: null,
          alightingPosition: null,
          positionBasis: 'unverified',
        },
      },
      step(5, 'elevator', '도착역', 'destination-platform'),
      step(6, 'gate', '도착역'),
      step(7, 'exit', '도착역', 'destination-surface'),
    ],
  };
}

function facilityGroup(
  id: string,
  facilityId: string,
  section: string,
  location = 'fixture 위치',
) {
  return {
    id,
    label: `${id} 승강기`,
    policy: 'all' as const,
    facilities: [
      {
        id: facilityId,
        stationCode: '0000',
        stationName: id.startsWith('origin') ? '출발역' : '도착역',
        role: 'fixture',
        sourceFacilityName: facilityId,
        expectedOperatingSection: section,
        expectedLocation: location,
      },
    ],
  };
}

function step(
  order: number,
  type: 'entry' | 'gate' | 'elevator' | 'train' | 'exit',
  stationName: string,
  facilityGroupId?: string,
) {
  return {
    order,
    type,
    stationName,
    instruction: `${stationName} ${type} 안내`,
    ...(facilityGroupId ? { facilityGroupId } : {}),
    evidence: 'fixture source',
  };
}
