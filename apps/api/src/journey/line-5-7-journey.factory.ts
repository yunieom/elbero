import { createLine5JourneyDefinition } from './line-5-journey.factory.js';
import { createLine7JourneyDefinition } from './line-7-journey.factory.js';
import {
  JOURNEY_STEP_TYPE,
  type VerifiedJourneyDefinition,
  type VerifiedJourneyStep,
} from './types/verified-journey.type.js';

const LINE_5_GUNJA_CODE = '2545';
const LINE_7_GUNJA_CODE = '2727';

export function createLine5Line7JourneyDefinition(
  originStationCode: string,
  destinationStationCode: string,
): VerifiedJourneyDefinition | null {
  const line5ToTransfer = createLine5JourneyDefinition(
    originStationCode,
    LINE_5_GUNJA_CODE,
  );
  const transferToLine7 = createLine7JourneyDefinition(
    LINE_7_GUNJA_CODE,
    destinationStationCode,
  );
  if (line5ToTransfer && transferToLine7) {
    return combine(line5ToTransfer, transferToLine7, '7호선');
  }

  const line7ToTransfer = createLine7JourneyDefinition(
    originStationCode,
    LINE_7_GUNJA_CODE,
  );
  const transferToLine5 = createLine5JourneyDefinition(
    LINE_5_GUNJA_CODE,
    destinationStationCode,
  );
  if (line7ToTransfer && transferToLine5) {
    return combine(line7ToTransfer, transferToLine5, '5호선');
  }
  return null;
}

function combine(
  first: VerifiedJourneyDefinition,
  second: VerifiedJourneyDefinition,
  transferToLineName: string,
): VerifiedJourneyDefinition {
  const firstCandidate = first.candidates[0];
  const secondCandidate = second.candidates[0];
  const secondTrain = secondCandidate.steps.find(
    (step) => step.type === JOURNEY_STEP_TYPE.TRAIN,
  );
  const steps = renumber([
    ...firstCandidate.steps.filter(
      (step) => step.type !== JOURNEY_STEP_TYPE.EXIT,
    ),
    {
      order: 0,
      type: JOURNEY_STEP_TYPE.TRANSFER,
      stationName: '군자',
      instruction: `군자역에서 ${transferToLineName} ${secondTrain?.trainSegment?.direction ?? ''} 열차로 갈아타세요. 엘리베이터 안내와 실시간 운행 상태를 확인하세요.`,
      evidence: '5호선·7호선 군자 환승 연결값',
    },
    ...secondCandidate.steps.filter(
      (step) => step.type !== JOURNEY_STEP_TYPE.ENTRY,
    ),
  ]);

  return {
    id: `line-5-7-${first.originStationCode}-to-${second.destinationStationCode}`,
    originStationCode: first.originStationCode,
    originStationName: first.originStationName,
    destinationStationCode: second.destinationStationCode,
    destinationStationName: second.destinationStationName,
    dataVersion: `${first.dataVersion}+${second.dataVersion}`,
    verifiedAt:
      first.verifiedAt > second.verifiedAt
        ? first.verifiedAt
        : second.verifiedAt,
    candidates: [
      {
        id: 'transfer-at-gunja',
        label: '군자역 환승 경로',
        priority: 1,
        transferStation: '군자',
        lines: [...firstCandidate.lines, ...secondCandidate.lines],
        facilityGroups: [
          ...firstCandidate.facilityGroups.filter(
            (group) => !isTransferSurfaceGroup(group.label),
          ),
          ...secondCandidate.facilityGroups.filter(
            (group) => !isTransferSurfaceGroup(group.label),
          ),
        ],
        steps,
      },
    ],
  };
}

function isTransferSurfaceGroup(label: string) {
  return label === '군자 지상 엘리베이터';
}

function renumber(steps: VerifiedJourneyStep[]) {
  return steps.map((step, index) => ({ ...step, order: index + 1 }));
}
