import {
  JOURNEY_STEP_TYPE,
  STATION_ACCESS_KIND,
  STATION_ACCESS_PHASE,
  type FacilityRequirementGroup,
  type StationAccessDetail,
  type StationAccessKind,
  type StationAccessPhase,
  type VerifiedJourneyStep,
  type VerifiedRouteCandidate,
} from './types/verified-journey.type.js';

export function attachStationAccessDetails(
  candidate: VerifiedRouteCandidate,
  verifiedAt: string,
): VerifiedJourneyStep[] {
  const firstTrainIndex = candidate.steps.findIndex(
    (step) => step.type === JOURNEY_STEP_TYPE.TRAIN,
  );
  const lastTrainIndex = candidate.steps.findLastIndex(
    (step) => step.type === JOURNEY_STEP_TYPE.TRAIN,
  );

  const enriched = candidate.steps.map((step, index) => {
    if (step.stationAccess) return step;
    const phase = toPhase(step, index, firstTrainIndex, lastTrainIndex);
    const kind = toKind(step.type);
    if (!phase || !kind) return step;

    const group = candidate.facilityGroups.find(
      (item) => item.id === step.facilityGroupId,
    );
    return {
      ...step,
      stationAccess: toDetail(step, phase, kind, group, verifiedAt),
    };
  });

  return enriched.map((step) => {
    if (step.stationAccess?.kind !== STATION_ACCESS_KIND.GATE) return step;
    const floor = findGateFloor(
      enriched,
      step.stationName,
      step.stationAccess.phase,
    );
    return {
      ...step,
      stationAccess: {
        ...step.stationAccess,
        fromFloor: floor,
        toFloor: floor,
      },
    };
  });
}

function toPhase(
  step: VerifiedJourneyStep,
  index: number,
  firstTrainIndex: number,
  lastTrainIndex: number,
): StationAccessPhase | null {
  if (step.type === JOURNEY_STEP_TYPE.ENTRY) return STATION_ACCESS_PHASE.ENTRY;
  if (step.type === JOURNEY_STEP_TYPE.EXIT) return STATION_ACCESS_PHASE.EXIT;
  if (firstTrainIndex >= 0 && index < firstTrainIndex) {
    return STATION_ACCESS_PHASE.ENTRY;
  }
  if (lastTrainIndex >= 0 && index > lastTrainIndex) {
    return STATION_ACCESS_PHASE.EXIT;
  }
  return null;
}

function toKind(type: VerifiedJourneyStep['type']): StationAccessKind | null {
  if (type === JOURNEY_STEP_TYPE.ENTRY || type === JOURNEY_STEP_TYPE.EXIT) {
    return STATION_ACCESS_KIND.SURFACE_ELEVATOR;
  }
  if (type === JOURNEY_STEP_TYPE.GATE) return STATION_ACCESS_KIND.GATE;
  if (type === JOURNEY_STEP_TYPE.ELEVATOR) {
    return STATION_ACCESS_KIND.PLATFORM_ELEVATOR;
  }
  return null;
}

function toDetail(
  step: VerifiedJourneyStep,
  phase: StationAccessPhase,
  kind: StationAccessKind,
  group: FacilityRequirementGroup | undefined,
  verifiedAt: string,
): StationAccessDetail {
  const section = uniqueValue(
    group?.facilities.map((facility) => facility.expectedOperatingSection) ??
      [],
  );
  const [entryFrom, entryTo] = toEntryFloors(section, kind);
  const isExit = phase === STATION_ACCESS_PHASE.EXIT;
  const direction = findDirection(step.instruction, group?.label);
  const locations = uniqueValues(
    group?.facilities.map((facility) =>
      selectDirectionalLocation(facility.expectedLocation, direction),
    ) ?? [],
  );

  return {
    phase,
    kind,
    location:
      kind === STATION_ACCESS_KIND.GATE
        ? '대합실 개찰구'
        : locations.length > 0
          ? locations.join(' / ')
          : null,
    fromFloor: isExit ? entryTo : entryFrom,
    toFloor: isExit ? entryFrom : entryTo,
    direction,
    facilityIds:
      group?.facilities
        .filter((facility) => facility.sourceFacilityName !== null)
        .map((facility) => facility.id) ?? [],
    source: step.evidence,
    verifiedAt,
  };
}

