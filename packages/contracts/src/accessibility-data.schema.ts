import { z } from "zod";

const id = z.string().min(1);
const nullableId = id.nullable();
const isoDateTime = z.string().datetime({ offset: true });

export const sourceEvidenceSchema = z
  .object({
    sourceSystem: z.enum(["kric", "seoul_metro", "manual_verification"]),
    dataset: z.string().min(1),
    rawRecordKey: z.string().nullable(),
    collectedAt: isoDateTime.nullable(),
    observedAt: isoDateTime.nullable(),
    verificationStatus: z.enum(["verified", "unverified", "conflict"]),
  })
  .strict();

const evidence = z.array(sourceEvidenceSchema);

export const railLineSchema = z
  .object({
    id,
    operatorCode: z.string().min(1),
    sourceLineCode: z.string().min(1),
    name: z.string().min(1),
    evidence,
  })
  .strict();

export const stationSchema = z
  .object({
    id,
    name: z.string().min(1),
    aliases: z.array(z.string()),
    evidence,
  })
  .strict();

export const stationLineSchema = z
  .object({
    id,
    stationId: id,
    lineId: id,
    sourceStationCode: z.string().min(1),
    sequence: z.number().int().nonnegative().nullable(),
    previousStationLineId: nullableId,
    nextStationLineId: nullableId,
    evidence,
  })
  .strict();

const platformDirectionSchema = z
  .object({
    previousStationLineId: nullableId,
    nextStationLineId: nullableId,
    terminalStationLineId: nullableId,
    sourceUpDownCode: z.string().nullable(),
    displayLabel: z.string().min(1),
  })
  .strict();

export const platformSchema = z
  .object({
    id,
    stationLineId: id,
    sourcePlatformNumber: z.string().min(1),
    floor: z.string().nullable(),
    direction: platformDirectionSchema,
    evidence,
  })
  .strict();

export const placeSchema = z
  .object({
    id,
    stationLineId: id,
    type: z.enum([
      "surface_exit",
      "concourse",
      "fare_gate",
      "platform",
      "transfer_area",
      "other",
    ]),
    name: z.string().min(1),
    floor: z.string().nullable(),
    exitNumber: z.string().nullable(),
    platformId: nullableId,
    evidence,
  })
  .strict();

export const accessibilityFacilitySchema = z
  .object({
    id,
    stationLineId: id,
    type: z.literal("elevator"),
    name: z.string().min(1),
    operatingSection: z.string().nullable(),
    locationDescription: z.string().nullable(),
    servedPlaceIds: z.array(id),
    evidence,
  })
  .strict();

export const platformBoardingPointSchema = z
  .object({
    id,
    platformId: id,
    position: z
      .object({
        carNumber: z.number().int().positive(),
        doorNumber: z.number().int().positive(),
      })
      .strict(),
    adjacentFacilityIds: z.array(id),
    gapDistanceCm: z.number().nonnegative().nullable(),
    recommended: z.boolean(),
    evidence,
  })
  .strict();

const pathDirectionConditionSchema = z
  .object({
    incomingStationLineId: nullableId,
    outgoingStationLineId: nullableId,
    terminalStationLineId: nullableId,
    sourcePreviousStationCode: z.string().nullable(),
    sourceNextStationCode: z.string().nullable(),
  })
  .strict();

export const accessiblePathSchema = z
  .object({
    id,
    stationLineId: id,
    type: z.enum(["entry", "exit", "transfer"]),
    sourcePathManagementNumber: z.string().min(1),
    fromPlaceId: nullableId,
    toPlaceId: nullableId,
    directionCondition: pathDirectionConditionSchema,
    segmentIds: z.array(id),
    evidence,
  })
  .strict();

export const pathSegmentSchema = z
  .object({
    id,
    pathId: id,
    order: z.number().int().positive(),
    fromPlaceId: nullableId,
    toPlaceId: nullableId,
    facilityId: nullableId,
    instruction: z.string().min(1),
    rawInstruction: z.string(),
    mappingStatus: z.enum(["mapped", "partial", "unmapped"]),
    evidence,
  })
  .strict();

export const facilityStatusObservationSchema = z
  .object({
    id,
    facilityId: id,
    status: z.enum(["operational", "out_of_service", "unknown"]),
    sourceStatus: z.string().nullable(),
    observedAt: isoDateTime.nullable(),
    collectedAt: isoDateTime,
    expiresAt: isoDateTime.nullable(),
    evidence,
  })
  .strict();

export const unmappedSourceRecordSchema = z
  .object({
    id,
    sourceSystem: z.enum(["kric", "seoul_metro", "manual_verification"]),
    dataset: z.string().min(1),
    rawRecordKey: z.string().nullable(),
    fieldNames: z.array(z.string()),
    reason: z.string().min(1),
    collectedAt: isoDateTime.nullable(),
  })
  .strict();

export const accessibilityDataPackageSchema = z
  .object({
    schemaVersion: z.number().int().positive(),
    dataVersion: z.string().min(1),
    generatedAt: isoDateTime,
    lines: z.array(railLineSchema),
    stations: z.array(stationSchema),
    stationLines: z.array(stationLineSchema),
    platforms: z.array(platformSchema),
    places: z.array(placeSchema),
    facilities: z.array(accessibilityFacilitySchema),
    boardingPoints: z.array(platformBoardingPointSchema),
    paths: z.array(accessiblePathSchema),
    pathSegments: z.array(pathSegmentSchema),
    statusObservations: z.array(facilityStatusObservationSchema),
    unmappedSourceRecords: z.array(unmappedSourceRecordSchema),
  })
  .strict();
