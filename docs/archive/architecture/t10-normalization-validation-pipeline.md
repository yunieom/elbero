# T10 source adapter·normalizer 검증 파이프라인

## 결과

- 정규화 데이터는 배포 전에 Zod 런타임 스키마를 통과해야 한다.
- `schemaVersion`과 `dataVersion`을 분리해 구조 호환성과 데이터 갱신 이력을 각각 추적한다.
- 형식이 깨진 레코드와 존재하지 않는 ID를 참조하는 레코드는 전체 수집 결과를 중단하지 않고 격리한다.
- 격리 결과는 공용 `JourneyContractResult`의 `DATA_MISSING` warning과 별도 검증 보고서에 남긴다.
- 패키지 자체의 버전 정보가 없거나 잘못된 경우에는 `ok: false` 오류 envelope를 반환한다.

## 검증 순서

1. 패키지 헤더의 스키마 버전·데이터 버전·생성 시각 검사
2. 컬렉션별 레코드 형식 검사
3. 역-노선, 승강장, 장소, 시설, 이동경로, 상태 관측의 참조 무결성 검사
4. 끊어진 참조와 그 의존 레코드 격리
5. 남은 데이터로 최종 패키지 스키마 재검증

## 실행 증빙

`npm run verification:t10`은 계약 패키지를 빌드한 뒤 T06 표본을 검사하고 다음 파일을 만든다.

- `data/generated/accessibility/t10-data-package.json`
- `data/generated/accessibility/t10-validation-report.json`

## 제한과 다음 작업

- 현재 표본은 5호선 답십리 중심이며 전체 노선 원본 어댑터의 수집 스케줄은 별도 작업이다.
- T11 route-engine은 이 패키지의 `dataVersion`과 공용 error/warning envelope를 응답에 전달한다.