function selectDirectionalLocation(
  location: string | null,
  direction: string | null,
) {
  if (!location || !direction || !location.includes('방면')) return location;
  const directionKey = normalizeDirection(direction);
  const segments = location.split(/\s*[,/]\s*/u);
  const matched = segments.filter((segment) =>
    normalizeDirection(segment).includes(directionKey),
  );
  if (matched.length > 0) return matched.join(', ');
  return segments.length > 1 ? null : location;
}

function normalizeDirection(value: string) {
  return value.replace(/방면|[\s()]/gu, '');
}

function toEntryFloors(
  section: string | null,
  kind: StationAccessKind,
): [string | null, string | null] {
  const floors = section ? extractFloors(section) : [];
  if (floors.length < 2) return [null, null];
  const byDistanceFromGround = [...floors].sort(
    (left, right) => floorDistance(left) - floorDistance(right),
  );
  if (kind === STATION_ACCESS_KIND.SURFACE_ELEVATOR) {
    return [byDistanceFromGround[0], byDistanceFromGround.at(-1)!];
  }
  if (kind === STATION_ACCESS_KIND.PLATFORM_ELEVATOR) {
    return [byDistanceFromGround[0], byDistanceFromGround.at(-1)!];
  }
  return [null, null];
}

function extractFloors(section: string) {
  return [...section.matchAll(/BM\d+(?:\.\d+)?|B\d+(?:\.\d+)?|\d+(?:\.\d+)?F/g)]
    .map((match) => match[0])
    .filter((floor, index, values) => values.indexOf(floor) === index);
}

function floorDistance(floor: string) {
  if (floor.startsWith('BM')) return Number(floor.slice(2)) - 0.5;
  if (floor.startsWith('B')) return Number(floor.slice(1));
  if (floor.endsWith('F')) return Math.abs(Number(floor.slice(0, -1)) - 1);
  return Number.POSITIVE_INFINITY;
}

function findGateFloor(
  steps: VerifiedJourneyStep[],
  stationName: string,
  phase: StationAccessPhase,
) {
  const surfaceStep = steps.find(
    (step) =>
      step.stationName === stationName &&
      step.stationAccess?.phase === phase &&
      step.stationAccess.kind === STATION_ACCESS_KIND.SURFACE_ELEVATOR,
  );
  const surfaceConcourseFloor =
    phase === STATION_ACCESS_PHASE.ENTRY
      ? surfaceStep?.stationAccess?.toFloor
      : surfaceStep?.stationAccess?.fromFloor;
  if (surfaceConcourseFloor) return surfaceConcourseFloor;

  const candidates = steps
    .filter(
      (step) =>
        step.stationName === stationName &&
        step.stationAccess?.phase === phase &&
        step.stationAccess.kind !== STATION_ACCESS_KIND.GATE,
    )
    .flatMap((step) => [
      step.stationAccess?.fromFloor ?? null,
      step.stationAccess?.toFloor ?? null,
    ])
    .filter((floor): floor is string => floor !== null);
  if (candidates.length === 0) return null;
  const counts = new Map<string, number>();
  for (const floor of candidates)
    counts.set(floor, (counts.get(floor) ?? 0) + 1);
  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0][0];
}

function findDirection(instruction: string, label?: string) {
  const text = `${instruction} ${label ?? ''}`;
  return (
    text.match(/([가-힣A-Za-z0-9·]+(?:·[가-힣A-Za-z0-9]+)* 방면)/)?.[1] ?? null
  );
}

function uniqueValue(values: Array<string | null>) {
  const unique = uniqueValues(values);
  return unique.length === 1 ? unique[0] : null;
}

function uniqueValues(values: Array<string | null>) {
  return values.filter(
    (value, index): value is string =>
      value !== null && values.indexOf(value) === index,
  );
}
