import {
  createAirportRailroadJourneyDefinition,
  getAirportRailroadDistance,
  hasAirportRailroadStation,
} from './airport-railroad-journey.factory.js';
import {
  createEverlineJourneyDefinition,
  getEverlineDistance,
  hasEverlineStation,
} from './everline-journey.factory.js';
import {
  createGimpoGoldlineJourneyDefinition,
  getGimpoGoldlineDistance,
  hasGimpoGoldlineStation,
} from './gimpo-goldline-journey.factory.js';
import {
  createLine2JourneyDefinition,
  getLine2Distance,
  hasLine2Station,
} from './line-2-journey.factory.js';
import {
  createLine1JourneyDefinition,
  getLine1Distance,
  hasLine1Station,
} from './line-1-journey.factory.js';
import {
  createLine3JourneyDefinition,
  getLine3Distance,
  hasLine3Station,
} from './line-3-journey.factory.js';
import {
  createLine4JourneyDefinition,
  getLine4Distance,
  hasLine4Station,
} from './line-4-journey.factory.js';
import {
  createLine5JourneyDefinition,
  getLine5Distance,
  hasLine5Station,
} from './line-5-journey.factory.js';
import {
  createLine7JourneyDefinition,
  getLine7Distance,
  hasLine7Station,
} from './line-7-journey.factory.js';
import {
  createSillimLineJourneyDefinition,
  getSillimLineDistance,
  hasSillimLineStation,
} from './sillim-line-journey.factory.js';
import {
  JOURNEY_STEP_TYPE,
  type FacilityRequirementGroup,
  type VerifiedJourneyDefinition,
  type VerifiedJourneyStep,
  type VerifiedRouteCandidate,
} from './types/verified-journey.type.js';

type SupportedLineId =
  '1' | '2' | '3' | '4' | '5' | '7' | 'A1' | 'E1' | 'G1' | 'L1';

interface LineAdapter {
  lineName: string;
  hasStation: (stationCode: string) => boolean;
  distance: (
    originStationCode: string,
    destinationStationCode: string,
  ) => number | null;
  create: (
    originStationCode: string,
    destinationStationCode: string,
  ) => VerifiedJourneyDefinition | null;
}

interface Interchange {
  stationName: string;
  stationCodes: Partial<Record<SupportedLineId, string>>;
  accessibilityVerified: boolean;
}

const adapters: Record<SupportedLineId, LineAdapter> = {
  '1': {
    lineName: '1호선',
    hasStation: hasLine1Station,
    distance: getLine1Distance,
    create: createLine1JourneyDefinition,
  },
  '2': {
    lineName: '2호선',
    hasStation: hasLine2Station,
    distance: getLine2Distance,
    create: createLine2JourneyDefinition,
  },
  '3': {
    lineName: '3호선',
    hasStation: hasLine3Station,
    distance: getLine3Distance,
    create: createLine3JourneyDefinition,
  },
  '4': {
    lineName: '4호선',
    hasStation: hasLine4Station,
    distance: getLine4Distance,
    create: createLine4JourneyDefinition,
  },
  '5': {
    lineName: '5호선',
    hasStation: hasLine5Station,
    distance: getLine5Distance,
    create: createLine5JourneyDefinition,
  },
  '7': {
    lineName: '7호선',
    hasStation: hasLine7Station,
    distance: getLine7Distance,
    create: createLine7JourneyDefinition,
  },
  A1: {
    lineName: '공항철도',
    hasStation: hasAirportRailroadStation,
    distance: getAirportRailroadDistance,
    create: createAirportRailroadJourneyDefinition,
  },
  E1: {
    lineName: '용인에버라인',
    hasStation: hasEverlineStation,
    distance: getEverlineDistance,
    create: createEverlineJourneyDefinition,
  },
  G1: {
    lineName: '김포골드라인',
    hasStation: hasGimpoGoldlineStation,
    distance: getGimpoGoldlineDistance,
    create: createGimpoGoldlineJourneyDefinition,
  },
  L1: {
    lineName: '신림선',
    hasStation: hasSillimLineStation,
    distance: getSillimLineDistance,
    create: createSillimLineJourneyDefinition,
  },
};

