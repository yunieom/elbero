// Generated from the 7-line KRIC/Seoul audit and manual verification.
export const LINE_7_GUIDANCE = {
  dataVersion: '2026-09-28T01:35:56.606Z.manual-2026-09-29',
  verifiedAt: '2026-09-29',
  topology: [
    '2711',
    '2712',
    '2713',
    '2714',
    '2715',
    '2716',
    '2717',
    '2718',
    '2719',
    '2720',
    '2721',
    '2722',
    '2723',
    '2724',
    '2725',
    '2726',
    '2727',
    '2728',
    '2729',
    '2730',
    '2731',
    '2732',
    '2733',
    '2734',
    '2735',
    '2736',
    '2737',
    '2738',
    '2739',
    '2740',
    '2741',
    '2742',
    '2743',
    '2744',
    '2745',
    '2746',
    '2747',
    '2748',
    '2749',
    '2750',
    '2751',
    '2752',
    '0751',
    '0752',
    '0753',
    '0754',
    '0755',
    '0756',
    '0757',
    '0758',
    '0759',
    '0760',
    '0761',
  ],
  stations: [
    {
      stationCode: '2711',
      stationName: '장암',
      exitNumbers: ['1'],
      verificationMethod: 'manual_verification',
      liveElevators: [],
      directions: [
        {
          toward: '도봉산',
          platformNumber: '2',
          recommendedDoors: ['4-3'],
          doorGaps: [
            {
              door: '4-3',
              gap: null,
            },
          ],
          accessibilityVerified: false,
          warning: '승강장 이격거리 미확인',
          source: 'manual_verification',
        },
      ],
    },
    {
      stationCode: '2712',
      stationName: '도봉산',
      exitNumbers: ['2'],
      verificationMethod: 'manual_verification',
      liveElevators: [
        {
          id: '2712-live-1',
          name: '승강기)엘리베이터-도봉산(7) 내부3',
          operatingSection: '1F-2F',
          location: '장암 방면3-4',
          kind: 'platform',
        },
        {
          id: '2712-live-2',
          name: '승강기)엘리베이터-도봉산(7) 내부4',
          operatingSection: '1F-2F',
          location: '수락산 방면4-2',
          kind: 'platform',
        },
        {
          id: '2712-live-3',
          name: '승강기)엘리베이터-도봉산(7) 외부1',
          operatingSection: '1F-2F',
          location: '장암 방면7-2',
          kind: 'platform',
        },
        {
          id: '2712-live-4',
          name: '승강기)엘리베이터-도봉산(7) 외부2',
          operatingSection: '1F-2F',
          location: '수락산 방면1-4',
          kind: 'platform',
        },
        {
          id: '2712-live-5',
          name: '승강기)엘리베이터-도봉산(7) 외부5',
          operatingSection: 'B1-1F',
          location: '1-1번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '장암',
          platformNumber: '1',
          recommendedDoors: ['7-3'],
          doorGaps: [
            {
              door: '7-3',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '수락산',
          platformNumber: '2',
          recommendedDoors: ['1-4'],
          doorGaps: [
            {
              door: '1-4',
              gap: {
                distanceCm: 13,
                level: 'yellow',
                label: '유의',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2713',
      stationName: '수락산',
      exitNumbers: ['1'],
      verificationMethod: 'manual_verification',
      liveElevators: [
        {
          id: '2713-live-1',
          name: '승강기)엘리베이터-수락산 외부1',
          operatingSection: 'B2-1F',
          location: '1번 출입구',
          kind: 'surface',
        },
        {
          id: '2713-live-2',
          name: '승강기)엘리베이터-수락산역 내부 2호기',
          operatingSection: 'B3-B2',
          location: '도봉산 방면1-1',
          kind: 'platform',
        },
        {
          id: '2713-live-3',
          name: '승강기)엘리베이터-수락산역 내부 3호기',
          operatingSection: 'B3-B2',
          location: '마들 방면8-2',
          kind: 'platform',
        },
      ],
      directions: [
        {
          toward: '도봉산',
          platformNumber: '1',
          recommendedDoors: ['1-1'],
          doorGaps: [
            {
              door: '1-1',
              gap: {
                distanceCm: 7,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'manual_verification',
        },
        {
          toward: '마들',
          platformNumber: '2',
          recommendedDoors: ['8-2'],
          doorGaps: [
            {
              door: '8-2',
              gap: {
                distanceCm: 8,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'manual_verification',
        },
      ],
    },
    {
      stationCode: '2714',
      stationName: '마들',
      exitNumbers: ['2', '4', '5'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2714-live-1',
          name: '승강기)엘리베이터-마들 내부1',
          operatingSection: 'B1-B3',
          location: '수락산 방면8-4, 노원 방면1-1',
          kind: 'platform',
        },
        {
          id: '2714-live-2',
          name: '승강기)엘리베이터-마들 외부2',
          operatingSection: 'B1-1F',
          location: '5번 출입구',
          kind: 'surface',
        },
        {
          id: '2714-live-3',
          name: '승강기)엘리베이터-마들 외부3',
          operatingSection: 'B1-1F',
          location: '4번 출입구',
          kind: 'surface',
        },
        {
          id: '2714-live-4',
          name: '승강기)엘리베이터-마들 외부4',
          operatingSection: 'B1-1F',
          location: '2번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '수락산',
          platformNumber: '1',
          recommendedDoors: [],
          doorGaps: [],
          accessibilityVerified: false,
          warning: '엘리베이터 안전 경로 미확인',
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '노원',
          platformNumber: '2',
          recommendedDoors: ['1-1'],
          doorGaps: [
            {
              door: '1-1',
              gap: {
                distanceCm: 8,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2715',
      stationName: '노원',
      exitNumbers: ['3', '6'],
      verificationMethod: 'manual_verification',
      liveElevators: [
        {
          id: '2715-live-1',
          name: '승강기)엘리베이터-노원(7) 3번 출구측 외부2',
          operatingSection: 'B1-1F',
          location: '3번 출입구',
          kind: 'surface',
        },
        {
          id: '2715-live-2',
          name: '승강기)엘리베이터-노원(7) 5번 출구측 외부4',
          operatingSection: 'B1-1F',
          location: '5번 출입구',
          kind: 'surface',
        },
        {
          id: '2715-live-3',
          name: '승강기)엘리베이터-노원(7) 6번 출구측 외부3',
          operatingSection: 'B1-1F',
          location: '6번 출입구',
          kind: 'surface',
        },
        {
          id: '2715-live-4',
          name: '승강기)엘리베이터-노원(7) 내부1',
          operatingSection: 'B3-B2-B1',
          location: '마들 방면4-4, 중계 방면4-3',
          kind: 'platform',
        },
      ],
      directions: [
        {
          toward: '마들',
          platformNumber: '1',
          recommendedDoors: ['1-1'],
          doorGaps: [
            {
              door: '1-1',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '중계',
          platformNumber: '2',
          recommendedDoors: ['8-4'],
          doorGaps: [
            {
              door: '8-4',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2716',
      stationName: '중계',
      exitNumbers: ['3', '5'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2716-live-1',
          name: '승강기)엘리베이터-중계 내부1',
          operatingSection: 'B2-B3',
          location: '노원 방면5-1, 하계 방면4-4',
          kind: 'platform',
        },
        {
          id: '2716-live-2',
          name: '승강기)엘리베이터-중계 외부2',
          operatingSection: 'B2-1F',
          location: '5번 출입구',
          kind: 'surface',
        },
        {
          id: '2716-live-3',
          name: '승강기)엘리베이터-중계 외부3',
          operatingSection: 'B2-B1-1F',
          location: '3번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '노원',
          platformNumber: '1',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 10,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '하계',
          platformNumber: '2',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 10,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2717',
      stationName: '하계',
      exitNumbers: ['1', '6'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2717-live-1',
          name: '승강기)엘리베이터-하계 내부2',
          operatingSection: 'B3-B2-B1',
          location: '중계 방면4-4, 공릉 방면5-1',
          kind: 'platform',
        },
        {
          id: '2717-live-2',
          name: '승강기)엘리베이터-하계 외부3',
          operatingSection: 'B1-1F',
          location: '1번 출입구',
          kind: 'surface',
        },
        {
          id: '2717-live-3',
          name: '승강기)엘리베이터-하계 외부4',
          operatingSection: 'B1-1F',
          location: '6번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '중계',
          platformNumber: '1',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '공릉',
          platformNumber: '2',
          recommendedDoors: ['5-1'],
          doorGaps: [
            {
              door: '5-1',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2718',
      stationName: '공릉',
      exitNumbers: ['2'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2718-live-1',
          name: '승강기)엘리베이터-공릉 내부1',
          operatingSection: 'B2-B4',
          location: '하계 방면 8-4',
          kind: 'platform',
        },
        {
          id: '2718-live-2',
          name: '승강기)엘리베이터-공릉 내부2',
          operatingSection: 'B1-B4',
          location: '태릉입구 방면 1-1',
          kind: 'platform',
        },
        {
          id: '2718-live-3',
          name: '승강기)엘리베이터-공릉 외부3',
          operatingSection: 'B1-1F',
          location: '2번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '하계',
          platformNumber: '1',
          recommendedDoors: ['8-4'],
          doorGaps: [
            {
              door: '8-4',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '태릉입구',
          platformNumber: '2',
          recommendedDoors: ['1-1'],
          doorGaps: [
            {
              door: '1-1',
              gap: {
                distanceCm: 8,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2719',
      stationName: '태릉입구',
      exitNumbers: ['2', '6', '8'],
      verificationMethod: 'manual_verification',
      liveElevators: [
        {
          id: '2719-live-1',
          name: '승강기)엘리베이터-태릉입구(7) 내부1',
          operatingSection: 'B4-B1',
          location: '공릉 방면6-4',
          kind: 'platform',
        },
        {
          id: '2719-live-2',
          name: '승강기)엘리베이터-태릉입구(7) 외부2',
          operatingSection: 'B4-1F',
          location: '2번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '공릉',
          platformNumber: '1',
          recommendedDoors: ['6-3'],
          doorGaps: [
            {
              door: '6-3',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '먹골',
          platformNumber: '2',
          recommendedDoors: ['3-1'],
          doorGaps: [
            {
              door: '3-1',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2720',
      stationName: '먹골',
      exitNumbers: ['2'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2720-live-1',
          name: '승강기)엘리베이터-먹골 내부1',
          operatingSection: 'B2-B3',
          location: '태릉입구 방면4-4',
          kind: 'platform',
        },
        {
          id: '2720-live-2',
          name: '승강기)엘리베이터-먹골 내부2',
          operatingSection: 'B2-B3',
          location: '중화 방면5-1',
          kind: 'platform',
        },
        {
          id: '2720-live-3',
          name: '승강기)엘리베이터-먹골 외부3',
          operatingSection: 'B2-B1-1F',
          location: '2번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '태릉입구',
          platformNumber: '1',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '중화',
          platformNumber: '2',
          recommendedDoors: ['5-1'],
          doorGaps: [
            {
              door: '5-1',
              gap: {
                distanceCm: 7,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2721',
      stationName: '중화',
      exitNumbers: ['3'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2721-live-1',
          name: '승강기)엘리베이터-중화 내부1',
          operatingSection: 'B1-B2-B3',
          location: '먹골 방면4-4',
          kind: 'platform',
        },
        {
          id: '2721-live-2',
          name: '승강기)엘리베이터-중화 내부2',
          operatingSection: 'B2-B3',
          location: '상봉 방면5-1',
          kind: 'platform',
        },
        {
          id: '2721-live-3',
          name: '승강기)엘리베이터-중화 외부3',
          operatingSection: 'B1-1F',
          location: '3번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '먹골',
          platformNumber: '1',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '상봉',
          platformNumber: '2',
          recommendedDoors: ['5-1'],
          doorGaps: [
            {
              door: '5-1',
              gap: {
                distanceCm: 8,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2722',
      stationName: '상봉',
      exitNumbers: ['2'],
      verificationMethod: 'manual_verification',
      liveElevators: [
        {
          id: '2722-live-1',
          name: '승강기)엘리베이터-상봉(7) 내부1',
          operatingSection: 'B3-B2-B1',
          location: '중화 방면3-2',
          kind: 'platform',
        },
        {
          id: '2722-live-2',
          name: '승강기)엘리베이터-상봉(7) 내부2',
          operatingSection: 'B3-B2-B1',
          location: '면목 방면6-2',
          kind: 'platform',
        },
        {
          id: '2722-live-3',
          name: '승강기)엘리베이터-상봉(7) 내부3',
          operatingSection: 'B2-B3',
          location: '중화 방면4-2',
          kind: 'platform',
        },
        {
          id: '2722-live-4',
          name: '승강기)엘리베이터-상봉(7) 내부4',
          operatingSection: 'B2-B3',
          location: '면목 방면5-1',
          kind: 'platform',
        },
        {
          id: '2722-live-5',
          name: '승강기)엘리베이터-상봉(7) 외부5',
          operatingSection: 'B1-1F',
          location: '3번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '중화',
          platformNumber: '1',
          recommendedDoors: ['3-2', '4-4'],
          doorGaps: [
            {
              door: '3-2',
              gap: {
                distanceCm: 7,
                level: 'green',
                label: '안전',
              },
            },
            {
              door: '4-4',
              gap: {
                distanceCm: 3,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '면목',
          platformNumber: '2',
          recommendedDoors: ['5-1', '6-2'],
          doorGaps: [
            {
              door: '5-1',
              gap: {
                distanceCm: 8,
                level: 'green',
                label: '안전',
              },
            },
            {
              door: '6-2',
              gap: {
                distanceCm: 3,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2723',
      stationName: '면목',
      exitNumbers: ['3'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2723-live-1',
          name: '승강기)엘리베이터-면목 내부1',
          operatingSection: 'B1-B3-B4',
          location: '상봉 방면4-4',
          kind: 'platform',
        },
        {
          id: '2723-live-2',
          name: '승강기)엘리베이터-면목 내부2',
          operatingSection: 'B3-B4',
          location: '사가정 방면5-2',
          kind: 'platform',
        },
        {
          id: '2723-live-3',
          name: '승강기)엘리베이터-면목 외부3',
          operatingSection: 'B1-1F',
          location: '3번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '상봉',
          platformNumber: '1',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 11,
                level: 'yellow',
                label: '유의',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '사가정',
          platformNumber: '2',
          recommendedDoors: ['5-2'],
          doorGaps: [
            {
              door: '5-2',
              gap: {
                distanceCm: 12,
                level: 'yellow',
                label: '유의',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2724',
      stationName: '사가정',
      exitNumbers: ['3'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2724-live-1',
          name: '승강기)엘리베이터-사가정 내부1',
          operatingSection: 'B3-B4',
          location: '면목 방면3-3',
          kind: 'platform',
        },
        {
          id: '2724-live-2',
          name: '승강기)엘리베이터-사가정 내부2',
          operatingSection: 'B1-B3-B4',
          location: '용마산 방면6-2',
          kind: 'platform',
        },
        {
          id: '2724-live-3',
          name: '승강기)엘리베이터-사가정 외부3',
          operatingSection: 'B1-1F',
          location: '3번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '면목',
          platformNumber: '1',
          recommendedDoors: ['3-3'],
          doorGaps: [
            {
              door: '3-3',
              gap: {
                distanceCm: 7,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '용마산',
          platformNumber: '2',
          recommendedDoors: ['6-2'],
          doorGaps: [
            {
              door: '6-2',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2725',
      stationName: '용마산',
      exitNumbers: ['1'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2725-live-1',
          name: '승강기)엘리베이터-용마산 내부1',
          operatingSection: 'B3-B4',
          location: '사가정 방면3-3',
          kind: 'platform',
        },
        {
          id: '2725-live-2',
          name: '승강기)엘리베이터-용마산 내부2',
          operatingSection: 'B1-B4',
          location: '중곡 방면6-1',
          kind: 'platform',
        },
        {
          id: '2725-live-3',
          name: '승강기)엘리베이터-용마산 외부3',
          operatingSection: 'B1-1F-2F',
          location: '1번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '사가정',
          platformNumber: '1',
          recommendedDoors: ['2-4', '4-3'],
          doorGaps: [
            {
              door: '2-4',
              gap: {
                distanceCm: 4,
                level: 'green',
                label: '안전',
              },
            },
            {
              door: '4-3',
              gap: {
                distanceCm: 4,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '중곡',
          platformNumber: '2',
          recommendedDoors: ['6-1'],
          doorGaps: [
            {
              door: '6-1',
              gap: {
                distanceCm: 8,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2726',
      stationName: '중곡',
      exitNumbers: ['1'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2726-live-1',
          name: '승강기)엘리베이터-중곡 내부1',
          operatingSection: 'B2-B3',
          location: '용마산 방면4-4',
          kind: 'platform',
        },
        {
          id: '2726-live-2',
          name: '승강기)엘리베이터-중곡 내부2',
          operatingSection: 'B2-B3',
          location: '군자 방면5-1',
          kind: 'platform',
        },
        {
          id: '2726-live-3',
          name: '승강기)엘리베이터-중곡 외부3',
          operatingSection: 'B2-1F',
          location: '1번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '용마산',
          platformNumber: '1',
          recommendedDoors: ['5-1'],
          doorGaps: [
            {
              door: '5-1',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '군자',
          platformNumber: '2',
          recommendedDoors: ['5-1'],
          doorGaps: [
            {
              door: '5-1',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2727',
      stationName: '군자',
      exitNumbers: ['4', '7'],
      verificationMethod: 'manual_verification',
      liveElevators: [
        {
          id: '2727-live-1',
          name: '승강기)엘리베이터-군자(7) 7번출구측 외부1',
          operatingSection: 'B1-1F',
          location: '7번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '중곡',
          platformNumber: '1',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '어린이대공원',
          platformNumber: '2',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2728',
      stationName: '어린이대공원',
      exitNumbers: ['1', '5'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2728-live-1',
          name: '승강기)엘리베이터-어린이대공원 내부1',
          operatingSection: 'B3-B2-B1',
          location: '군자 방면3-3',
          kind: 'platform',
        },
        {
          id: '2728-live-2',
          name: '승강기)엘리베이터-어린이대공원 내부2',
          operatingSection: 'B3-B2-B1',
          location: '건대입구 방면6-2',
          kind: 'platform',
        },
        {
          id: '2728-live-3',
          name: '승강기)엘리베이터-어린이대공원 외부3',
          operatingSection: 'B1-1F',
          location: '1번 출입구',
          kind: 'surface',
        },
        {
          id: '2728-live-4',
          name: '승강기)엘리베이터-어린이대공원 외부4',
          operatingSection: 'B1-1F',
          location: '5번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '군자',
          platformNumber: '1',
          recommendedDoors: ['3-3'],
          doorGaps: [
            {
              door: '3-3',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '건대입구',
          platformNumber: '2',
          recommendedDoors: ['6-2'],
          doorGaps: [
            {
              door: '6-2',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2729',
      stationName: '건대입구',
      exitNumbers: ['3'],
      verificationMethod: 'manual_verification',
      liveElevators: [
        {
          id: '2729-live-1',
          name: '승강기)엘리베이터-건대입구(7) 내부1',
          operatingSection: 'B2-B3',
          location: '어린이대공원 방면5-4',
          kind: 'platform',
        },
        {
          id: '2729-live-2',
          name: '승강기)엘리베이터-건대입구(7) 내부2',
          operatingSection: 'B2-B3',
          location: '자양방면 4-1',
          kind: 'platform',
        },
      ],
      directions: [
        {
          toward: '어린이대공원',
          platformNumber: '1',
          recommendedDoors: ['7-1'],
          doorGaps: [
            {
              door: '7-1',
              gap: {
                distanceCm: 8,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '자양',
          platformNumber: '2',
          recommendedDoors: [],
          doorGaps: [],
          accessibilityVerified: false,
          warning: '엘리베이터 안전 경로 미확인',
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2730',
      stationName: '자양',
      exitNumbers: ['1'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2730-live-1',
          name: '승강기)엘리베이터-자양역 내부2',
          operatingSection: '2F-3F',
          location: '건대입구 방면1-4',
          kind: 'platform',
        },
        {
          id: '2730-live-2',
          name: '승강기)엘리베이터-자양역 내부3',
          operatingSection: '2F-3F',
          location: '청담 방면7-4',
          kind: 'platform',
        },
        {
          id: '2730-live-3',
          name: '승강기)엘리베이터-자양역 외부1',
          operatingSection: '1F-2F',
          location: '1번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '건대입구',
          platformNumber: '1',
          recommendedDoors: ['1-4'],
          doorGaps: [
            {
              door: '1-4',
              gap: {
                distanceCm: 4,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '청담',
          platformNumber: '2',
          recommendedDoors: ['7-4'],
          doorGaps: [
            {
              door: '7-4',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2731',
      stationName: '청담',
      exitNumbers: ['5', '10'],
      verificationMethod: 'manual_verification',
      liveElevators: [
        {
          id: '2731-live-1',
          name: '승강기)엘리베이터-청담 내부 E/L 3호기',
          operatingSection: 'B3-B4',
          location: '장암 방면7-4',
          kind: 'platform',
        },
        {
          id: '2731-live-2',
          name: '승강기)엘리베이터-청담 내부 E/L 4호기',
          operatingSection: 'B3-B4',
          location: '석남 방면2-1',
          kind: 'platform',
        },
        {
          id: '2731-live-3',
          name: '승강기)엘리베이터-청담 외부1',
          operatingSection: 'B3-1F',
          location: '5번 출입구',
          kind: 'surface',
        },
        {
          id: '2731-live-4',
          name: '승강기)엘리베이터-청담 외부2',
          operatingSection: 'B3-1F',
          location: '10번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '장암',
          platformNumber: '1',
          recommendedDoors: ['7-4'],
          doorGaps: [
            {
              door: '7-4',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'manual_verification',
        },
        {
          toward: '석남',
          platformNumber: '2',
          recommendedDoors: ['2-1'],
          doorGaps: [
            {
              door: '2-1',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'manual_verification',
        },
      ],
    },
    {
      stationCode: '2732',
      stationName: '강남구청',
      exitNumbers: ['1', '2', '3-1', '4'],
      verificationMethod: 'manual_verification',
      liveElevators: [
        {
          id: '2732-live-1',
          name: '승강기)엘리베이터-강남구청(7) 내부1',
          operatingSection: 'B2-B3',
          location: '청담 방면1-1',
          kind: 'platform',
        },
        {
          id: '2732-live-2',
          name: '승강기)엘리베이터-강남구청(7) 내부2',
          operatingSection: 'B2-B3',
          location: '학동 방면8-4',
          kind: 'platform',
        },
      ],
      directions: [
        {
          toward: '청담',
          platformNumber: '1',
          recommendedDoors: ['1-1'],
          doorGaps: [
            {
              door: '1-1',
              gap: {
                distanceCm: 11,
                level: 'yellow',
                label: '유의',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '학동',
          platformNumber: '2',
          recommendedDoors: ['8-4'],
          doorGaps: [
            {
              door: '8-4',
              gap: {
                distanceCm: 8,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2733',
      stationName: '학동',
      exitNumbers: ['3'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2733-live-1',
          name: '승강기)엘리베이터-학동 내부1',
          operatingSection: 'B2-B3',
          location: '강남구청 방면4-4',
          kind: 'platform',
        },
        {
          id: '2733-live-2',
          name: '승강기)엘리베이터-학동 내부2',
          operatingSection: 'B2-B3',
          location: '논현 방면5-1',
          kind: 'platform',
        },
        {
          id: '2733-live-3',
          name: '승강기)엘리베이터-학동 외부3',
          operatingSection: 'B2-1F',
          location: '3번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '강남구청',
          platformNumber: '1',
          recommendedDoors: ['5-1'],
          doorGaps: [
            {
              door: '5-1',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '논현',
          platformNumber: '2',
          recommendedDoors: [],
          doorGaps: [],
          accessibilityVerified: false,
          warning: '엘리베이터 안전 경로 미확인',
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2734',
      stationName: '논현',
      exitNumbers: ['3', '4', '10'],
      verificationMethod: 'manual_verification',
      liveElevators: [
        {
          id: '2734-live-1',
          name: '승강기)엘리베이터-논현 내부1',
          operatingSection: 'B2-B3',
          location: '학동 방면7-4',
          kind: 'platform',
        },
        {
          id: '2734-live-2',
          name: '승강기)엘리베이터-논현 내부2',
          operatingSection: 'B2-B3',
          location: '반포 방면2-1',
          kind: 'platform',
        },
        {
          id: '2734-live-3',
          name: '승강기)엘리베이터-논현 외부3',
          operatingSection: 'B2-1F',
          location: '10번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '학동',
          platformNumber: '1',
          recommendedDoors: ['7-3'],
          doorGaps: [
            {
              door: '7-3',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '반포',
          platformNumber: '2',
          recommendedDoors: ['2-2'],
          doorGaps: [
            {
              door: '2-2',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2735',
      stationName: '반포',
      exitNumbers: ['1', '6'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2735-live-1',
          name: '승강기)엘리베이터-반포 내부1',
          operatingSection: 'B2-B3',
          location: '논현 방면5-1',
          kind: 'platform',
        },
        {
          id: '2735-live-2',
          name: '승강기)엘리베이터-반포 내부2',
          operatingSection: 'B2-B3',
          location: '고속터미널(7) 방면4-4',
          kind: 'platform',
        },
        {
          id: '2735-live-3',
          name: '승강기)엘리베이터-반포 외부3',
          operatingSection: 'B2-1F',
          location: '6번 출입구',
          kind: 'surface',
        },
        {
          id: '2735-live-4',
          name: '승강기)엘리베이터-반포 외부4',
          operatingSection: 'B2-1F',
          location: '1번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '논현',
          platformNumber: '1',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '고속터미널',
          platformNumber: '2',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2736',
      stationName: '고속터미널',
      exitNumbers: [],
      verificationMethod: 'manual_verification',
      liveElevators: [
        {
          id: '2736-live-1',
          name: '승강기)엘리베이터-고속터미널(7) 내부1',
          operatingSection: 'B3-B2',
          location: '반포 방면3-3',
          kind: 'platform',
        },
        {
          id: '2736-live-2',
          name: '승강기)엘리베이터-고속터미널(7) 내부2',
          operatingSection: 'B3-B2',
          location: '내방 방면6-2',
          kind: 'platform',
        },
        {
          id: '2736-live-3',
          name: '승강기)엘리베이터_고속터미널(7)역 4번출구 E/L 3호기 15인승(P2',
          operatingSection: 'B2-1F',
          location: '4번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '반포',
          platformNumber: '1',
          recommendedDoors: ['3-2'],
          doorGaps: [
            {
              door: '3-2',
              gap: {
                distanceCm: 7,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '내방',
          platformNumber: '2',
          recommendedDoors: ['6-2'],
          doorGaps: [
            {
              door: '6-2',
              gap: {
                distanceCm: 14,
                level: 'yellow',
                label: '유의',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2737',
      stationName: '내방',
      exitNumbers: ['3', '5'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2737-live-1',
          name: '승강기)엘리베이터-내방 내부1',
          operatingSection: 'B2-B3',
          location: '고속터미널(7) 방면 5-2',
          kind: 'platform',
        },
        {
          id: '2737-live-2',
          name: '승강기)엘리베이터-내방 내부2',
          operatingSection: 'B2-B3',
          location: '이수(7) 방면 4-2',
          kind: 'platform',
        },
        {
          id: '2737-live-3',
          name: '승강기)엘리베이터-내방 내부3',
          operatingSection: 'B1-B2',
          location: '고객안전실 측',
          kind: 'platform',
        },
        {
          id: '2737-live-4',
          name: '승강기)엘리베이터-내방 외부4',
          operatingSection: 'B1-1F',
          location: '3번 출입구',
          kind: 'surface',
        },
        {
          id: '2737-live-5',
          name: '승강기)엘리베이터-내방 외부5',
          operatingSection: 'B1-1F',
          location: '5번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '고속터미널',
          platformNumber: '1',
          recommendedDoors: ['5-2'],
          doorGaps: [
            {
              door: '5-2',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '총신대입구',
          platformNumber: '2',
          recommendedDoors: ['4-2'],
          doorGaps: [
            {
              door: '4-2',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2738',
      stationName: '총신대입구',
      exitNumbers: ['11'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2738-live-1',
          name: '승강기)엘리베이터-이수(7) 내부1',
          operatingSection: 'B3-B4',
          location: '내방 방면4-2',
          kind: 'platform',
        },
        {
          id: '2738-live-2',
          name: '승강기)엘리베이터-이수(7) 내부2',
          operatingSection: 'B3-B4',
          location: '남성 방면5-3',
          kind: 'platform',
        },
        {
          id: '2738-live-3',
          name: '승강기)엘리베이터-이수(7) 외부3',
          operatingSection: 'B3-1F',
          location: '11번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '내방',
          platformNumber: '1',
          recommendedDoors: ['4-2'],
          doorGaps: [
            {
              door: '4-2',
              gap: {
                distanceCm: 6,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '남성',
          platformNumber: '2',
          recommendedDoors: ['5-2'],
          doorGaps: [
            {
              door: '5-2',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2739',
      stationName: '남성',
      exitNumbers: ['2', '3'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2739-live-1',
          name: '승강기)엘리베이터-남성 2번 출입구 외부4',
          operatingSection: 'B2-1F',
          location: '2번 출입구',
          kind: 'surface',
        },
        {
          id: '2739-live-2',
          name: '승강기)엘리베이터-남성 내부1',
          operatingSection: 'B2-B3',
          location: '이수(7) 방면6-2',
          kind: 'platform',
        },
        {
          id: '2739-live-3',
          name: '승강기)엘리베이터-남성 내부2',
          operatingSection: 'B2-B3',
          location: '숭실대입구 방면3-3',
          kind: 'platform',
        },
        {
          id: '2739-live-4',
          name: '승강기)엘리베이터-남성 외부3',
          operatingSection: 'B2-B1-1F',
          location: '3번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '총신대입구',
          platformNumber: '1',
          recommendedDoors: ['6-3'],
          doorGaps: [
            {
              door: '6-3',
              gap: {
                distanceCm: 8,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '숭실대입구',
          platformNumber: '2',
          recommendedDoors: ['3-3'],
          doorGaps: [
            {
              door: '3-3',
              gap: {
                distanceCm: 4,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2740',
      stationName: '숭실대입구',
      exitNumbers: ['2', '3'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2740-live-1',
          name: '승강기)엘리베이터-숭실대입구 내부1',
          operatingSection: 'B2-B6',
          location: '남성 방면6-1',
          kind: 'platform',
        },
        {
          id: '2740-live-2',
          name: '승강기)엘리베이터-숭실대입구 내부2',
          operatingSection: 'B2-B6',
          location: '상도 방면3-3',
          kind: 'platform',
        },
        {
          id: '2740-live-3',
          name: '승강기)엘리베이터-숭실대입구 외부3',
          operatingSection: 'B2-1F',
          location: '2번 출입구',
          kind: 'surface',
        },
        {
          id: '2740-live-4',
          name: '승강기)엘리베이터-숭실대입구 외부4',
          operatingSection: 'B2-1F',
          location: '3번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '남성',
          platformNumber: '1',
          recommendedDoors: ['6-2'],
          doorGaps: [
            {
              door: '6-2',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '상도',
          platformNumber: '2',
          recommendedDoors: ['3-3'],
          doorGaps: [
            {
              door: '3-3',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2741',
      stationName: '상도',
      exitNumbers: ['5'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2741-live-1',
          name: '승강기)엘리베이터-상도 내부1',
          operatingSection: 'B2-B3',
          location: '숭실대입구 방면4-4',
          kind: 'platform',
        },
        {
          id: '2741-live-2',
          name: '승강기)엘리베이터-상도 내부2',
          operatingSection: 'B2-B3',
          location: '장승배기 방면4-4',
          kind: 'platform',
        },
        {
          id: '2741-live-3',
          name: '승강기)엘리베이터-상도 외부3',
          operatingSection: 'B2-1F',
          location: '5번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '숭실대입구',
          platformNumber: '1',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '장승배기',
          platformNumber: '2',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2742',
      stationName: '장승배기',
      exitNumbers: ['2'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2742-live-1',
          name: '승강기)엘리베이터-장승배기 내부1',
          operatingSection: 'B2-B3',
          location: '상도 방면4-4',
          kind: 'platform',
        },
        {
          id: '2742-live-2',
          name: '승강기)엘리베이터-장승배기 내부2',
          operatingSection: 'B2-B3',
          location: '신대방삼거리 방면4-4',
          kind: 'platform',
        },
        {
          id: '2742-live-3',
          name: '승강기)엘리베이터-장승배기 외부3',
          operatingSection: 'B2-1F',
          location: '2번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '상도',
          platformNumber: '1',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 13,
                level: 'yellow',
                label: '유의',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '신대방삼거리',
          platformNumber: '2',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 6,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2743',
      stationName: '신대방삼거리',
      exitNumbers: ['2'],
      verificationMethod: 'manual_verification',
      liveElevators: [
        {
          id: '2743-live-1',
          name: '승강기)엘리베이터-신대방삼거리 내부1',
          operatingSection: 'B2-B3',
          location: '장승배기 방면4-4',
          kind: 'platform',
        },
        {
          id: '2743-live-2',
          name: '승강기)엘리베이터-신대방삼거리 내부2',
          operatingSection: 'B2-B3',
          location: '보라매 방면4-4',
          kind: 'platform',
        },
        {
          id: '2743-live-3',
          name: '승강기)엘리베이터-신대방삼거리 내부3',
          operatingSection: 'B1-B2',
          location: '고객안전실 측',
          kind: 'platform',
        },
        {
          id: '2743-live-4',
          name: '승강기)엘리베이터-신대방삼거리 외부4',
          operatingSection: 'B1-1F',
          location: '3번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '장승배기',
          platformNumber: '1',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '보라매',
          platformNumber: '2',
          recommendedDoors: [],
          doorGaps: [],
          accessibilityVerified: false,
          warning: '엘리베이터 안전 경로 미확인',
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2744',
      stationName: '보라매',
      exitNumbers: ['6'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2744-live-1',
          name: '승강기)엘리베이터-보라매 내부1',
          operatingSection: 'B1-B2',
          location: '신풍 방면5-1, 신대방삼거리 방면4-4',
          kind: 'platform',
        },
        {
          id: '2744-live-2',
          name: '승강기)엘리베이터-보라매 외부2',
          operatingSection: 'B1-1F',
          location: '6번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '신대방삼거리',
          platformNumber: '1',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '신풍',
          platformNumber: '2',
          recommendedDoors: ['5-1'],
          doorGaps: [
            {
              door: '5-1',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2745',
      stationName: '신풍',
      exitNumbers: ['4', '5'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2745-live-1',
          name: '승강기)엘리베이터-신풍 내부1',
          operatingSection: 'B1-B2',
          location: '보라매 방면5-4',
          kind: 'platform',
        },
        {
          id: '2745-live-2',
          name: '승강기)엘리베이터-신풍 내부2',
          operatingSection: 'B1-B2',
          location: '대림(7) 방면4-1',
          kind: 'platform',
        },
        {
          id: '2745-live-3',
          name: '승강기)엘리베이터-신풍 외부3',
          operatingSection: 'B1-1F',
          location: '4번 출입구',
          kind: 'surface',
        },
        {
          id: '2745-live-4',
          name: '승강기)엘리베이터-신풍 외부4',
          operatingSection: 'B1-1F',
          location: '5번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '보라매',
          platformNumber: '1',
          recommendedDoors: ['5-4'],
          doorGaps: [
            {
              door: '5-4',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '대림',
          platformNumber: '2',
          recommendedDoors: ['4-1'],
          doorGaps: [
            {
              door: '4-1',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2746',
      stationName: '대림',
      exitNumbers: ['10'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2746-live-1',
          name: '승강기)엘리베이터-대림(7) 내부1',
          operatingSection: 'B1-B2',
          location: '신풍 방면5-1',
          kind: 'platform',
        },
        {
          id: '2746-live-2',
          name: '승강기)엘리베이터-대림(7) 내부2',
          operatingSection: 'B1-B2',
          location: '남구로 방면4-4',
          kind: 'platform',
        },
        {
          id: '2746-live-3',
          name: '승강기)엘리베이터-대림(7) 외부3',
          operatingSection: 'B1-1F',
          location: '10번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '신풍',
          platformNumber: '1',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '남구로',
          platformNumber: '2',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2747',
      stationName: '남구로',
      exitNumbers: ['1'],
      verificationMethod: 'manual_verification',
      liveElevators: [
        {
          id: '2747-live-1',
          name: '승강기)엘리베이터-남구로 내부 1호기',
          operatingSection: 'B2-B5',
          location: '가산디지털단지방면 8-2',
          kind: 'platform',
        },
        {
          id: '2747-live-2',
          name: '승강기)엘리베이터-남구로 내부 2호기',
          operatingSection: 'B2-B5',
          location: '대림방면 1-4',
          kind: 'platform',
        },
        {
          id: '2747-live-3',
          name: '승강기)엘리베이터-남구로 외부 3호기',
          operatingSection: 'B1-1F',
          location: '1번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '장암',
          platformNumber: '1',
          recommendedDoors: ['1-4'],
          doorGaps: [
            {
              door: '1-4',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'manual_verification',
        },
        {
          toward: '석남',
          platformNumber: '2',
          recommendedDoors: ['8-2'],
          doorGaps: [
            {
              door: '8-2',
              gap: {
                distanceCm: 8,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'manual_verification',
        },
      ],
    },
    {
      stationCode: '2748',
      stationName: '가산디지털단지',
      exitNumbers: ['9'],
      verificationMethod: 'manual_verification',
      liveElevators: [
        {
          id: '2748-live-1',
          name: '승강기)엘리베이터-가산디지털단지(7) 내부1',
          operatingSection: 'B2-B3-B4',
          location: '남구로 방면5-4',
          kind: 'platform',
        },
        {
          id: '2748-live-2',
          name: '승강기)엘리베이터-가산디지털단지(7) 내부2',
          operatingSection: 'B2-B3-B4',
          location: '철산 방면4-1',
          kind: 'platform',
        },
        {
          id: '2748-live-3',
          name: '승강기)엘리베이터-가산디지털단지(7) 내부3',
          operatingSection: 'B1-B2',
          location: '대합실',
          kind: 'platform',
        },
        {
          id: '2748-live-4',
          name: '승강기)엘리베이터-가산디지털단지(7) 외부4',
          operatingSection: 'B1-1F',
          location: '9번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '남구로',
          platformNumber: '1',
          recommendedDoors: ['5-4'],
          doorGaps: [
            {
              door: '5-4',
              gap: {
                distanceCm: 7,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '철산',
          platformNumber: '2',
          recommendedDoors: ['4-1'],
          doorGaps: [
            {
              door: '4-1',
              gap: {
                distanceCm: 7,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2749',
      stationName: '철산',
      exitNumbers: ['1', '4'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2749-live-1',
          name: '승강기)엘리베이터-철산 내부1',
          operatingSection: 'B1-B2',
          location: '가산디지털단지 방면5-1',
          kind: 'platform',
        },
        {
          id: '2749-live-2',
          name: '승강기)엘리베이터-철산 내부2',
          operatingSection: 'B1-B2',
          location: '광명사거리 방면4-4',
          kind: 'platform',
        },
        {
          id: '2749-live-3',
          name: '승강기)엘리베이터-철산 외부3',
          operatingSection: 'B1-1F',
          location: '1번 출입구',
          kind: 'surface',
        },
        {
          id: '2749-live-4',
          name: '승강기)엘리베이터-철산 외부4',
          operatingSection: 'B1-1F',
          location: '4번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '가산디지털단지',
          platformNumber: '1',
          recommendedDoors: ['5-1'],
          doorGaps: [
            {
              door: '5-1',
              gap: {
                distanceCm: 10,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '광명사거리',
          platformNumber: '2',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 12,
                level: 'yellow',
                label: '유의',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2750',
      stationName: '광명사거리',
      exitNumbers: ['2'],
      verificationMethod: 'manual_verification',
      liveElevators: [
        {
          id: '2750-live-1',
          name: '승강기)엘리베이터-광명사거리 내부 E/L 3호기',
          operatingSection: 'B3-B2',
          location: '철산 방면1-1',
          kind: 'platform',
        },
        {
          id: '2750-live-2',
          name: '승강기)엘리베이터-광명사거리 내부1',
          operatingSection: 'B2-B3',
          location: '천왕 방면2-1',
          kind: 'platform',
        },
        {
          id: '2750-live-3',
          name: '승강기)엘리베이터-광명사거리 외부2',
          operatingSection: 'B2-1F',
          location: '2번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '철산',
          platformNumber: '1',
          recommendedDoors: [],
          doorGaps: [],
          accessibilityVerified: false,
          warning: '엘리베이터 안전 경로 미확인',
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '천왕',
          platformNumber: '2',
          recommendedDoors: ['2-1'],
          doorGaps: [
            {
              door: '2-1',
              gap: {
                distanceCm: 6,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2751',
      stationName: '천왕',
      exitNumbers: ['2', '3'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2751-live-1',
          name: '승강기)엘리베이터-천왕 내부1',
          operatingSection: 'B1-B2',
          location: '광명사거리 방면5-1',
          kind: 'platform',
        },
        {
          id: '2751-live-2',
          name: '승강기)엘리베이터-천왕 내부2',
          operatingSection: 'B1-B2',
          location: '온수 방면4-4',
          kind: 'platform',
        },
        {
          id: '2751-live-3',
          name: '승강기)엘리베이터-천왕 외부3',
          operatingSection: 'B1-1F',
          location: '3번 출입구',
          kind: 'surface',
        },
        {
          id: '2751-live-4',
          name: '승강기)엘리베이터-천왕 외부4',
          operatingSection: 'B1-1F',
          location: '2번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '광명사거리',
          platformNumber: '1',
          recommendedDoors: ['5-1'],
          doorGaps: [
            {
              door: '5-1',
              gap: {
                distanceCm: 10,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '온수',
          platformNumber: '2',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 10,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '2752',
      stationName: '온수',
      exitNumbers: ['2'],
      verificationMethod: 'api_platform_linkage',
      liveElevators: [
        {
          id: '2752-live-1',
          name: '승강기)엘리베이터-온수(7) 내부1',
          operatingSection: 'B1-B2',
          location: '천왕 방면4-4',
          kind: 'platform',
        },
        {
          id: '2752-live-2',
          name: '승강기)엘리베이터-온수(7) 내부2',
          operatingSection: 'B1-B2',
          location: '까치울 방면5-1',
          kind: 'platform',
        },
        {
          id: '2752-live-3',
          name: '승강기)엘리베이터-온수(7) 외부3',
          operatingSection: 'B1-1F',
          location: '2번 출입구',
          kind: 'surface',
        },
      ],
      directions: [
        {
          toward: '천왕',
          platformNumber: '1',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 6,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '까치울',
          platformNumber: '2',
          recommendedDoors: ['5-4'],
          doorGaps: [
            {
              door: '5-4',
              gap: {
                distanceCm: 8,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '0751',
      stationName: '까치울',
      exitNumbers: ['4'],
      verificationMethod: 'manual_verification',
      liveElevators: [],
      directions: [
        {
          toward: '온수',
          platformNumber: '1',
          recommendedDoors: ['3-2'],
          doorGaps: [
            {
              door: '3-2',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '부천종합운동장',
          platformNumber: '2',
          recommendedDoors: ['6-3'],
          doorGaps: [
            {
              door: '6-3',
              gap: {
                distanceCm: 4,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '0752',
      stationName: '부천종합운동장',
      exitNumbers: ['2', '4'],
      verificationMethod: 'manual_verification',
      liveElevators: [],
      directions: [
        {
          toward: '까치울',
          platformNumber: '1',
          recommendedDoors: ['5-3'],
          doorGaps: [
            {
              door: '5-3',
              gap: {
                distanceCm: 6,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '춘의',
          platformNumber: '2',
          recommendedDoors: ['4-2'],
          doorGaps: [
            {
              door: '4-2',
              gap: {
                distanceCm: 4,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '0753',
      stationName: '춘의',
      exitNumbers: ['3', '7'],
      verificationMethod: 'manual_verification',
      liveElevators: [],
      directions: [
        {
          toward: '부천종합운동장',
          platformNumber: '1',
          recommendedDoors: ['5-1'],
          doorGaps: [
            {
              door: '5-1',
              gap: {
                distanceCm: 4,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '신중동',
          platformNumber: '2',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 7,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '0754',
      stationName: '신중동',
      exitNumbers: ['1', '3', '7'],
      verificationMethod: 'manual_verification',
      liveElevators: [],
      directions: [
        {
          toward: '춘의',
          platformNumber: '1',
          recommendedDoors: ['4-2'],
          doorGaps: [
            {
              door: '4-2',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '부천시청',
          platformNumber: '2',
          recommendedDoors: ['5-3'],
          doorGaps: [
            {
              door: '5-3',
              gap: {
                distanceCm: 4,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '0755',
      stationName: '부천시청',
      exitNumbers: ['1', '4'],
      verificationMethod: 'manual_verification',
      liveElevators: [],
      directions: [
        {
          toward: '신중동',
          platformNumber: '1',
          recommendedDoors: ['5-3'],
          doorGaps: [
            {
              door: '5-3',
              gap: {
                distanceCm: 4,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '상동',
          platformNumber: '2',
          recommendedDoors: ['4-2'],
          doorGaps: [
            {
              door: '4-2',
              gap: {
                distanceCm: 4,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '0756',
      stationName: '상동',
      exitNumbers: ['2', '5'],
      verificationMethod: 'manual_verification',
      liveElevators: [],
      directions: [
        {
          toward: '부천시청',
          platformNumber: '1',
          recommendedDoors: ['4-3'],
          doorGaps: [
            {
              door: '4-3',
              gap: {
                distanceCm: 4,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '삼산체육관',
          platformNumber: '2',
          recommendedDoors: ['4-3'],
          doorGaps: [
            {
              door: '4-3',
              gap: {
                distanceCm: 4,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '0757',
      stationName: '삼산체육관',
      exitNumbers: ['2', '3'],
      verificationMethod: 'manual_verification',
      liveElevators: [],
      directions: [
        {
          toward: '상동',
          platformNumber: '1',
          recommendedDoors: ['4-2'],
          doorGaps: [
            {
              door: '4-2',
              gap: {
                distanceCm: 9,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '굴포천',
          platformNumber: '2',
          recommendedDoors: ['5-3'],
          doorGaps: [
            {
              door: '5-3',
              gap: {
                distanceCm: 7,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '0758',
      stationName: '굴포천',
      exitNumbers: ['3', '5'],
      verificationMethod: 'manual_verification',
      liveElevators: [],
      directions: [
        {
          toward: '삼산체육관',
          platformNumber: '1',
          recommendedDoors: ['4-4'],
          doorGaps: [
            {
              door: '4-4',
              gap: {
                distanceCm: 4,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '부평구청',
          platformNumber: '2',
          recommendedDoors: ['5-1'],
          doorGaps: [
            {
              door: '5-1',
              gap: {
                distanceCm: 7,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '0759',
      stationName: '부평구청',
      exitNumbers: ['3', '5'],
      verificationMethod: 'manual_verification',
      liveElevators: [],
      directions: [
        {
          toward: '굴포천',
          platformNumber: '1',
          recommendedDoors: ['4-1', '8-4'],
          doorGaps: [
            {
              door: '4-1',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
            {
              door: '8-4',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
        {
          toward: '산곡',
          platformNumber: '2',
          recommendedDoors: ['1-1', '5-4'],
          doorGaps: [
            {
              door: '1-1',
              gap: {
                distanceCm: 6,
                level: 'green',
                label: '안전',
              },
            },
            {
              door: '5-4',
              gap: {
                distanceCm: 7,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'stationElevatorCarNumber',
        },
      ],
    },
    {
      stationCode: '0760',
      stationName: '산곡',
      exitNumbers: ['3', '7'],
      verificationMethod: 'manual_verification',
      liveElevators: [],
      directions: [
        {
          toward: '부평구청',
          platformNumber: '1',
          recommendedDoors: ['5-1'],
          doorGaps: [
            {
              door: '5-1',
              gap: {
                distanceCm: 4.7,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'manual_verification',
        },
        {
          toward: '석남',
          platformNumber: '2',
          recommendedDoors: ['5-1'],
          doorGaps: [
            {
              door: '5-1',
              gap: {
                distanceCm: 4.8,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'manual_verification',
        },
      ],
    },
    {
      stationCode: '0761',
      stationName: '석남',
      exitNumbers: ['5'],
      verificationMethod: 'manual_verification',
      liveElevators: [],
      directions: [
        {
          toward: '산곡',
          platformNumber: '1',
          recommendedDoors: ['1-3', '7-3'],
          doorGaps: [
            {
              door: '1-3',
              gap: {
                distanceCm: 4.9,
                level: 'green',
                label: '안전',
              },
            },
            {
              door: '7-3',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'manual_verification',
        },
        {
          toward: '석남',
          platformNumber: null,
          recommendedDoors: ['2-2', '8-4'],
          doorGaps: [
            {
              door: '2-2',
              gap: {
                distanceCm: 5,
                level: 'green',
                label: '안전',
              },
            },
            {
              door: '8-4',
              gap: {
                distanceCm: 6.4,
                level: 'green',
                label: '안전',
              },
            },
          ],
          accessibilityVerified: true,
          warning: null,
          source: 'manual_verification',
        },
      ],
    },
  ],
} as const;
