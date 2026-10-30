# T11 route-engine 공용 응답 계약

## 결정

- 경로 후보 평가를 NestJS 서비스에서 `JourneyRouteEngine`으로 분리했다.
- 엔진은 모든 결과를 `JourneyContractResult`로 반환한다.
  - 성공: `ok`, `data`, `warnings`, `meta`
  - 실패: `ok`, `error`, `meta`
- `meta.dataVersion`은 선택된 여정 정의의 데이터 버전과 항상 같다.
- 컨트롤러는 오류 코드 정책에 맞는 HTTP 상태를 사용하면서 같은 오류 envelope를 보존한다.
- 앱은 envelope를 해제해 기존 화면 모델에 전달하고, 실패 시 공용 오류 메시지를 표시한다.

## 경로 판정

- 후보는 방향과 환승 조건이 반영된 검증 정의만 평가한다.
- 필수 시설이 하나라도 `out_of_service`이면 해당 후보는 추천에서 제외한다.
- 우선 후보가 중지되고 대체 후보가 운행 중이면 대체 경로를 추천한다.
- 모든 후보가 확정 운행 중지이면 `NO_ACCESSIBLE_ROUTE` 오류를 반환한다.
- 시설 연결 또는 상태가 없으면 운행 중지로 추정하지 않는다. 일반 경로를 유지하고 `DATA_MISSING`, `FACILITY_STATUS_UNKNOWN` warning을 반환한다.
- 지원하지 않는 역 조합은 `UNSUPPORTED_JOURNEY`, 상태 API 장애는 `SOURCE_UNAVAILABLE` 또는 `SOURCE_TIMEOUT`으로 구분한다.

## 검증 fixture

- 정상: 지상 진입부터 목적지 지상 퇴장까지 완성된 경로
- 운행 중지 우회: 우선 환승 후보 제외 후 대체 후보 선택
- 경로 없음: 모든 후보의 필수 승강기 운행 중지
- 데이터 부족: 시설 행이 없어 안전 경로를 확정할 수 없음

## 제한과 다음 작업

- 현재 방향·환승 그래프의 실제 데이터 범위는 검증된 5호선 및 대표 환승 여정이다.
- T10 정규화 패키지 전체를 route-engine 그래프로 직접 적재하는 어댑터는 후속 범위다.
- 이슈 종료 및 보드 완료 판정은 사용자 검토 후 수행한다.