const interchanges: readonly Interchange[] = [
  {
    stationName: '서울역',
    stationCodes: { '1': 'S10150', '4': '0426', A1: 'A01' },
    accessibilityVerified: false,
  },
  {
    stationName: '시청',
    stationCodes: { '1': 'S10151', '2': '0201' },
    accessibilityVerified: false,
  },
  {
    stationName: '신설동',
    stationCodes: { '1': 'S10156', '2': '0246' },
    accessibilityVerified: false,
  },
  {
    stationName: '동대문',
    stationCodes: { '1': 'S10155', '4': '0421' },
    accessibilityVerified: false,
  },
  {
    stationName: '창동',
    stationCodes: { '1': 'KR0116', '4': '0412' },
    accessibilityVerified: false,
  },
  {
    stationName: '도봉산',
    stationCodes: { '1': 'KR0113', '7': '2714' },
    accessibilityVerified: false,
  },
  {
    stationName: '신길',
    stationCodes: { '1': 'KR0138', '5': '2526' },
    accessibilityVerified: false,
  },
  {
    stationName: '신도림',
    stationCodes: { '1': 'KR0140', '2': '0234' },
    accessibilityVerified: false,
  },
  {
    stationName: '온수',
    stationCodes: { '1': 'KR0145', '7': '2752' },
    accessibilityVerified: false,
  },
  {
    stationName: '가산디지털단지',
    stationCodes: { '1': 'KRP142', '7': '2748' },
    accessibilityVerified: false,
  },
  {
    stationName: '홍대입구',
    stationCodes: { '2': '0239', A1: 'A03' },
    accessibilityVerified: false,
  },
  {
    stationName: '공덕',
    stationCodes: { '5': '2530', A1: 'A02' },
    accessibilityVerified: false,
  },
  {
    stationName: '동대문역사문화공원',
    stationCodes: { '2': '0205', '4': '0422', '5': '2537' },
    accessibilityVerified: false,
  },
  {
    stationName: '사당',
    stationCodes: { '2': '0226', '4': '0433' },
    accessibilityVerified: false,
  },
  {
    stationName: '충무로',
    stationCodes: { '3': '0321', '4': '0423' },
    accessibilityVerified: false,
  },
  {
    stationName: '노원',
    stationCodes: { '4': '0411', '7': '2715' },
    accessibilityVerified: false,
  },
  {
    stationName: '총신대입구(이수)',
    stationCodes: { '4': '0432', '7': '2737' },
    accessibilityVerified: false,
  },
  {
    stationName: '을지로3가',
    stationCodes: { '2': '0203', '3': '0320' },
    accessibilityVerified: false,
  },
  {
    stationName: '교대',
    stationCodes: { '2': '0223', '3': '0330' },
    accessibilityVerified: false,
  },
  {
    stationName: '종로3가',
    stationCodes: { '1': 'S10153', '3': '0319', '5': '2535' },
    accessibilityVerified: false,
  },
  {
    stationName: '오금',
    stationCodes: { '3': '0342', '5': '2558' },
    accessibilityVerified: false,
  },
  {
    stationName: '고속터미널',
    stationCodes: { '3': '0329', '7': '2736' },
    accessibilityVerified: false,
  },
  {
    stationName: '충정로',
    stationCodes: { '2': '0243', '5': '2532' },
    accessibilityVerified: false,
  },
  {
    stationName: '을지로4가',
    stationCodes: { '2': '0204', '5': '2536' },
    accessibilityVerified: false,
  },
  {
    stationName: '왕십리',
    stationCodes: { '2': '0208', '5': '2541' },
    accessibilityVerified: false,
  },
  {
    stationName: '건대입구',
    stationCodes: { '2': '0212', '7': '2729' },
    accessibilityVerified: false,
  },
  {
    stationName: '대림',
    stationCodes: { '2': '0233', '7': '2746' },
    accessibilityVerified: false,
  },
  {
    stationName: '군자',
    stationCodes: { '5': '2545', '7': '2727' },
    accessibilityVerified: true,
  },
  {
    stationName: '김포공항',
    stationCodes: { '5': '2513', A1: 'A05', G1: 'G109' },
    accessibilityVerified: false,
  },
  {
    stationName: '신림',
    stationCodes: { '2': '0230', L1: 'S408' },
    accessibilityVerified: false,
  },
  {
    stationName: '보라매',
    stationCodes: { '7': '2744', L1: 'S404' },
    accessibilityVerified: false,
  },
];

