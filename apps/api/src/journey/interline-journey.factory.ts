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
  createLine6JourneyDefinition,
  getLine6Distance,
  hasLine6Station,
} from './line-6-journey.factory.js';
import {
  createLine7JourneyDefinition,
  getLine7Distance,
  hasLine7Station,
} from './line-7-journey.factory.js';
import {
  createLine8JourneyDefinition,
  getLine8Distance,
  hasLine8Station,
} from './line-8-journey.factory.js';
import {
  createLine9JourneyDefinition,
  getLine9Distance,
  hasLine9Station,
} from './line-9-journey.factory.js';
import {
  createSillimLineJourneyDefinition,
  getSillimLineDistance,
  hasSillimLineStation,
} from './sillim-line-journey.factory.js';
import {
  createShinbundangLineJourneyDefinition,
  getShinbundangLineDistance,
  hasShinbundangLineStation,
} from './shinbundang-line-journey.factory.js';
import {
  createGtxAJourneyDefinition,
  getGtxADistance,
  hasGtxAStation,
} from './gtx-a-journey.factory.js';
import {
  createSuinBundangLineJourneyDefinition,
  getSuinBundangLineDistance,
  hasSuinBundangLineStation,
} from './suin-bundang-line-journey.factory.js';
import {
  JOURNEY_STEP_TYPE,
  type FacilityRequirementGroup,
  type VerifiedJourneyDefinition,
  type VerifiedJourneyStep,
  type VerifiedRouteCandidate,
} from './types/verified-journey.type.js';

type SupportedLineId =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'A1'
  | 'E1'
  | 'G1'
  | 'L1'
  | 'D1'
  | 'K'
  | 'A';

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
  '6': {
    lineName: '6호선',
    hasStation: hasLine6Station,
    distance: getLine6Distance,
    create: createLine6JourneyDefinition,
  },
  '7': {
    lineName: '7호선',
    hasStation: hasLine7Station,
    distance: getLine7Distance,
    create: createLine7JourneyDefinition,
  },
  '8': {
    lineName: '8호선',
    hasStation: hasLine8Station,
    distance: getLine8Distance,
    create: createLine8JourneyDefinition,
  },
  '9': {
    lineName: '9호선',
    hasStation: hasLine9Station,
    distance: getLine9Distance,
    create: createLine9JourneyDefinition,
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
  D1: {
    lineName: '신분당선',
    hasStation: hasShinbundangLineStation,
    distance: getShinbundangLineDistance,
    create: createShinbundangLineJourneyDefinition,
  },
  K: {
    lineName: '수인분당선',
    hasStation: hasSuinBundangLineStation,
    distance: getSuinBundangLineDistance,
    create: createSuinBundangLineJourneyDefinition,
  },
  A: {
    lineName: 'GTX-A',
    hasStation: hasGtxAStation,
    distance: getGtxADistance,
    create: createGtxAJourneyDefinition,
  },
};

