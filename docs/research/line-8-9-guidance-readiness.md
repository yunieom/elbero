# 8·9호선 안내 데이터 준비 상태

- 생성일: 2026-10-12
- 원칙: API 값이 충돌하지 않는 항목만 자동 후보로 저장하고, 충돌·누락은 사용자 확인 대상으로 남긴다.
- 자동 후보는 사용자 검증값이 아니며 8·9호선 경로 엔진 연결 전에는 안전 경로 추천에 사용하지 않는다.

## 8호선

- 경로 엔진 연결: 아직 지원하지 않음
- 자동 저장한 출구 합의 후보: 11역
- 출구 사용자 확인 필요: 13역
- 승강장별 차량·문 자동 후보: 12역
- 사용자 확인 완료 방향: 4건
- 방향별 차량·문 사용자 확인 필요: 11역
- 이격거리: green 935, yellow 70, red 3, 값 없음 144

### 지상 엘리베이터 출구 확인 필요

| 역 | API별 값 |
| --- | --- |
| 별내 (2804) | stationMovement: 4, 5, 6<br>stinElevatorMovement: 4, 5, 6<br>stationElevator: 4, 5, 7 |
| 다산 (2806) | stationMovement: 1, 2, 3, 4<br>stinElevatorMovement: 1, 3, 4<br>stationElevator: 1, 3, 4, 5, 6 |
| 동구릉 (2807) | stationMovement: 2, 5<br>stinElevatorMovement: 2, 5<br>stationElevator: 2, 3, 5 |
| 구리 (2805) | stationMovement: 7<br>stinElevatorMovement: 7<br>stationElevator: 4, 7 |
| 암사 (2811) | stationMovement: 3<br>stinElevatorMovement: 3<br>stationElevator: 3, 4<br>SeoulMetroFaciInfo: 4 |
| 잠실 (2815) | stationMovement: 9, 10<br>stinElevatorMovement: 9, 10<br>stationElevator: 9<br>SeoulMetroFaciInfo: 9 |
| 석촌 (2816) | stationMovement: 1, 5<br>stinElevatorMovement: 1, 5<br>stationElevator: 1<br>SeoulMetroFaciInfo: 1 |
| 송파 (2817) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 1, 2, 4<br>SeoulMetroFaciInfo: 2, 4 |
| 가락시장 (2818) | stationMovement: 1, 4, 7<br>stinElevatorMovement: 1, 4, 7<br>stationElevator: 1, 2, 3, 4<br>SeoulMetroFaciInfo: 2, 4 |
| 문정 (2819) | stationMovement: 2, 3, 4<br>stinElevatorMovement: 2, 3, 4<br>stationElevator: 2, 4<br>SeoulMetroFaciInfo: 2, 4 |
| 장지 (2820) | stationMovement: 1, 4<br>stinElevatorMovement: 1, 4<br>stationElevator: 1, 3<br>SeoulMetroFaciInfo: 1, 3 |
| 남위례 (2828) | stationMovement: 5<br>stinElevatorMovement: 5<br>stationElevator: 1, 5<br>SeoulMetroFaciInfo: 1, 5 |
| 남한산성입구 (2823) | stationMovement: 3<br>stinElevatorMovement: 3<br>stationElevator: 3, 4 |

### 방향별 차량·문 확인 필요

