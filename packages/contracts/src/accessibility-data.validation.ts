import { z } from "zod";
import type { AccessibilityDataPackage } from "./accessibility-domain.js";
import {
  accessibilityDataPackageSchema,
  accessibilityFacilitySchema,
  accessiblePathSchema,
  facilityStatusObservationSchema,
  pathSegmentSchema,
  placeSchema,
  platformBoardingPointSchema,
  platformSchema,
  railLineSchema,
  stationLineSchema,
  stationSchema,
  unmappedSourceRecordSchema,
} from "./accessibility-data.schema.js";
import {
  createJourneyContractError,
  createJourneyContractMeta,
  JOURNEY_ERROR_CODE,
  type JourneyContractResult,
} from "./journey-runtime.js";

export type AccessibilityCollectionName = Exclude<
  keyof AccessibilityDataPackage,
  "schemaVersion" | "dataVersion" | "generatedAt"
>;

export interface AccessibilityValidationIssue {
  collection: AccessibilityCollectionName | "package";
  index: number | null;
  entityId: string | null;
  kind: "invalid_shape" | "broken_reference";
  message: string;
  references: string[];
}

export interface AccessibilityValidationReport {
  acceptedCount: number;
  quarantinedCount: number;
  issues: AccessibilityValidationIssue[];
}

export interface ValidatedAccessibilityData {
  dataPackage: AccessibilityDataPackage;
  report: AccessibilityValidationReport;
}

const headerSchema = z
  .object({
    schemaVersion: z.number().int().positive(),
    dataVersion: z.string().min(1),
    generatedAt: z.string().datetime({ offset: true }),
  })
  .passthrough();

const schemas = {
  lines: railLineSchema,
  stations: stationSchema,
  stationLines: stationLineSchema,
  platforms: platformSchema,
  places: placeSchema,
  facilities: accessibilityFacilitySchema,
  boardingPoints: platformBoardingPointSchema,
  paths: accessiblePathSchema,
  pathSegments: pathSegmentSchema,
  statusObservations: facilityStatusObservationSchema,
  unmappedSourceRecords: unmappedSourceRecordSchema,
} as const;

export function validateAccessibilityDataPackage(
  input: unknown,
  requestId = "accessibility-data-validation",
): JourneyContractResult<ValidatedAccessibilityData> {
  const header = headerSchema.safeParse(input);
  if (!header.success) {
    return {
      ok: false,
      error: createJourneyContractError(
        JOURNEY_ERROR_CODE.DATA_MISSING,
        "데이터 패키지의 버전 또는 생성 시각이 올바르지 않습니다.",
        { issueCount: header.error.issues.length },
      ),
      meta: createJourneyContractMeta(requestId, null),
    };
  }

  const source = input as Record<string, unknown>;
  const issues: AccessibilityValidationIssue[] = [];
  const parsed: Record<AccessibilityCollectionName, unknown[]> = {
    lines: [],
    stations: [],
    stationLines: [],
    platforms: [],
    places: [],
    facilities: [],
    boardingPoints: [],
    paths: [],
    pathSegments: [],
    statusObservations: [],
    unmappedSourceRecords: [],
  };

  for (const collection of Object.keys(
    schemas,
  ) as AccessibilityCollectionName[]) {
    const records = source[collection];
    if (!Array.isArray(records)) {
      issues.push({
        collection,
        index: null,
        entityId: null,
        kind: "invalid_shape",
        message: `${collection} 컬렉션이 배열이 아닙니다.`,
        references: [],
      });
      continue;
    }
    records.forEach((record, index) => {
      const result = schemas[collection].safeParse(record);
      if (result.success) {
        parsed[collection].push(result.data);
        return;
      }
      issues.push({
        collection,
        index,
        entityId: readEntityId(record),
        kind: "invalid_shape",
        message: result.error.issues.map((issue) => issue.message).join("; "),
        references: [],
      });
    });
  }

  quarantineBrokenReferences(parsed, issues);

  const candidate = {
    schemaVersion: header.data.schemaVersion,
    dataVersion: header.data.dataVersion,
    generatedAt: header.data.generatedAt,
    ...parsed,
  };
  const validated = accessibilityDataPackageSchema.safeParse(candidate);
  if (!validated.success) {
    return {
      ok: false,
      error: createJourneyContractError(
        JOURNEY_ERROR_CODE.DATA_MISSING,
        "격리 후 데이터 패키지를 생성할 수 없습니다.",
        { issueCount: validated.error.issues.length },
      ),
      meta: createJourneyContractMeta(requestId, header.data.dataVersion),
    };
  }

  const acceptedCount = Object.values(parsed).reduce(
    (sum, records) => sum + records.length,
    0,
  );
  const warning = createJourneyContractError(
    JOURNEY_ERROR_CODE.DATA_MISSING,
    "일부 레코드가 형식 오류 또는 끊어진 참조로 격리되었습니다.",
    { quarantinedCount: issues.length },
  );

  return {
    ok: true,
    data: {
      dataPackage: validated.data,
      report: {
        acceptedCount,
        quarantinedCount: issues.length,
        issues,
      },
    },
    warnings: issues.length > 0 ? [warning] : [],
    meta: createJourneyContractMeta(
      requestId,
      validated.data.dataVersion,
      validated.data.generatedAt,
    ),
  };
}

