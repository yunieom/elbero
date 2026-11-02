# 출시 검증 현황

- 최신 통합 판정: 내부 G2 통과
- 기준일: 2026-11-02
- 원칙: 자동 테스트·시뮬레이터·실기기·현장 확인을 서로 구분한다.

## 완료 범위

| 범위 | 상태 | 핵심 증거 |
| --- | --- | --- |
| iOS·Android 초기 실행 | 완료 | `evidence/t09-*` |
| 역 검색·노선 선택 | 완료 | `evidence/t21/*home*`, `*station-picker*` |
| 진입·퇴장·환승 단계 | 완료 | `evidence/t19/android-journey-step-2.png` |
| 신뢰 상태·오류·접근성 카드 | 완료 | `evidence/t20/*outage*`, `evidence/t21/*status-card*` |
| 오프라인·재실행 복구 | 완료 | `evidence/t19/android-offline-recovery.png` |
| 큰 글자·VoiceOver·TalkBack 기반 | 완료 | `evidence/t21/*` |
| 오류 제보 메일·복사 대안 | 완료 | 자동 테스트와 앱 QA 화면 |
| 개인정보·약관·저장 데이터 삭제 | 완료 | 앱 `/service-info`, `/privacy`, `/terms`, `/support` |
| 민감 권한·광고/분석 SDK 차단 | 완료 | `app.json`, 출시 정적 검사 |
| 기본 색 대비·노선 배지 대비 | 완료 | 모바일 대비 자동 테스트 |
| 프로덕션 QA 화면 차단 | 완료 | `__DEV__` 게이트와 출시 정적 검사 |
| 심사용 앱 아이콘 | 완료 | iOS 1024px·Android adaptive/monochrome·웹 favicon 적용, `d875105` |

## 2026-11-02 최신 자동 회귀

| 검사 | 결과 |
| --- | --- |
| API 테스트 | 131개 통과 |
| 모바일 테스트 | 22개 통과 |
| 타입 검사 | 통과 |
| 린트 | 통과 |
| 공용 계약·API 빌드 | 통과 |
| 출시 정적 검사 | 16/16 통과 |
| QA 전용 홈 버튼 | production export에서 문구·진입점 미포함 확인 |
| `/qa/states` 직접 접근 | production export에서 홈 Redirect 확인 |

현재 Expo Go와 개발 빌드에 QA 버튼이 보이는 것은 의도한 동작이다. App Store·Google Play에는 반드시 EAS `production` 프로필로 만든 바이너리를 제출하며, 이 빌드에서는 QA 진입점이 사용자 화면에 나타나지 않는다.

## 현재 회귀 명령

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run release:check:static
```

Docker QA 환경은 [`맥미니 배포 문서`](../deployment/mac-mini-docker-compose.md)를 따른다.

## 출시 전 남은 외부 검증

- 대표 역사 일부의 실제 지상→승강장→환승→지상 동선 대조
- iOS·Android 실제 기기에서 네트워크 단절·재실행·스크린 리더 최종 확인
- TestFlight·Play 내부 테스트 사용자 관찰과 제보 반영
- HTTPS 운영 API, 실제 운영자명, 오류 제보 이메일, 공개 개인정보·약관·지원 URL 확정
- 웹 키보드 포커스 순서와 양 플랫폼 법적 화면의 큰 글자 최종 확인

노선 데이터 검증 잔여 항목은 이 문서에 중복하지 않고 [`지원 노선 검증 대기 목록`](../research/supported-lines-user-verification-pending.md)에서 관리한다.

T09·T13~T22의 상세 완료 증거와 과거 판정은 [`archive/qa`](../archive/qa)에 보관한다.
