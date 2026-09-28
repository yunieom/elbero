import {
  JOURNEY_STEP_TYPE,
  type FacilityRequirementGroup,
  type VerifiedJourneyDefinition,
} from '../types/verified-journey.type.js';
import { toPlatformGap } from '../platform-gap.js';

const DAPSIMNI_WEST_ENTRY: FacilityRequirementGroup[] = [
  {
    id: 'dapsimni-west-surface',
    label: '답십리 지상 출입구 엘리베이터',
    policy: 'any',
    facilities: [
      {
        id: 'dapsimni-exit-2',
        stationCode: '2543',
        stationName: '답십리',
        role: '2번 출입구에서 B2 대합실로 이동',
        sourceFacilityName: '승강기)엘리베이터-답십리 외부3',
        expectedOperatingSection: 'B2-1F',
        expectedLocation: '2번 출입구',
      },
      {
        id: 'dapsimni-exit-6',
        stationCode: '2543',
        stationName: '답십리',
        role: '6번 출입구에서 B2 대합실로 이동',
        sourceFacilityName: '승강기)엘리베이터-답십리 외부4',
        expectedOperatingSection: 'B2-1F',
        expectedLocation: '6번 출입구',
      },
    ],
  },
  {
    id: 'dapsimni-west-platform',
    label: '답십리 마장 방면 승강장 엘리베이터',
    policy: 'all',
    facilities: [
      {
        id: 'dapsimni-internal-west',
        stationCode: '2543',
        stationName: '답십리',
        role: 'B2 대합실에서 B3 마장 방면 승강장으로 이동',
        sourceFacilityName: '승강기)엘리베이터-답십리 내부1',
        expectedOperatingSection: 'B2-B3',
        expectedLocation: '마장 방면4-4',
      },
    ],
  },
];

const DAPSIMNI_EAST_ENTRY: FacilityRequirementGroup[] = [
  {
    ...DAPSIMNI_WEST_ENTRY[0],
    id: 'dapsimni-east-surface',
  },
  {
    id: 'dapsimni-east-platform',
    label: '답십리 장한평 방면 승강장 엘리베이터',
    policy: 'all',
    facilities: [
      {
        id: 'dapsimni-internal-east',
        stationCode: '2543',
        stationName: '답십리',
        role: 'B2 대합실에서 B3 장한평 방면 승강장으로 이동',
        sourceFacilityName: '승강기)엘리베이터-답십리 내부2',
        expectedOperatingSection: 'B2-B3',
        expectedLocation: '장한평 방면5-1',
      },
    ],
  },
];

const HONGIK_EXIT: FacilityRequirementGroup[] = [
  {
    id: 'hongik-platform',
    label: '홍대입구 합정 방면 승강장 엘리베이터',
    policy: 'all',
    facilities: [
      {
        id: 'hongik-internal-west',
        stationCode: '0239',
        stationName: '홍대입구',
        role: 'B2 합정 방면 승강장에서 B1 대합실로 이동',
        sourceFacilityName:
          '승강기)엘리베이터-홍대입구 섬식(외)7-2 내부#1',
        expectedOperatingSection: 'B2-B1',
        expectedLocation: '합정 방면7-2, 신촌 방면4-3',
      },
    ],
  },
  {
    id: 'hongik-surface',
    label: '홍대입구 8번 출구 엘리베이터',
    policy: 'all',
    facilities: [
      {
        id: 'hongik-exit-8',
        stationCode: '0239',
        stationName: '홍대입구',
        role: 'B1 대합실에서 8번 출구 지상으로 이동',
        sourceFacilityName:
          '승강기)엘리베이터-홍대입구 8번 출구측 외부#1',
        expectedOperatingSection: 'B1-1F',
        expectedLocation: '8번 출입구',
      },
    ],
  },
];

