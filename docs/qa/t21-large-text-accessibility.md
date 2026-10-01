# T21 iOS·Android 큰 글자 접근성 QA

- 확인일: 2026-10-01
- 대상: 역 검색, 역 선택, 여정 결과, 오류·경고 상태
- iOS: iPhone 18 Pro Simulator / iOS 27 / 가장 큰 접근성 글자 크기
- Android: `medium_phone` Emulator / Android 16(API 36) / 글꼴 크기 200%

## 결과

| 화면 | iOS | Android | 확인 결과 |
| --- | --- | --- | --- |
| 홈·역 검색 | 통과 | 통과 | 제목·설명·역 입력·검색 버튼이 가로로 잘리지 않고 세로 스크롤 가능 |
| 역 선택 | 통과 | 통과 | 검색·노선 탭, 검색창, 빈 상태 문구와 닫기 버튼 사용 가능 |
| 여정 결과·오류 | 통과 | 통과 | 제목과 본문이 줄바꿈되고 뒤로가기·재시도 버튼 사용 가능 |
| 운행 중지·안전 경로 미확인 카드 | 통과 | 통과 | 상태 제목·설명·복구 행동이 순서대로 표시되고 세로 스크롤 가능 |

## QA에서 수정한 문제

- 홈 상단 브랜드와 베타 배지가 큰 글자에서 겹치지 않도록 줄바꿈과 확대 상한을 적용했다.
- 장식 아이콘은 글자 크기에 따라 불필요하게 확대되지 않도록 고정했다.
- 역 선택 헤더·탭·검색 결과·빈 상태 문구에 확대 상한과 줄바꿈을 적용했다.
- 여정 요약, 안내 단계, 시설 정보 행이 큰 글자에서 세로로 재배치되도록 수정했다.
- 공용 버튼에 화면별 레이아웃 스타일을 전달하면 기본 배경색이 사라지던 문제를 수정했다.
- React Native에서 사용 중단 예정인 `SafeAreaView` 대신 safe-area-context 구현을 사용했다.

## 화면 증거

| 플랫폼 | 화면 | 증거 |
| --- | --- | --- |
| iOS | 홈 | [가장 큰 접근성 글자 크기](./evidence/t21/ios-max-home.png) |
| iOS | 여정 결과·오류 | [여정 결과](./evidence/t21/ios-max-result.png) |
| iOS | 상태 카드 | [상태 카드](./evidence/t21/ios-max-status-card.png) |
| Android | 홈 | [글꼴 크기 200%](./evidence/t21/android-200-home.png) |
| Android | 역 선택 | [역 선택](./evidence/t21/android-200-station-picker.png) |
| Android | 여정 결과·오류 | [여정 결과](./evidence/t21/android-200-result.png) |
| Android | 상태 카드 | [상태 카드](./evidence/t21/android-200-status-card.png) |

## 남은 제한

- 현재 실시간 API 응답에서는 필수 승강기가 모두 운행 중인 안전 경로를 만들지 못해 정상 여정 전체는 라이브 경로 대신 앱의 QA 상태 fixture로 확인했다.
- 이번 범위는 실제 OS의 큰 글자 렌더링과 조작 가능 여부다. VoiceOver·TalkBack의 전체 낭독 순서와 실제 물리 기기 검증은 별도 접근성 QA로 남긴다.
- 원천 데이터가 없거나 충돌하는 역은 [지원 노선 사용자 검증 대기 목록](../research/supported-lines-user-verification-pending.md)에서 관리한다.
