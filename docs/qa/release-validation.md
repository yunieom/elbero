# 출시 검증 현황

- 최신 통합 판정: 내부 G2 통과
- 기준일: 2026-10-30
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

## 현재 회귀 명령

```bash
npm test
npm run typecheck
npm run release:check:static
```

Docker QA 환경은 [`맥미니 배포 문서`](../deployment/mac-mini-docker-compose.md)를 따른다.

## 출시 전 남은 외부 검증

- 대표 역사 일부의 실제 지상→승강장→환승→지상 동선 대조
- iOS·Android 실제 기기에서 네트워크 단절·재실행·스크린 리더 최종 확인
- TestFlight·Play 내부 테스트 사용자 관찰과 제보 반영
- HTTPS 운영 API, 오류 제보 이메일, 스토어 개인정보 URL 확정

노선 데이터 검증 잔여 항목은 이 문서에 중복하지 않고 [`지원 노선 검증 대기 목록`](../research/supported-lines-user-verification-pending.md)에서 관리한다.

T09·T13~T22의 상세 완료 증거와 과거 판정은 [`archive/qa`](../archive/qa)에 보관한다.