const DAPSIMNI_TO_HONGIK_COMMON_STEPS = [
  {
    order: 1,
    type: JOURNEY_STEP_TYPE.ENTRY,
    stationName: '답십리',
    instruction:
      '2번 또는 6번 출입구 옆에서 운행 중인 엘리베이터를 타고 B2 대합실로 이동하세요.',
    facilityGroupId: 'dapsimni-west-surface',
    evidence: 'KRIC stationMovement · 답십리→마장 방면',
  },
  {
    order: 2,
    type: JOURNEY_STEP_TYPE.GATE,
    stationName: '답십리',
    instruction: '교통카드를 태그한 뒤 마장 방면 엘리베이터로 이동하세요.',
    evidence: 'KRIC stationMovement · 답십리→마장 방면',
  },
  {
    order: 3,
    type: JOURNEY_STEP_TYPE.ELEVATOR,
    stationName: '답십리',
    instruction: '엘리베이터를 타고 B3 마장 방면 승강장으로 이동하세요.',
    facilityGroupId: 'dapsimni-west-platform',
    evidence: 'KRIC stationMovement · 답십리→마장 방면',
  },
  {
    order: 4,
    type: JOURNEY_STEP_TYPE.TRAIN,
    stationName: '답십리',
    instruction: '5호선 방화 방면 열차를 타세요.',
    evidence: 'KRIC subwayRouteInfo',
  },
] as const;