export function createInterlineJourneyDefinition(
  originStationCode: string,
  destinationStationCode: string,
): VerifiedJourneyDefinition | null {
  const originLine = findLine(originStationCode);
  const destinationLine = findLine(destinationStationCode);
  if (!originLine || !destinationLine || originLine === destinationLine) {
    return null;
  }

  const options = interchanges
    .flatMap((interchange) => {
      const originTransferCode = interchange.stationCodes[originLine];
      const destinationTransferCode = interchange.stationCodes[destinationLine];
      if (!originTransferCode || !destinationTransferCode) return [];
      const firstDistance = adapters[originLine].distance(
        originStationCode,
        originTransferCode,
      );
      const secondDistance = adapters[destinationLine].distance(
        destinationTransferCode,
        destinationStationCode,
      );
      if (firstDistance === null || secondDistance === null) return [];
      return [
        {
          interchange,
          originTransferCode,
          destinationTransferCode,
          totalDistance: firstDistance + secondDistance,
          requiresTransfer: firstDistance > 0 && secondDistance > 0,
        },
      ];
    })
    .sort(
      (left, right) =>
        Number(left.requiresTransfer) - Number(right.requiresTransfer) ||
        left.totalDistance - right.totalDistance ||
        left.interchange.stationName.localeCompare(
          right.interchange.stationName,
          'ko',
        ),
    );

  const built = options.flatMap((option, index) => {
    const result = buildCandidate(
      originStationCode,
      destinationStationCode,
      originLine,
      destinationLine,
      option,
      index + 1,
    );
    return result ? [result] : [];
  });
  if (built.length === 0) return null;

  return {
    id: `interline-${originLine}-${destinationLine}-${originStationCode}-to-${destinationStationCode}`,
    originStationCode,
    originStationName: built[0].originStationName,
    destinationStationCode,
    destinationStationName: built[0].destinationStationName,
    dataVersion: [...new Set(built.map((item) => item.dataVersion))].join('+'),
    verifiedAt: built
      .map((item) => item.verifiedAt)
      .sort()
      .at(-1)!,
    candidates: built.map((item) => item.candidate),
  };
}

