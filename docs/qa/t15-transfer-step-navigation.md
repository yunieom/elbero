# T15 환승 카드·이전/다음 단계 완료 증거

- 확인일: 2026-10-12
- 이슈: [#13 · T15 환승 카드·이전/다음 단계](https://github.com/yunieom/elbero/issues/13)
- 판정: 완료 가능

## 완료 조건 대조

| 완료 조건 | 구현·검증 결과 | 판정 |
| --- | --- | --- |
| 환승 카드 구성 | 하차·이동 방향·승강기·층·다음 승강장을 순서가 있는 `transfer` 단계와 시설 그룹으로 반환한다. | 통과 |
| 고장 시설과 대체 환승 이유 | 필수 승강기 운행 중지 시 해당 후보를 제외하고 대체 후보 선택 이유를 반환한다. | 통과 |
| 이전·다음·전체 단계 | 전체 단계 목록을 유지하면서 이전·다음 버튼과 현재 단계 강조를 제공한다. | 통과 |
| 환승 횟수만큼 반복 | 2호선 본선·지선 조합의 2회 환승 fixture와 노선 간 환승 조합을 검증했다. | 통과 |
| 앱 복귀 시 현재 단계 유지 | 단계 변경 시 snapshot을 갱신하고 결과 화면 재진입 시 저장 단계부터 복구한다. | 통과 |

## 구현 근거

- 노선 간 환승 조합: `apps/api/src/journey/interline-journey.factory.ts`
- 환승 조합 fixture: `apps/api/src/journey/interline-journey.factory.spec.ts`
- 단계 UI: `apps/mobile/src/features/journey-search/screens/journey-result.screen.tsx`
- 현재 단계 저장: `apps/mobile/src/features/journey-search/hooks/use-journey-plan.ts`
- 관련 커밋: `3d8850e`, `06b6c44`, `030952c`

## 검증 증거

- 2·3·4·5·7호선 상호 환승 조합 fixture 통과
- 2호선 본선·신정지선·성수지선 다중 환승 fixture 통과
- 군자역 5↔7호선 검증 차량·문과 이격거리 연결 통과
- station access·환승·여정 요약 관련 API 테스트 28건 통과
- 단계 저장·변경·복구를 포함한 모바일 전체 테스트 19건 통과
- API·모바일·공용 계약 TypeScript 검사 통과

## 남은 제한과 다음 작업

- 방향별 환승 이동동선이 원천에서 확인되지 않은 조합은 일반 환승 단계는 보여 주되 `안전 경로 미확인`으로 유지한다.
- 실제 환승 통로 현장 대조는 T20, 양 플랫폼 실기기 단계 조작은 T21에서 검증한다.
- 다음 작업은 T17 저장·복구 완료 증거를 최신 검사 결과로 확정하는 것이다.
