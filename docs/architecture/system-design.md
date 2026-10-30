# 시스템 구조와 데이터 계약

- 기준일: 2026-10-30
- 구성: React Native·Expo 앱, NestJS API, 공용 TypeScript 계약

## 모듈 경계

- `apps/mobile`: 역 선택, 여정 표시, 접근성, 로컬 snapshot, 오류 제보
- `apps/api`: 원천 데이터 정규화, 경로 조합, 실시간 시설 상태 평가, Swagger
- `packages/contracts`: 성공·오류 envelope, 오류 코드, 데이터 버전 계약
- `data/verification`: 사용자가 확정한 출구·방향·차량·문·이격거리 보정값

의존 방향은 앱과 API가 공용 계약을 참조하고, 공용 계약은 앱·API 구현을 참조하지 않는 구조다.

## 경로 처리 순서

1. 역 코드를 노선 어댑터가 해석한다.
2. 같은 노선 또는 환승 그래프에서 열차 구간을 계산한다.
3. 방향별 승강기 인접 차량·문과 이격거리를 결합한다.
4. 진입·환승·퇴장 단계와 필수 시설 그룹을 구성한다.
5. 서울 승강기 상태 snapshot으로 각 필수 시설을 평가한다.
6. 운행 가능한 후보를 추천하고, 미확인·충돌·운행 중지는 warning과 상태 카드로 반환한다.

모든 후보가 운행 중지여도 성공 envelope 안에 원래 후보와 단계를 반환한다. 이때 `recommendedRouteId`는 `null`이며 `NO_ACCESSIBLE_ROUTE` warning을 포함한다.

## 공용 오류와 warning

- `INVALID_REQUEST`: 요청 형식 오류
- `UNSUPPORTED_JOURNEY`: 경로 그래프에 없는 조합
- `DATA_MISSING`: 필수 연결 정보 누락
- `DATA_CONFLICT`: 출처 또는 승하차 기준 충돌
- `FACILITY_STATUS_UNKNOWN`: 실시간 상태 미확인
- `NO_ACCESSIBLE_ROUTE`: 운행 중지 시설을 제외한 대체 경로 없음
- `SOURCE_UNAVAILABLE`, `SOURCE_TIMEOUT`: 원천 상태 API 실패
- `DATA_VERSION_UNSUPPORTED`: 저장 snapshot과 현재 계약 불일치

경로 자체가 있으면 누락·충돌·운행 중지는 가능한 한 200 응답의 warning으로 전달해 사용자가 이동 순서를 계속 볼 수 있게 한다.

## 로컬 복구

- 앱은 여정 ID, 데이터 버전, 현재 단계, 저장 시각과 표시용 snapshot을 저장한다.
- 재실행 시 저장 경로를 먼저 보여주고 온라인이면 최신 상태로 교체한다.
- 손상되었거나 지원하지 않는 데이터 버전은 폐기하고 새 검색으로 복구한다.
- 현재 저장 데이터는 비민감 여정 정보이며 위치 이력·계정이 추가되면 별도 보안 검토를 수행한다.

## 구현 기준 위치

- 경로 엔진: `apps/api/src/journey`
- 상태 결합: `apps/api/src/elevator-status`
- 앱 여정 기능: `apps/mobile/src/features/journey-search`
- 공용 계약: `packages/contracts/src`
- 상세 기술 선택: [`technology-stack.md`](./technology-stack.md)
- 완료된 T06·T07·T10·T11 설계 기록: [`archive/architecture`](../archive/architecture)