function buildCandidate(
  originStationCode: string,
  destinationStationCode: string,
  originLine: SupportedLineId,
  destinationLine: SupportedLineId,
  option: {
    interchange: Interchange;
    originTransferCode: string;
    destinationTransferCode: string;
    totalDistance: number;
    requiresTransfer: boolean;
  },
  priority: number,
) {
  const first =
    originStationCode === option.originTransferCode
      ? null
      : adapters[originLine].create(
          originStationCode,
          option.originTransferCode,
        );
  const second =
    destinationStationCode === option.destinationTransferCode
      ? null
      : adapters[destinationLine].create(
          option.destinationTransferCode,
          destinationStationCode,
        );
  if (!first && !second) return null;

  if (!first) {
    const candidate = second!.candidates[0];
    return {
      originStationName: option.interchange.stationName,
      destinationStationName: second!.destinationStationName,
      dataVersion: second!.dataVersion,
      verifiedAt: second!.verifiedAt,
      candidate: {
        ...candidate,
        id: `board-${destinationLine}-at-${slug(option.interchange.stationName)}`,
        label: `${option.interchange.stationName}에서 ${adapters[destinationLine].lineName} 탑승`,
        priority,
        transferStation: null,
      },
    };
  }

  if (!second) {
    const candidate = first.candidates[0];
    return {
      originStationName: first.originStationName,
      destinationStationName: option.interchange.stationName,
      dataVersion: first.dataVersion,
      verifiedAt: first.verifiedAt,
      candidate: {
        ...candidate,
        id: `exit-${originLine}-at-${slug(option.interchange.stationName)}`,
        label: `${adapters[originLine].lineName}으로 ${option.interchange.stationName} 도착`,
        priority,
        transferStation: null,
      },
    };
  }

  const firstCandidate = first.candidates[0];
  const secondCandidate = second.candidates[0];
  const facilityGroups = [
    ...withoutSurfaceGroup(
      firstCandidate.facilityGroups,
      option.interchange.stationName,
    ),
    ...withoutSurfaceGroup(
      secondCandidate.facilityGroups,
      option.interchange.stationName,
    ),
  ];
  let transferGroupId: string | undefined;
  if (!option.interchange.accessibilityVerified) {
    const transferGroup = createUnverifiedTransferGroup(
      option.interchange,
      option.originTransferCode,
      originLine,
      destinationLine,
    );
    facilityGroups.push(transferGroup);
    transferGroupId = transferGroup.id;
  }

  const steps = renumber([
    ...throughLastTrain(firstCandidate.steps),
    {
      order: 0,
      type: JOURNEY_STEP_TYPE.TRANSFER,
      stationName: option.interchange.stationName,
      instruction: `${option.interchange.stationName}에서 ${adapters[destinationLine].lineName} 열차로 갈아타세요. 승강장 엘리베이터와 환승 표지를 이용하세요.`,
      ...(transferGroupId ? { facilityGroupId: transferGroupId } : {}),
      evidence: option.interchange.accessibilityVerified
        ? '검증된 환승역 연결값'
        : '노선 연결 확인 · 방향별 엘리베이터 환승 이동동선 미확인',
    },
    ...fromFirstTrain(secondCandidate.steps),
  ]);

  const candidate: VerifiedRouteCandidate = {
    id: `transfer-at-${slug(option.interchange.stationName)}`,
    label: `${option.interchange.stationName} 환승 · ${option.totalDistance}개 역`,
    priority,
    transferStation: option.interchange.stationName,
    lines: [adapters[originLine].lineName, adapters[destinationLine].lineName],
    facilityGroups,
    steps,
  };
  return {
    originStationName: first.originStationName,
    destinationStationName: second.destinationStationName,
    dataVersion: `${first.dataVersion}+${second.dataVersion}`,
    verifiedAt:
      first.verifiedAt > second.verifiedAt
        ? first.verifiedAt
        : second.verifiedAt,
    candidate,
  };
}

function findLine(stationCode: string): SupportedLineId | null {
  return (
    (Object.entries(adapters) as Array<[SupportedLineId, LineAdapter]>).find(
      ([, adapter]) => adapter.hasStation(stationCode),
    )?.[0] ?? null
  );
}

function throughLastTrain(steps: readonly VerifiedJourneyStep[]) {
  const lastTrainIndex = steps.findLastIndex(
    (step) => step.type === JOURNEY_STEP_TYPE.TRAIN,
  );
  return steps.slice(0, lastTrainIndex + 1);
}

function fromFirstTrain(steps: readonly VerifiedJourneyStep[]) {
  const firstTrainIndex = steps.findIndex(
    (step) => step.type === JOURNEY_STEP_TYPE.TRAIN,
  );
  return firstTrainIndex === -1 ? [] : steps.slice(firstTrainIndex);
}

function withoutSurfaceGroup(
  groups: readonly FacilityRequirementGroup[],
  transferStationName: string,
) {
  return groups.filter(
    (group) =>
      !(
        group.label.includes(transferStationName) &&
        group.label.includes('지상')
      ),
  );
}

function createUnverifiedTransferGroup(
  interchange: Interchange,
  stationCode: string,
  originLine: SupportedLineId,
  destinationLine: SupportedLineId,
): FacilityRequirementGroup {
  const id = `transfer-${originLine}-${destinationLine}-${stationCode}-unverified`;
  return {
    id,
    label: `${interchange.stationName} 방향별 엘리베이터 환승 경로`,
    policy: 'all',
    facilities: [
      {
        id,
        stationCode,
        stationName: interchange.stationName,
        role: `${adapters[originLine].lineName}에서 ${adapters[destinationLine].lineName} 환승`,
        sourceFacilityName: null,
        expectedOperatingSection: null,
        expectedLocation: null,
      },
    ],
  };
}

function renumber(steps: VerifiedJourneyStep[]) {
  return steps.map((step, index) => ({ ...step, order: index + 1 }));
}

function slug(value: string) {
  return value.replace(/[^0-9a-z가-힣]+/giu, '-');
}
