# 지원 노선 사용자 검증 대기 목록

- 생성일: 2026-10-13
- 사용자 검증 입력 완료: 2·3호선
- 현재 경로 엔진 구현 완료: 2·3·4·5·7호선
- 1호선 상태: 경로 엔진 지원 대상, 어댑터 연결과 원본 검증 데이터 반영 전
- 현재 구현 노선 및 8·9호선 방향별 차량·문 또는 이격거리 확인 필요: 37역·건
- 현재 구현 노선 및 8·9호선 지상 엘리베이터 출구 확인 필요: 30역

## 판정 기준

- 사용자가 이미 확정한 값과 서비스 정책으로 선택 가능한 API 충돌은 제외한다.
- 방향별 차량·문이 없거나, 선택한 문과 이격거리 레코드가 연결되지 않거나, 안전 경로 검증 상태가 거짓인 경우만 기록한다.
- 지상 엘리베이터 출구 번호가 없더라도 다른 호선 이용으로 확정한 역은 제외한다.
- 이 문서는 생성 데이터에서 자동 산출한다. 같은 감사를 반복하지 말고 `npm run verification:pending-guidance`로 갱신한다.

## 1호선 반영 상태

- 1호선은 경로 엔진 지원 대상이다.
- 현재 구현에는 1호선 어댑터가 아직 연결되지 않았다.
- API 수집 대상: 102역
- 지상 엘리베이터 출구 충돌: 46역
- 방향별 차량·문 확인: 24역
- 승강장·문·이격거리 연결 확인: 29역
- 이격거리 값 없음: 40건
- 역별 API 반환 값과 확인할 문은 [수도권 전철 사용자 검증 대기 목록의 1호선 상세](metropolitan-user-verification-pending.md#1호선)에 기록한다. 같은 내용을 이 문서에 중복 작성하지 않는다.

## 8·9호선 준비 상태

- 충돌 없는 API 값은 [8·9호선 안내 데이터 준비 상태](line-8-9-guidance-readiness.md)에 자동 후보로 저장한다.
- 출처별 값이 다르거나 방향 연결이 불가능한 역만 사용자 확인 대상으로 유지한다.
- 두 노선 모두 아직 경로 엔진에 연결되지 않았으므로 자동 후보를 사용자 안전 경로로 노출하지 않는다.

## 2호선

### 방향별 차량·문·이격거리 (0건)

| 역 | 진행 방향 | 확인할 내용 |
| --- | --- | --- |
| 없음 | - | - |

### 지상 엘리베이터 출구 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 3호선

### 방향별 차량·문·이격거리 (0건)

| 역 | 진행 방향 | 확인할 내용 |
| --- | --- | --- |
| 없음 | - | - |

### 지상 엘리베이터 출구 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 4호선

### 방향별 차량·문·이격거리 (1건)

| 역 | 진행 방향 | 확인할 내용 |
| --- | --- | --- |
| 진접 (0405) | 오남 방향 | 이격거리 연결 없음 (7-3) |

### 지상 엘리베이터 출구 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 5호선

### 방향별 차량·문·이격거리 (0건)

| 역 | 진행 방향 | 확인할 내용 |
| --- | --- | --- |
| 없음 | - | - |

### 지상 엘리베이터 출구 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 7호선

### 방향별 차량·문·이격거리 (0건)

| 역 | 진행 방향 | 확인할 내용 |
| --- | --- | --- |
| 없음 | - | - |

### 지상 엘리베이터 출구 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 8호선 · 경로 엔진 연결 전

### 방향별 차량·문 (11역)

| 역 | 확인 이유 | 확인 완료 방향 | 남은 방향 | API별 후보 |
| --- | --- | --- | --- | --- |
| 동구릉 (2807) | 차량·문 API 값 없음 | - | - | 후보 없음 |
| 구리 (2805) | 차량·문 API 값 없음 | - | - | 후보 없음 |
| 장자호수공원 (2808) | 차량·문 API 값 없음 | - | - | 후보 없음 |
| 강동구청 (2813) | 일부 방향만 확인 완료 | 몽촌토성: 3-3 | 반대 방향 | stationElevatorCarNumber: 3-2, 4-2<br>stationElevator: 3-2, 3-3, 4-2<br>SeoulMetroFaciInfo: 3-2, 3-3, 4-2 |
| 몽촌토성 (2814) | 일부 방향만 확인 완료 | 천호: 4-2 | 반대 방향 | stationElevatorCarNumber: 3-4, 4-1<br>stationElevator: 3-4<br>SeoulMetroFaciInfo: 3-4 |
| 석촌 (2816) | API 값 충돌 | - | - | stationElevatorCarNumber: 3-4, 4-1<br>stationElevator: 3-4, 4-1<br>SeoulMetroFaciInfo: 3-4 |
| 가락시장 (2818) | API 값 충돌 | - | - | stationElevatorCarNumber: 1-1, 2-3, 5-4, 6-4<br>stationElevator: 2-3, 5-4<br>SeoulMetroFaciInfo: 1-1, 2-3, 5-4, 6-4 |
| 복정 (2821) | API 값 충돌 | - | - | stationElevatorCarNumber: 3-4<br>stationElevator: 3-4, 4-1<br>SeoulMetroFaciInfo: 3-4 |
| 남위례 (2828) | API 값 충돌 | - | - | stationElevatorCarNumber: 3-4, 4-1<br>SeoulMetroFaciInfo: 3-4 |
| 산성 (2822) | API 값 충돌 | - | - | stationElevatorCarNumber: 1-1, 6-1<br>stationElevator: 1-3, 6-2<br>SeoulMetroFaciInfo: 1-3, 6-2 |
| 남한산성입구 (2823) | API 값 충돌 | - | - | stationElevatorCarNumber: 1-1, 3-1, 3-2, 6-1<br>stationElevator: 3-4<br>SeoulMetroFaciInfo: 3-4 |

### 지상 엘리베이터 출구 (13역)

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

## 9호선 · 경로 엔진 연결 전

### 방향별 차량·문 (25역)

| 역 | 확인 이유 | 확인 완료 방향 | 남은 방향 | API별 후보 |
| --- | --- | --- | --- | --- |
| 개화 (0901) | 차량·문 API 값 없음 | - | - | 후보 없음 |
| 김포공항 (0902) | 차량·문 API 값 없음 | - | - | stationElevator: 1-1, 4-2 |
| 공항시장 (0903) | 차량·문 API 값 없음 | - | - | 후보 없음 |
| 신방화 (0904) | 차량·문 API 값 없음 | - | - | stationElevator: 3-1, 4-4 |
| 마곡나루 (0905) | 차량·문 API 값 없음 | - | - | stationElevator: 3-3, 4-2 |
| 양천향교 (0906) | 차량·문 API 값 없음 | - | - | stationElevator: 3-2, 4-4 |
| 가양 (0907) | 차량·문 API 값 없음 | - | - | 후보 없음 |
| 증미 (0908) | API 값 충돌 | - | - | stationElevatorCarNumber: 2-4, 3-1<br>stationElevator: 3-4 |
| 등촌 (0909) | 차량·문 API 값 없음 | - | - | stationElevator: 1-1, 6-4 |
| 염창 (0910) | 차량·문 API 값 없음 | - | - | stationElevator: 3-4, 4-1 |
| 신목동 (0911) | 차량·문 API 값 없음 | - | - | 후보 없음 |
| 선유도 (0912) | 차량·문 API 값 없음 | - | - | stationElevator: 3-4, 4-1 |
| 당산 (0913) | 차량·문 API 값 없음 | - | - | stationElevator: 6-4 |
| 국회의사당 (0914) | 차량·문 API 값 없음 | - | - | stationElevator: 5-3 |
| 여의도 (0915) | 차량·문 API 값 없음 | - | - | stationElevator: 1-1, 6-4 |
| 샛강 (0916) | 차량·문 API 값 없음 | - | - | 후보 없음 |
| 노량진 (0917) | 차량·문 API 값 없음 | - | - | stationElevator: 3-4, 4-1 |
| 노들 (0918) | 차량·문 API 값 없음 | - | - | stationElevator: 3-2, 4-4 |
| 흑석 (0919) | API 값 충돌 | - | - | stationElevatorCarNumber: 2-2, 3-3<br>stationElevator: 3-3, 4-2 |
| 동작 (0920) | 차량·문 API 값 없음 | - | - | 후보 없음 |
| 구반포 (0921) | 차량·문 API 값 없음 | - | - | stationElevator: 2-1, 5-4 |
| 신반포 (0922) | 차량·문 API 값 없음 | - | - | stationElevator: 3-4 |
| 고속터미널 (0923) | 차량·문 API 값 없음 | - | - | stationElevator: 1-1, 4-4 |
| 사평 (0924) | 차량·문 API 값 없음 | - | - | stationElevator: 4-1, 4-2 |
| 신논현 (0925) | 차량·문 API 값 없음 | - | - | stationElevator: 3-4, 4-1 |

### 지상 엘리베이터 출구 (17역)

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
