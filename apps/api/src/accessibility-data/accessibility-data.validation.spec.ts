import {
  accessibilityDataPackageSchema,
  JOURNEY_ERROR_CODE,
  validateAccessibilityDataPackage,
} from '@elbero/contracts';

describe('validateAccessibilityDataPackage', () => {
  it('유효한 버전 패키지를 그대로 승인한다', () => {
    const result = validateAccessibilityDataPackage(validPackage());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.meta.dataVersion).toBe('2026-09-29.t10.test');
    expect(result.data.report.quarantinedCount).toBe(0);
    expect(
      accessibilityDataPackageSchema.safeParse(result.data.dataPackage).success,
    ).toBe(true);
  });

  it('형식이 깨진 레코드만 격리하고 경고 envelope를 반환한다', () => {
    const input = validPackage();
    input.stations.push({ id: '', name: '', aliases: [], evidence: [] });

    const result = validateAccessibilityDataPackage(input);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.dataPackage.stations).toHaveLength(2);
    expect(result.data.report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          collection: 'stations',
          kind: 'invalid_shape',
        }),
      ]),
    );
    expect(result.warnings[0].code).toBe(JOURNEY_ERROR_CODE.DATA_MISSING);
  });

  it('끊어진 참조와 이에 의존하는 레코드를 격리한다', () => {
    const input = validPackage();
    input.facilities[0].servedPlaceIds = ['place:missing'];

    const result = validateAccessibilityDataPackage(input);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.dataPackage.facilities).toHaveLength(0);
    expect(result.data.dataPackage.statusObservations).toHaveLength(0);
    expect(result.data.report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          collection: 'facilities',
          entityId: 'facility:1',
          kind: 'broken_reference',
        }),
      ]),
    );
  });

  it('버전 정보가 없으면 실제 오류 envelope를 반환한다', () => {
    const input = validPackage() as Record<string, unknown>;
    delete input.dataVersion;

    const result = validateAccessibilityDataPackage(input);

    expect(result).toMatchObject({
      ok: false,
      error: { code: JOURNEY_ERROR_CODE.DATA_MISSING },
      meta: { dataVersion: null },
    });
  });
});

function validPackage() {
  return {
    schemaVersion: 1,
    dataVersion: '2026-09-29.t10.test',
    generatedAt: '2026-09-29T00:00:00.000Z',
    lines: [
      {
        id: 'line:5',
        operatorCode: 'S1',
        sourceLineCode: '5',
        name: '5호선',
        evidence: [],
      },
    ],
    stations: [
      { id: 'station:1', name: '출발', aliases: [], evidence: [] },
      { id: 'station:2', name: '도착', aliases: [], evidence: [] },
    ],
    stationLines: [
      {
        id: 'station-line:1',
        stationId: 'station:1',
        lineId: 'line:5',
        sourceStationCode: '1',
        sequence: 1,
        previousStationLineId: null,
        nextStationLineId: 'station-line:2',
        evidence: [],
      },
      {
        id: 'station-line:2',
        stationId: 'station:2',
        lineId: 'line:5',
        sourceStationCode: '2',
        sequence: 2,
        previousStationLineId: 'station-line:1',
        nextStationLineId: null,
        evidence: [],
      },
    ],
    platforms: [],
    places: [
      {
        id: 'place:1',
        stationLineId: 'station-line:1',
        type: 'concourse' as const,
        name: '대합실',
        floor: 'B1',
        exitNumber: null,
        platformId: null,
        evidence: [],
      },
    ],
    facilities: [
      {
        id: 'facility:1',
        stationLineId: 'station-line:1',
        type: 'elevator' as const,
        name: '엘리베이터',
        operatingSection: 'B1-1F',
        locationDescription: null,
        servedPlaceIds: ['place:1'],
        evidence: [],
      },
    ],
    boardingPoints: [],
    paths: [],
    pathSegments: [],
    statusObservations: [
      {
        id: 'status:1',
        facilityId: 'facility:1',
        status: 'operational' as const,
        sourceStatus: '사용가능',
        observedAt: null,
        collectedAt: '2026-09-29T00:00:00.000Z',
        expiresAt: null,
        evidence: [],
      },
    ],
    unmappedSourceRecords: [],
  };
}