const interchanges: readonly Interchange[] = [
  {
    stationName: '동묘앞',
    stationCodes: { '1': 'S10159', '6': '2637' },
    accessibilityVerified: false,
  },
  {
    stationName: '석계',
    stationCodes: { '1': 'KR0120', '6': '2645' },
    accessibilityVerified: false,
  },
  {
    stationName: '합정',
    stationCodes: { '2': '0238', '6': '2623' },
    accessibilityVerified: false,
  },
  {
    stationName: '신당',
    stationCodes: { '2': '0206', '6': '2636' },
    accessibilityVerified: false,
  },
  {
    stationName: '불광',
    stationCodes: { '3': '0312', '6': '2613' },
    accessibilityVerified: false,
  },
  {
    stationName: '약수',
    stationCodes: { '3': '0323', '6': '2634' },
    accessibilityVerified: false,
  },
  {
    stationName: '삼각지',
    stationCodes: { '4': '0428', '6': '2629' },
    accessibilityVerified: false,
  },
  {
    stationName: '청구',
    stationCodes: { '5': '2538', '6': '2635' },
    accessibilityVerified: false,
  },
  {
    stationName: '태릉입구',
    stationCodes: { '6': '2646', '7': '2719' },
    accessibilityVerified: false,
  },
  {
    stationName: '디지털미디어시티',
    stationCodes: { '6': '2619', A1: 'A04' },
    accessibilityVerified: false,
  },
  {
    stationName: '잠실',
    stationCodes: { '2': '0216', '8': '2815' },
    accessibilityVerified: false,
  },
  {
    stationName: '가락시장',
    stationCodes: { '3': '0340', '8': '2818' },
    accessibilityVerified: false,
  },
  {
    stationName: '천호',
    stationCodes: { '5': '2548', '8': '2812' },
    accessibilityVerified: false,
  },
  {
    stationName: '석촌',
    stationCodes: { '8': '2816', '9': '0933' },
    accessibilityVerified: false,
  },
  {
    stationName: '당산',
    stationCodes: { '2': '0237', '9': '0913' },
    accessibilityVerified: false,
  },
  {
    stationName: '종합운동장',
    stationCodes: { '2': '0218', '9': '0930' },
    accessibilityVerified: false,
  },
  {
    stationName: '동작',
    stationCodes: { '4': '0431', '9': '0920' },
    accessibilityVerified: false,
  },
  {
    stationName: '여의도',
    stationCodes: { '5': '2527', '9': '0915' },
    accessibilityVerified: false,
  },
  {
    stationName: '올림픽공원',
    stationCodes: { '5': '2556', '9': '0936' },
    accessibilityVerified: false,
  },
  {
    stationName: '마곡나루',
    stationCodes: { '9': '0905', A1: 'A042' },
    accessibilityVerified: false,
  },
  {
    stationName: '샛강',
    stationCodes: { '9': '0916', L1: 'S401' },
    accessibilityVerified: false,
  },
  {
    stationName: '서울역',
    stationCodes: { '1': 'S10150', '4': '0426', A1: 'A01', A: 'X106' },
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
    stationCodes: { '5': '2530', '6': '2627', A1: 'A02' },
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
    stationCodes: { '3': '0329', '7': '2736', '9': '0923' },
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
    stationCodes: { '2': '0208', '5': '2541', K: 'K210' },
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
    stationCodes: { '5': '2513', '9': '0902', A1: 'A05', G1: 'G109' },
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
  {
    stationName: '신사',
    stationCodes: { '3': '0327', D1: 'D004' },
    accessibilityVerified: false,
  },
  {
    stationName: '논현',
    stationCodes: { '7': '2734', D1: 'D005' },
    accessibilityVerified: false,
  },
  {
    stationName: '신논현',
    stationCodes: { '9': '0925', D1: 'D006' },
    accessibilityVerified: false,
  },
  {
    stationName: '강남',
    stationCodes: { '2': '0222', D1: 'D007' },
    accessibilityVerified: false,
  },
  {
    stationName: '양재',
    stationCodes: { '3': '0332', D1: 'D008' },
    accessibilityVerified: false,
  },
  {
    stationName: '연신내',
    stationCodes: { '3': '0311', '6': '2615', A: 'X105' },
    accessibilityVerified: false,
  },
  {
    stationName: '대곡',
    stationCodes: { '3': 'K314', A: 'X103' },
    accessibilityVerified: false,
  },
  {
    stationName: '수서',
    stationCodes: { '3': '0339', K: 'K221', A: 'X108' },
    accessibilityVerified: false,
  },
  {
    stationName: '청량리',
    stationCodes: { '1': 'S10158', K: 'K209' },
    accessibilityVerified: false,
  },
  {
    stationName: '강남구청',
    stationCodes: { '7': '2730', K: 'K213' },
    accessibilityVerified: false,
  },
  {
    stationName: '선정릉',
    stationCodes: { '9': '0927', K: 'K214' },
    accessibilityVerified: false,
  },
  {
    stationName: '선릉',
    stationCodes: { '2': '0220', K: 'K215' },
    accessibilityVerified: false,
  },
  {
    stationName: '도곡',
    stationCodes: { '3': '0334', K: 'K217' },
    accessibilityVerified: false,
  },
  {
    stationName: '복정',
    stationCodes: { '8': '2821', K: 'K222' },
    accessibilityVerified: false,
  },
  {
    stationName: '모란',
    stationCodes: { '8': '2827', K: 'K225' },
    accessibilityVerified: false,
  },
  {
    stationName: '정자',
    stationCodes: { D1: 'D012', K: 'K230' },
    accessibilityVerified: false,
  },
  {
    stationName: '기흥',
    stationCodes: { E1: 'Y110', K: 'K237' },
    accessibilityVerified: false,
  },
  {
    stationName: '수원',
    stationCodes: { '1': 'KRP155', K: 'K245' },
    accessibilityVerified: false,
  },
  {
    stationName: '한대앞',
    stationCodes: { '4': '0449', K: 'K251' },
    accessibilityVerified: false,
  },
  {
    stationName: '초지',
    stationCodes: { '4': '0452', K: 'K254' },
    accessibilityVerified: false,
  },
  {
    stationName: '오이도',
    stationCodes: { '4': '0456', K: 'K258' },
    accessibilityVerified: false,
  },
  {
    stationName: '인천',
    stationCodes: { '1': 'KR0161', K: 'K272' },
    accessibilityVerified: false,
  },
];

export function createInterlineJourneyDefinition(
  originStationCode: string,
  destinationStationCode: string,
): VerifiedJourneyDefinition | null {
  const originLine = findLine(originStationCode);
  const destinationLine = findLine(destinationStationCode);
  if (!originLine || !destinationLine) {
    return null;
  }
  if (
    originLine === destinationLine &&
    adapters[originLine].distance(originStationCode, destinationStationCode) !==
      null
  ) {
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
  if (built.length === 0) {
    return createMultiTransferJourneyDefinition(
      originStationCode,
      destinationStationCode,
      originLine,
      destinationLine,
    );
  }

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

interface LineTransition {
  interchange: Interchange;
  fromLine: SupportedLineId;
  toLine: SupportedLineId;
  fromCode: string;
  toCode: string;
}

function createMultiTransferJourneyDefinition(
  originStationCode: string,
  destinationStationCode: string,
  originLine: SupportedLineId,
  destinationLine: SupportedLineId,
): VerifiedJourneyDefinition | null {
  const transitions = findMultiLineRoute(
    originStationCode,
    destinationStationCode,
    originLine,
    destinationLine,
  );
  if (!transitions) return null;

  const segments: Array<{
    line: SupportedLineId;
    originCode: string;
    destinationCode: string;
    transferAfter?: LineTransition;
  }> = [];
  let currentLine = originLine;
  let currentCode = originStationCode;
  for (const transition of transitions) {
    segments.push({
      line: currentLine,
      originCode: currentCode,
      destinationCode: transition.fromCode,
      transferAfter: transition,
    });
    currentLine = transition.toLine;
    currentCode = transition.toCode;
  }
  segments.push({
    line: destinationLine,
    originCode: currentCode,
    destinationCode: destinationStationCode,
  });

  const legs = segments.flatMap((segment) => {
    if (segment.originCode === segment.destinationCode) return [];
    const definition = adapters[segment.line].create(
      segment.originCode,
      segment.destinationCode,
    );
    return definition ? [{ segment, definition }] : [];
  });
  if (legs.length === 0) return null;

  const transferNames = new Set(
    transitions.map((transition) => transition.interchange.stationName),
  );
  const facilityGroups = legs.flatMap(({ definition }) =>
    definition.candidates[0].facilityGroups.filter(
      (group) =>
        ![...transferNames].some(
          (name) => group.label.includes(name) && group.label.includes('지상'),
        ),
    ),
  );
  const transferGroupIds = new Map<string, string>();
  for (const transition of transitions) {
    if (transition.interchange.accessibilityVerified) continue;
    const group = createUnverifiedTransferGroup(
      transition.interchange,
      transition.fromCode,
      transition.fromLine,
      transition.toLine,
    );
    facilityGroups.push(group);
    transferGroupIds.set(transitionKey(transition), group.id);
  }
  const steps: VerifiedJourneyStep[] = [];
  legs.forEach(({ segment, definition }, index) => {
    const candidateSteps = definition.candidates[0].steps;
    const isFirst = index === 0;
    const isLast = index === legs.length - 1;
    const selected = isFirst
      ? isLast
        ? candidateSteps
        : throughLastTrain(candidateSteps)
      : isLast
        ? fromFirstTrain(candidateSteps)
        : throughLastTrain(fromFirstTrain(candidateSteps));
    if (!isFirst) {
      const transfer = transitions.find(
        (item) =>
          item.toLine === segment.line && item.toCode === segment.originCode,
      );
      if (transfer) {
        const transferGroupId = transferGroupIds.get(transitionKey(transfer));
        steps.push({
          order: 0,
          type: JOURNEY_STEP_TYPE.TRANSFER,
          stationName: transfer.interchange.stationName,
          instruction: `${transfer.interchange.stationName}에서 ${adapters[segment.line].lineName} 열차로 갈아타세요. 승강장 엘리베이터와 환승 표지를 이용하세요.`,
          ...(transferGroupId ? { facilityGroupId: transferGroupId } : {}),
          evidence: transfer.interchange.accessibilityVerified
            ? '검증된 환승역 연결값'
            : '지원 노선 환승 그래프 · 방향별 엘리베이터 환승 이동동선 미확인',
        });
      }
    }
    steps.push(...selected);
  });

  const firstDefinition = legs[0].definition;
  const lastDefinition = legs.at(-1)!.definition;
  return {
    id: `interline-multi-${originLine}-${destinationLine}-${originStationCode}-to-${destinationStationCode}`,
    originStationCode,
    originStationName: firstDefinition.originStationName,
    destinationStationCode,
    destinationStationName: lastDefinition.destinationStationName,
    dataVersion: [
      ...new Set(legs.map(({ definition }) => definition.dataVersion)),
    ].join('+'),
    verifiedAt: legs
      .map(({ definition }) => definition.verifiedAt)
      .toSorted()
      .at(-1)!,
    candidates: [
      {
        id: `multi-transfer-${transitions.map((item) => slug(item.interchange.stationName)).join('-')}`,
        label: `${transitions.map((item) => item.interchange.stationName).join('·')} 환승`,
        priority: 1,
        transferStation: transitions
          .map((item) => item.interchange.stationName)
          .join('·'),
        lines: [
          adapters[originLine].lineName,
          ...transitions.map((item) => adapters[item.toLine].lineName),
        ],
        facilityGroups,
        steps: renumber(steps),
      },
    ],
  };
}

function transitionKey(transition: LineTransition) {
  return `${transition.fromLine}:${transition.fromCode}:${transition.toLine}:${transition.toCode}`;
}

function findMultiLineRoute(
  originStationCode: string,
  destinationStationCode: string,
  originLine: SupportedLineId,
  destinationLine: SupportedLineId,
) {
  const queue: Array<{
    line: SupportedLineId;
    stationCode: string;
    cost: number;
    transitions: LineTransition[];
  }> = [
    {
      line: originLine,
      stationCode: originStationCode,
      cost: 0,
      transitions: [],
    },
  ];
  const bestByState = new Map<string, number>();
  let best: { cost: number; transitions: LineTransition[] } | null = null;

  while (queue.length > 0) {
    queue.sort((left, right) => left.cost - right.cost);
    const state = queue.shift()!;
    if (best && state.cost >= best.cost) continue;
    const key = `${state.line}:${state.stationCode}`;
    if ((bestByState.get(key) ?? Number.POSITIVE_INFINITY) <= state.cost)
      continue;
    bestByState.set(key, state.cost);

    if (state.line === destinationLine) {
      const finalDistance = adapters[state.line].distance(
        state.stationCode,
        destinationStationCode,
      );
      if (finalDistance !== null) {
        const cost = state.cost + finalDistance;
        if (!best || cost < best.cost)
          best = { cost, transitions: state.transitions };
      }
    }

    for (const interchange of interchanges) {
      const fromCode = interchange.stationCodes[state.line];
      if (!fromCode) continue;
      const travelDistance = adapters[state.line].distance(
        state.stationCode,
        fromCode,
      );
      if (travelDistance === null) continue;
      for (const [toLine, toCode] of Object.entries(
        interchange.stationCodes,
      ) as Array<[SupportedLineId, string]>) {
        if (toLine === state.line) continue;
        queue.push({
          line: toLine,
          stationCode: toCode,
          cost: state.cost + travelDistance + 2,
          transitions: [
            ...state.transitions,
            {
              interchange,
              fromLine: state.line,
              toLine,
              fromCode,
              toCode,
            },
          ],
        });
      }
    }
  }
  return best?.transitions ?? null;
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
