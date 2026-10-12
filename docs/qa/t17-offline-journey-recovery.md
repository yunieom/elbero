# T17 오프라인·재실행 여정 복구 결과

- 확인일: 2026-10-12
- 이슈: [#15 · T17 현재 여정 저장과 복구](https://github.com/yunieom/elbero/issues/15)
- 판정: 완료 가능

## 구현 결과

- AsyncStorage에 여정 전체, 출발·도착 코드, 현재 단계, 저장 시각, 상태 확인 시각, 데이터 버전을 저장한다.
- 앱 첫 화면에서 저장된 여정을 발견하면 출발·도착, 현재 단계, 저장 시각과 함께 `계속 보기`를 제공한다.
- 결과 화면을 다시 열면 저장된 단계부터 복구하고, 온라인이면 최신 여정과 승강기 상태로 교체한다.
- 네트워크 조회가 실패하면 같은 출발·도착의 저장 여정을 계속 표시한다. 한 시간이 지난 시설 상태는 신뢰하지 않고 `시설 상태 재확인 필요`로 표시한다.
- 새 검색이 성공하면 기존 snapshot을 새 여정으로 교체한다. 새 검색이 실패하면 기존 snapshot은 보존한다.
- 데이터 버전이나 선택 경로가 바뀌면 현재 단계를 첫 단계로 초기화한다.
- 손상됐거나 스키마·계약 버전이 호환되지 않는 snapshot은 삭제하고 사용자에게 이유를 알린다.
- 저장 공간 자체가 실패해도 온라인 경로 안내는 계속하고 자동 복구만 사용할 수 없다고 표시한다.

## 검증 증거

- 여정·단계·저장 시각 직렬화와 복구 테스트 통과
- 단계 변경 후 여정 동일성 유지 테스트 통과
- 손상 snapshot 폐기 테스트 통과
- 만료 snapshot의 오프라인 제한 복구 테스트 통과
- 데이터 버전 변경 시 온라인 새 조회 판정 테스트 통과
- 여정 snapshot 관련 모바일 테스트 5건 통과
- 모바일 전체 테스트 19건 통과
- API·모바일·공용 계약 TypeScript 검사 통과
- Android·iOS 번들 생성 통과

## 구현 근거

- snapshot 모델과 복구 결정: `apps/mobile/src/features/journey-search/model/journey-snapshot.ts`
- AsyncStorage repository: `apps/mobile/src/features/journey-search/repository/journey-snapshot.repository.ts`
- 앱 시작 복구: `apps/mobile/src/features/journey-search/hooks/use-saved-journey.ts`
- 조회·단계 변경 저장: `apps/mobile/src/features/journey-search/hooks/use-journey-plan.ts`
- 관련 커밋: `030952c`

## 남은 제한

- 이 저장 데이터는 계정·정밀 위치 이력이 아닌 현재 여정 정보이므로 암호화하지 않는다. 계정이나 위치 이력이 추가되면 별도 보안 검토가 필요하다.
- OS 강제 종료·비행기 모드의 실기기 회귀는 T21에서 수행한다. 저장소·복구 정책과 양 플랫폼 번들은 T17 범위에서 검증했으므로 이 제한은 T17 종료를 막지 않는다.

## 다음 작업

- T21에서 iPhone·Android 실기기의 강제 종료, 비행기 모드, 뒤로가기 회귀를 수행한다.
- 위치 이력·계정 저장이 추가되면 별도 보안 검토를 수행한다.