function quarantineBrokenReferences(
  data: Record<AccessibilityCollectionName, unknown[]>,
  issues: AccessibilityValidationIssue[],
): void {
  const ids = (collection: AccessibilityCollectionName) =>
    new Set(data[collection].map((record) => (record as { id: string }).id));
  const keep = <T extends { id: string }>(
    collection: AccessibilityCollectionName,
    records: T[],
    missingReferences: (record: T) => string[],
  ): T[] =>
    records.filter((record, index) => {
      const missing = missingReferences(record);
      if (missing.length === 0) return true;
      issues.push({
        collection,
        index,
        entityId: record.id,
        kind: "broken_reference",
        message: "참조 대상이 패키지에 없습니다.",
        references: missing,
      });
      return false;
    });

  const lineIds = ids("lines");
  const stationIds = ids("stations");
  data.stationLines = keep(
    "stationLines",
    data.stationLines as never[],
    (record: any) =>
      [
        record.stationId,
        record.lineId,
        record.previousStationLineId,
        record.nextStationLineId,
      ]
        .filter(Boolean)
        .filter((ref) =>
          ref === record.stationId
            ? !stationIds.has(ref)
            : ref === record.lineId
              ? !lineIds.has(ref)
              : !(data.stationLines as Array<{ id: string }>).some(
                  (item) => item.id === ref,
                ),
        ),
  );
  const stationLineIds = ids("stationLines");
  data.platforms = keep("platforms", data.platforms as never[], (record: any) =>
    [
      record.stationLineId,
      record.direction.previousStationLineId,
      record.direction.nextStationLineId,
      record.direction.terminalStationLineId,
    ]
      .filter(Boolean)
      .filter((ref) => !stationLineIds.has(ref)),
  );
  const platformIds = ids("platforms");
  data.places = keep("places", data.places as never[], (record: any) =>
    [record.stationLineId, record.platformId]
      .filter(Boolean)
      .filter((ref) => !stationLineIds.has(ref) && !platformIds.has(ref)),
  );
  const placeIds = ids("places");
  data.facilities = keep(
    "facilities",
    data.facilities as never[],
    (record: any) =>
      [record.stationLineId, ...record.servedPlaceIds].filter(
        (ref) => !stationLineIds.has(ref) && !placeIds.has(ref),
      ),
  );
  const facilityIds = ids("facilities");
  data.boardingPoints = keep(
    "boardingPoints",
    data.boardingPoints as never[],
    (record: any) =>
      [record.platformId, ...record.adjacentFacilityIds].filter(
        (ref) => !platformIds.has(ref) && !facilityIds.has(ref),
      ),
  );
  data.paths = keep("paths", data.paths as never[], (record: any) =>
    [record.stationLineId, record.fromPlaceId, record.toPlaceId]
      .filter(Boolean)
      .filter((ref) => !stationLineIds.has(ref) && !placeIds.has(ref)),
  );
  const pathIds = ids("paths");
  data.pathSegments = keep(
    "pathSegments",
    data.pathSegments as never[],
    (record: any) =>
      [record.pathId, record.fromPlaceId, record.toPlaceId, record.facilityId]
        .filter(Boolean)
        .filter(
          (ref) =>
            !pathIds.has(ref) && !placeIds.has(ref) && !facilityIds.has(ref),
        ),
  );
  const segmentIds = ids("pathSegments");
  data.paths = keep("paths", data.paths as never[], (record: any) =>
    record.segmentIds.filter((ref: string) => !segmentIds.has(ref)),
  );
  data.statusObservations = keep(
    "statusObservations",
    data.statusObservations as never[],
    (record: any) =>
      facilityIds.has(record.facilityId) ? [] : [record.facilityId],
  );
}

function readEntityId(record: unknown): string | null {
  if (typeof record !== "object" || record === null) return null;
  const id = (record as { id?: unknown }).id;
  return typeof id === "string" ? id : null;
}