| 역 | 이유 | 남은 방향 | API별 후보 |
| --- | --- | --- | --- |
| 동구릉 (2807) | 차량·문 API 값 없음 | - | 후보 없음 |
| 구리 (2805) | 차량·문 API 값 없음 | - | 후보 없음 |
| 장자호수공원 (2808) | 차량·문 API 값 없음 | - | 후보 없음 |
| 강동구청 (2813) | 일부 방향만 확인 완료 | 반대 방향 | stationElevatorCarNumber: 3-2, 4-2<br>stationElevator: 3-2, 3-3, 4-2<br>SeoulMetroFaciInfo: 3-2, 3-3, 4-2 |
| 몽촌토성 (2814) | 일부 방향만 확인 완료 | 반대 방향 | stationElevatorCarNumber: 3-4, 4-1<br>stationElevator: 3-4<br>SeoulMetroFaciInfo: 3-4 |
| 석촌 (2816) | API 값 충돌 | - | stationElevatorCarNumber: 3-4, 4-1<br>stationElevator: 3-4, 4-1<br>SeoulMetroFaciInfo: 3-4 |
| 가락시장 (2818) | API 값 충돌 | - | stationElevatorCarNumber: 1-1, 2-3, 5-4, 6-4<br>stationElevator: 2-3, 5-4<br>SeoulMetroFaciInfo: 1-1, 2-3, 5-4, 6-4 |
| 복정 (2821) | API 값 충돌 | - | stationElevatorCarNumber: 3-4<br>stationElevator: 3-4, 4-1<br>SeoulMetroFaciInfo: 3-4 |
| 남위례 (2828) | API 값 충돌 | - | stationElevatorCarNumber: 3-4, 4-1<br>SeoulMetroFaciInfo: 3-4 |
| 산성 (2822) | API 값 충돌 | - | stationElevatorCarNumber: 1-1, 6-1<br>stationElevator: 1-3, 6-2<br>SeoulMetroFaciInfo: 1-3, 6-2 |
| 남한산성입구 (2823) | API 값 충돌 | - | stationElevatorCarNumber: 1-1, 3-1, 3-2, 6-1<br>stationElevator: 3-4<br>SeoulMetroFaciInfo: 3-4 |

### 사용자 확인 완료 차량·문

| 역 | 방향 | 차량·문 |
| --- | --- | --- |
| 천호 (2812) | 암사 방면 | 2-2 |
| 천호 (2812) | 강동구청 방면 | 5-4 |
| 강동구청 (2813) | 몽촌토성 방면 | 3-3 |
| 몽촌토성 (2814) | 천호 방면 | 4-2 |

## 9호선

- 경로 엔진 연결: 아직 지원하지 않음
- 자동 저장한 출구 합의 후보: 21역
- 출구 사용자 확인 필요: 17역
- 승강장별 차량·문 자동 후보: 13역
- 사용자 확인 완료 방향: 0건
- 방향별 차량·문 사용자 확인 필요: 25역
- 이격거리: green 1815, yellow 9, red 0, 값 없음 0

### 지상 엘리베이터 출구 확인 필요

| 역 | API별 값 |
| --- | --- |
| 공항시장 (0903) | stationMovement: 1<br>stinElevatorMovement: 1<br>stationElevator: 1, 2 |
| 신방화 (0904) | stationMovement: 3, 7<br>stinElevatorMovement: 3, 7<br>stationElevator: 3, 7, 8 |
| 마곡나루 (0905) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1, 2 |
| 양천향교 (0906) | stationMovement: 3, 5<br>stinElevatorMovement: 3, 5<br>stationElevator: 3, 4, 5, 6 |
| 가양 (0907) | stationMovement: 4, 8<br>stinElevatorMovement: 4, 8<br>stationElevator: 4, 5, 8, 9 |
| 염창 (0910) | stationMovement: 1, 3<br>stinElevatorMovement: 1, 3<br>stationElevator: 1, 2, 3, 4 |
| 선유도 (0912) | stationMovement: 1, 8<br>stinElevatorMovement: 1, 8<br>stationElevator: 1, 2, 7, 8 |
| 당산 (0913) | stationMovement: 10, 13<br>stinElevatorMovement: 10, 13<br>stationElevator: 1, 10, 13 |
| 국회의사당 (0914) | stationMovement: 2, 5, 6<br>stinElevatorMovement: 2, 5, 6<br>stationElevator: 2, 3, 4, 5, 6 |
| 샛강 (0916) | stationMovement: 2, 3<br>stinElevatorMovement: 2, 3<br>stationElevator: 1, 2, 3 |
| 노량진 (0917) | stationMovement: 5, 8, 9<br>stinElevatorMovement: 5, 8, 9<br>stationElevator: 5, 6, 8 |
| 노들 (0918) | stationMovement: 1, 2, 3, 5<br>stinElevatorMovement: 1, 2, 3, 5<br>stationElevator: 1, 3, 4, 5 |
| 흑석 (0919) | stationMovement: 2, 3<br>stinElevatorMovement: 2, 3<br>stationElevator: 1, 2, 3, 4 |
| 동작 (0920) | stationMovement: 1, 5, 7<br>stinElevatorMovement: 1, 5, 7<br>stationElevator: 4, 5, 7, 8, 9 |
| 구반포 (0921) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 2, 3 |
| 신반포 (0922) | stationMovement: 1, 4<br>stinElevatorMovement: 1, 4<br>stationElevator: 1, 2, 3, 4 |
| 신논현 (0925) | stationMovement: 2, 8<br>stinElevatorMovement: 2, 8<br>stationElevator: 1, 2, 8, 9 |