export const VERIFIED_JOURNEYS: VerifiedJourneyDefinition[] = [
  {
    id: 'dapsimni-to-gangdong',
    originStationCode: '2543',
    originStationName: '답십리',
    destinationStationCode: '2549',
    destinationStationName: '강동',
    dataVersion: '2026-09-18.manual.1',
    verifiedAt: '2026-09-18',
    candidates: [
      {
        id: 'line-5-direct',
        label: '5호선 직통 경로',
        priority: 1,
        transferStation: null,
        lines: ['5호선'],
        facilityGroups: [
          ...DAPSIMNI_EAST_ENTRY,
          {
            id: 'gangdong-platform',
            label: '강동 승강장 엘리베이터',
            policy: 'all',
            facilities: [
              {
                id: 'gangdong-internal-arrival',
                stationCode: '2549',
                stationName: '강동',
                role: 'B4 도착 승강장에서 B3 대합실로 이동',
                sourceFacilityName: '승강기)엘리베이터-강동 내부 1호기',
                expectedOperatingSection: 'B3-B4',
                expectedLocation: '둔촌동 방면8-3',
              },
            ],
          },
          {
            id: 'gangdong-surface',
            label: '강동 지상 출구 엘리베이터',
            policy: 'all',
            facilities: [
              {
                id: 'gangdong-exit-1',
                stationCode: '2549',
                stationName: '강동',
                role: 'B3 대합실에서 1번 출구 지상으로 이동',
                sourceFacilityName: '승강기)엘리베이터-강동 외부 2호기',
                expectedOperatingSection: 'B3-1F',
                expectedLocation: '1번 출입구',
              },
            ],
          },
        ],
        steps: [
          {
            order: 1,
            type: JOURNEY_STEP_TYPE.ENTRY,
            stationName: '답십리',
            instruction:
              '2번 또는 6번 출입구 옆에서 운행 중인 엘리베이터를 타고 B2 대합실로 이동하세요.',
            facilityGroupId: 'dapsimni-east-surface',
            evidence: 'KRIC stationMovement · 답십리→장한평 방면',
          },
          {
            order: 2,
            type: JOURNEY_STEP_TYPE.GATE,
            stationName: '답십리',
            instruction: '교통카드를 태그한 뒤 장한평 방면 엘리베이터로 이동하세요.',
            evidence: 'KRIC stationMovement · 답십리→장한평 방면',
          },
          {
            order: 3,
            type: JOURNEY_STEP_TYPE.ELEVATOR,
            stationName: '답십리',
            instruction: '엘리베이터를 타고 B3 장한평 방면 승강장으로 이동하세요.',
            facilityGroupId: 'dapsimni-east-platform',
            evidence: 'KRIC stationMovement · 답십리→장한평 방면',
          },
          {
            order: 4,
            type: JOURNEY_STEP_TYPE.TRAIN,
            stationName: '답십리',
            instruction:
              '5호선 장한평 방면 열차의 8호차 4번 문을 이용하세요.',
            evidence: 'KRIC stationElevatorCarNumber · 강동',
          },
          {
            order: 5,
            type: JOURNEY_STEP_TYPE.SAFETY,
            stationName: '답십리',
            instruction:
              '8호차 4번 문 위치의 승강장 이격거리는 9cm로 안전(green) 구간입니다.',
            evidence: 'KRIC stationPlatformTrainDistance · 답십리 승강장 2',
            platformGap: toPlatformGap(9),
          },
          {
            order: 6,
            type: JOURNEY_STEP_TYPE.ELEVATOR,
            stationName: '강동',
            instruction:
              '강동역에서 내린 뒤 승강장 엘리베이터를 타고 B4에서 B3 대합실로 이동하세요.',
            facilityGroupId: 'gangdong-platform',
            evidence: 'KRIC stationMovement · 강동 길동·둔촌동 방면 역순',
          },
          {
            order: 7,
            type: JOURNEY_STEP_TYPE.EXIT,
            stationName: '강동',
            instruction:
              '개찰구를 통과한 뒤 현장에서 확인된 1번 출구 엘리베이터로 지상에 올라가세요.',
            facilityGroupId: 'gangdong-surface',
            evidence:
              '사용자 현장 확인(2026-09-18) + KRIC stationMovement 역순 + SeoulMetroFaciInfo',
          },
        ],
      },
    ],
  },
  {
    id: 'dapsimni-to-gubeundari',
    originStationCode: '2543',
    originStationName: '답십리',
    destinationStationCode: '2551',
    destinationStationName: '굽은다리',
    dataVersion: '2026-09-18.manual.1',
    verifiedAt: '2026-09-18',
    candidates: [
      {
        id: 'line-5-hanam-branch',
        label: '5호선 하남검단산 방면 직통 경로',
        priority: 1,
        transferStation: null,
        lines: ['5호선'],
        facilityGroups: [
          ...DAPSIMNI_EAST_ENTRY,
          {
            id: 'gubeundari-platform',
            label: '굽은다리 명일 방면 승강장 엘리베이터',
            policy: 'all',
            facilities: [
              {
                id: 'gubeundari-internal-myeongil',
                stationCode: '2551',
                stationName: '굽은다리',
                role: 'B2 명일 방면 승강장에서 B1 대합실로 이동',
                sourceFacilityName: '승강기)엘리베이터-굽은다리 내부2',
                expectedOperatingSection: 'B1-B2',
                expectedLocation: '명일 방면3-2, 3-3 사이',
              },
            ],
          },
          {
            id: 'gubeundari-surface',
            label: '굽은다리 2번 출구 엘리베이터',
            policy: 'all',
            facilities: [
              {
                id: 'gubeundari-exit-2',
                stationCode: '2551',
                stationName: '굽은다리',
                role: 'B1 대합실에서 2번 출구 지상으로 이동',
                sourceFacilityName: '승강기)엘리베이터-굽은다리 외부3',
                expectedOperatingSection: 'B1-1F',
                expectedLocation: '2번 출입구',
              },
            ],
          },
        ],
        steps: [
          {
            order: 1,
            type: JOURNEY_STEP_TYPE.ENTRY,
            stationName: '답십리',
            instruction:
              '2번 또는 6번 출입구 옆에서 운행 중인 엘리베이터를 타고 B2 대합실로 이동하세요.',
            facilityGroupId: 'dapsimni-east-surface',
            evidence: 'KRIC stationMovement · 답십리→장한평 방면',
          },
          {
            order: 2,
            type: JOURNEY_STEP_TYPE.GATE,
            stationName: '답십리',
            instruction: '교통카드를 태그한 뒤 장한평 방면 엘리베이터로 이동하세요.',
            evidence: 'KRIC stationMovement · 답십리→장한평 방면',
          },
          {
            order: 3,
            type: JOURNEY_STEP_TYPE.ELEVATOR,
            stationName: '답십리',
            instruction: '엘리베이터를 타고 B3 장한평 방면 승강장으로 이동하세요.',
            facilityGroupId: 'dapsimni-east-platform',
            evidence: 'KRIC stationMovement · 답십리→장한평 방면',
          },
          {
            order: 4,
            type: JOURNEY_STEP_TYPE.TRAIN,
            stationName: '답십리',
            instruction:
              '전광판에서 하남검단산·상일동 방면인지 확인한 뒤 5호선 3호차 2번 문을 이용하세요. 마천 방면 열차는 타지 마세요.',
            evidence:
              'KRIC subwayRouteInfo + stationElevatorCarNumber · 굽은다리 승강장 2',
            platformGap: toPlatformGap(9),
          },
          {
            order: 5,
            type: JOURNEY_STEP_TYPE.ELEVATOR,
            stationName: '굽은다리',
            instruction:
              '굽은다리역에서 내린 뒤 3호차 2번 문 근처의 엘리베이터를 타고 B2 명일 방면 승강장에서 B1 대합실로 이동하세요.',
            facilityGroupId: 'gubeundari-platform',
            evidence:
              'KRIC stationMovement 역순 + stationElevatorCarNumber · 굽은다리',
          },
          {
            order: 6,
            type: JOURNEY_STEP_TYPE.EXIT,
            stationName: '굽은다리',
            instruction:
              '개찰구를 통과한 뒤 2번 출구 엘리베이터로 지상에 올라가세요.',
            facilityGroupId: 'gubeundari-surface',
            evidence: 'SeoulMetroFaciInfo + KRIC stationElevator',
          },
        ],
      },
    ],
  },
  {
    id: 'dapsimni-to-hongik',
    originStationCode: '2543',
    originStationName: '답십리',
    destinationStationCode: '0239',
    destinationStationName: '홍대입구',
    dataVersion: '2026-09-17.t02.1',
    verifiedAt: '2026-09-17',
    candidates: [
      {
        id: 'transfer-at-ddp',
        label: '동대문역사문화공원 환승',
        priority: 1,
        transferStation: '동대문역사문화공원',
        lines: ['5호선', '2호선'],
        facilityGroups: [
          ...DAPSIMNI_WEST_ENTRY,
          {
            id: 'ddp-transfer-elevators',
            label: '동대문역사문화공원 환승 엘리베이터',
            policy: 'all',
            facilities: [
              {
                id: 'ddp-line-5-internal-2',
                stationCode: '2537',
                stationName: '동대문역사문화공원',
                role: '5호선 B5 승강장에서 4호선 환승 통로 방향으로 이동',
                sourceFacilityName:
                  '승강기)엘리베이터-동역사(5) 내부2',
                expectedOperatingSection: 'B1-B5',
                expectedLocation: '청구방면 1-1,을지로4가 방면10-4',
              },
              {
                id: 'ddp-line-4-internal-1',
                stationCode: '0422',
                stationName: '동대문역사문화공원',
                role: 'B3 4호선 승강장에서 B1 대합실로 이동',
                sourceFacilityName:
                  '승강기)엘리베이터-동역사(4) 섬식(상)4-4 내부#1',
                expectedOperatingSection: 'B3-B1',
                expectedLocation: '동대문 방면4-4,혜화 방면6-1',
              },
              {
                id: 'ddp-line-2-west-internal-1',
                stationCode: '0205',
                stationName: '동대문역사문화공원',
                role: 'B1 대합실에서 B2 을지로4가 방면 승강장으로 이동',
                sourceFacilityName:
                  '승강기)엘리베이터-동역사(2) 외선 8-3 내부#1',
                expectedOperatingSection: 'B2-B1',
                expectedLocation: '을지로4가 방면8-3',
              },
            ],
          },
          ...HONGIK_EXIT,
        ],
        steps: [
          ...DAPSIMNI_TO_HONGIK_COMMON_STEPS,
          {
            order: 5,
            type: JOURNEY_STEP_TYPE.TRANSFER,
            stationName: '동대문역사문화공원',
            instruction:
              '5호선 B5 승강장에서 내려 4호선 방향 엘리베이터, B1 대합실 방향 엘리베이터, 2호선 을지로4가 방면 엘리베이터를 순서대로 이용하세요.',
            facilityGroupId: 'ddp-transfer-elevators',
            evidence: 'KRIC transferMovement · 5호선→2호선 을지로4가 방면',
          },
          {
            order: 6,
            type: JOURNEY_STEP_TYPE.TRAIN,
            stationName: '동대문역사문화공원',
            instruction: '2호선 을지로4가·홍대입구 방면 열차를 타세요.',
            evidence: 'KRIC transferMovement + subwayRouteInfo',
          },
          {
            order: 7,
            type: JOURNEY_STEP_TYPE.ELEVATOR,
            stationName: '홍대입구',
            instruction:
              '합정 방면 승강장에서 내린 뒤 엘리베이터로 B1 대합실까지 이동하세요.',
            facilityGroupId: 'hongik-platform',
            evidence: 'KRIC stationMovement · 홍대입구 합정 방면 역순',
          },
          {
            order: 8,
            type: JOURNEY_STEP_TYPE.EXIT,
            stationName: '홍대입구',
            instruction:
              '개찰구를 통과하고 8번 출구 엘리베이터를 타고 지상으로 이동하세요.',
            facilityGroupId: 'hongik-surface',
            evidence: 'KRIC stationMovement · 홍대입구 합정 방면 역순',
          },
        ],
      },
      {
        id: 'transfer-at-euljiro4',
        label: '을지로4가 환승',
        priority: 2,
        transferStation: '을지로4가',
        lines: ['5호선', '2호선'],
        facilityGroups: [
          ...DAPSIMNI_WEST_ENTRY,
          {
            id: 'euljiro4-transfer-elevator',
            label: '을지로4가 환승 엘리베이터',
            policy: 'all',
            facilities: [
              {
                id: 'euljiro4-line-5-internal-1',
                stationCode: '2536',
                stationName: '을지로4가',
                role: '5호선 B5 승강장에서 2호선 B2 승강장으로 이동',
                sourceFacilityName: '승강기)엘리베이터-을지로4가 내부1',
                expectedOperatingSection: 'B1-B5',
                expectedLocation:
                  '동대문역사문화공원방면 1-1,종로3가방면 10-4',
              },
            ],
          },
          ...HONGIK_EXIT,
        ],
        steps: [
          ...DAPSIMNI_TO_HONGIK_COMMON_STEPS,
          {
            order: 5,
            type: JOURNEY_STEP_TYPE.TRANSFER,
            stationName: '을지로4가',
            instruction:
              '5호선 B5 승강장에서 내려 대합실 방향 엘리베이터를 이용해 2호선 B2 을지로3가 방면 승강장으로 이동하세요.',
            facilityGroupId: 'euljiro4-transfer-elevator',
            evidence: 'KRIC transferMovement · 5호선→2호선 을지로3가 방면',
          },
          {
            order: 6,
            type: JOURNEY_STEP_TYPE.TRAIN,
            stationName: '을지로4가',
            instruction: '2호선 을지로3가·홍대입구 방면 열차를 타세요.',
            evidence: 'KRIC transferMovement + subwayRouteInfo',
          },
          {
            order: 7,
            type: JOURNEY_STEP_TYPE.ELEVATOR,
            stationName: '홍대입구',
            instruction:
              '합정 방면 승강장에서 내린 뒤 엘리베이터로 B1 대합실까지 이동하세요.',
            facilityGroupId: 'hongik-platform',
            evidence: 'KRIC stationMovement · 홍대입구 합정 방면 역순',
          },
          {
            order: 8,
            type: JOURNEY_STEP_TYPE.EXIT,
            stationName: '홍대입구',
            instruction:
              '개찰구를 통과하고 8번 출구 엘리베이터를 타고 지상으로 이동하세요.',
            facilityGroupId: 'hongik-surface',
            evidence: 'KRIC stationMovement · 홍대입구 합정 방면 역순',
          },
        ],
      },
    ],
  },
];
