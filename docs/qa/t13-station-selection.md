# T13 노선도·역 검색·선택 UI 완료 증거

- 확인일: 2026-10-12
- 이슈: [#12 · T13 노선도·역 검색·선택 UI](https://github.com/yunieom/elbero/issues/12)
- 판정: 완료 가능

## 완료 조건 대조

| 완료 조건 | 구현·검증 결과 | 판정 |
| --- | --- | --- |
| 지원 노선도와 환승역 표시 | 수도권 25개 노선을 색상·문자 배지로 구분하고, 노선별 세로 노선도에 환승 노선 배지를 함께 표시한다. | 통과 |
| 역명 검색과 호선 배지 | 검색 결과와 노선도 결과가 동일한 `Station.id`와 `stationKey`를 사용한다. | 통과 |
| 동명이역·검색 결과 없음·미지원 상태 | 동명이역을 노선·역 식별자로 구분하고, 빈 결과와 `안전 경로 준비 중` 상태를 별도로 표시한다. | 통과 |
| 출발·도착 지정과 교환 | 출발역·도착역 선택, 두 입력값 교환, 선택 모달 닫기가 동작한다. | 통과 |
| 동일 역 선택 오류 | 같은 물리적 역을 다른 호선으로 선택한 경우도 동일 역 오류로 처리한다. | 통과 |
| 지도와 텍스트 검색에서 같은 역·호선 선택 | 학동역 7호선 fixture에서 검색과 노선도가 동일 식별자를 반환한다. | 통과 |

## 구현 근거

- 역 선택 화면: `apps/mobile/src/features/station-search/screens/station-search.screen.tsx`
- 검색·노선도 모달: `apps/mobile/src/features/station-search/components/station-picker-modal.tsx`
- 선택 정책: `apps/mobile/src/features/station-search/model/station-selection.ts`
- 수도권 역 목록: `apps/mobile/src/entities/station/station-catalog.generated.ts`
- 관련 커밋: `7b541d5`, `a36c7b9`, `57bb904`

## 검증 증거

- 역 선택 단위 테스트 4건 통과
  - 검색과 노선도 동일 역 식별자
  - 동명이역 구분
  - 환승역 복수 노선 연결
  - 동일 역·미지원 상태 구분
- 모바일 전체 테스트 19건 통과
- API·모바일·공용 계약 TypeScript 검사 통과
- iOS·Android 최대 글자 화면 검증: [T21 큰 글자·접근성 QA](./t21-large-text-accessibility.md)

## 남은 제한과 다음 작업

- 노선도는 지도 확대·축소 방식이 아니라 접근 가능한 노선별 세로 목록이다. T13의 목표인 지도 조작 없이 동일 역을 선택하는 흐름에는 부합한다.
- 경로 엔진 미연결 노선은 역 선택은 가능하지만 `안전 경로 준비 중`으로 차단한다. 이는 선택 UI 결함이 아니라 노선별 경로 데이터 확대 작업이다.
- 다음 작업은 T14 진입·퇴장 카드 완료 증거 확정이다.