### 방향별 차량·문 확인 필요

| 역 | 이유 | 남은 방향 | API별 후보 |
| --- | --- | --- | --- |
| 개화 (0901) | 차량·문 API 값 없음 | - | 후보 없음 |
| 김포공항 (0902) | 차량·문 API 값 없음 | - | stationElevator: 1-1, 4-2 |
| 공항시장 (0903) | 차량·문 API 값 없음 | - | 후보 없음 |
| 신방화 (0904) | 차량·문 API 값 없음 | - | stationElevator: 3-1, 4-4 |
| 마곡나루 (0905) | 차량·문 API 값 없음 | - | stationElevator: 3-3, 4-2 |
| 양천향교 (0906) | 차량·문 API 값 없음 | - | stationElevator: 3-2, 4-4 |
| 가양 (0907) | 차량·문 API 값 없음 | - | 후보 없음 |
| 증미 (0908) | API 값 충돌 | - | stationElevatorCarNumber: 2-4, 3-1<br>stationElevator: 3-4 |
| 등촌 (0909) | 차량·문 API 값 없음 | - | stationElevator: 1-1, 6-4 |
| 염창 (0910) | 차량·문 API 값 없음 | - | stationElevator: 3-4, 4-1 |
| 신목동 (0911) | 차량·문 API 값 없음 | - | 후보 없음 |
| 선유도 (0912) | 차량·문 API 값 없음 | - | stationElevator: 3-4, 4-1 |
| 당산 (0913) | 차량·문 API 값 없음 | - | stationElevator: 6-4 |
| 국회의사당 (0914) | 차량·문 API 값 없음 | - | stationElevator: 5-3 |
| 여의도 (0915) | 차량·문 API 값 없음 | - | stationElevator: 1-1, 6-4 |
| 샛강 (0916) | 차량·문 API 값 없음 | - | 후보 없음 |
| 노량진 (0917) | 차량·문 API 값 없음 | - | stationElevator: 3-4, 4-1 |
| 노들 (0918) | 차량·문 API 값 없음 | - | stationElevator: 3-2, 4-4 |
| 흑석 (0919) | API 값 충돌 | - | stationElevatorCarNumber: 2-2, 3-3<br>stationElevator: 3-3, 4-2 |
| 동작 (0920) | 차량·문 API 값 없음 | - | 후보 없음 |
| 구반포 (0921) | 차량·문 API 값 없음 | - | stationElevator: 2-1, 5-4 |
| 신반포 (0922) | 차량·문 API 값 없음 | - | stationElevator: 3-4 |
| 고속터미널 (0923) | 차량·문 API 값 없음 | - | stationElevator: 1-1, 4-4 |
| 사평 (0924) | 차량·문 API 값 없음 | - | stationElevator: 4-1, 4-2 |
| 신논현 (0925) | 차량·문 API 값 없음 | - | stationElevator: 3-4, 4-1 |

### 사용자 확인 완료 차량·문

| 역 | 방향 | 차량·문 |
| --- | --- | --- |
| 없음 | - | - |
