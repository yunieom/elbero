# T09 공통 프로젝트·양 플랫폼 초기 빌드 확인

- 확인일: 2026-09-28
- Phase / Epic / Feature: Phase 1 / EP06 / F11
- 완료 증거: iPhone·Android 실행
- 현재 상태: 막힘 — 플랫폼별 번들은 생성됐지만 로컬 실행 도구가 설치되지 않아 실제 실행 증거는 아직 없음

## 이번 확인 결과

| 확인 항목 | 결과 | 증거 |
| --- | --- | --- |
| 공통 Expo 프로젝트 설정 | 통과 | Expo SDK 57, iOS·Android 플랫폼과 각 앱 식별자 확인 |
| Expo 구성·의존성 | 통과 | `expo-doctor` 21/21 통과 |
| TypeScript | 통과 | 모바일 앱 `tsc --noEmit` 통과 |
| iOS 번들 | 통과 | Expo Router 진입점 기준 Hermes 번들 생성 |
| Android 번들 | 통과 | Expo Router 진입점 기준 Hermes 번들 생성 |
| iPhone 시뮬레이터 실행 | 막힘 | Xcode 전체 설치와 iOS Simulator가 없음 |
| Android 에뮬레이터 실행 | 막힘 | Android SDK·`adb`·에뮬레이터가 없음 |

## 확인 중 반영한 변경

- Expo SDK 57이 요구하는 패치 버전에 맞춰 `expo`를 `~57.0.25`로 갱신했다.
- 플랫폼별 소스 분기는 추가하지 않았다. iOS와 Android 모두 같은 Expo Router 앱 진입점과 TypeScript 코드를 사용한다.

## T09 완료를 위해 필요한 준비

### iOS

1. Mac App Store에서 Xcode를 설치한다.
2. Xcode를 한 번 실행해 라이선스와 초기 구성 절차를 완료한다.
3. Xcode 설정에서 Command Line Tools와 iOS Simulator를 설치한다.
4. `npm run ios --workspace @elbero/mobile`로 앱을 열고 첫 화면이 표시되는지 확인한다.

### Android

1. JDK 17과 Android Studio를 설치한다.
2. Android SDK Platform 36, Build-Tools, Platform-Tools와 Android Emulator를 설치한다.
3. Android Virtual Device를 만들고 실행한다.
4. 터미널에서 `adb`가 인식되는지 확인한다.
5. `npm run android --workspace @elbero/mobile`로 앱을 열고 첫 화면이 표시되는지 확인한다.

## 완료 판정

두 플랫폼에서 앱 첫 화면을 연 뒤 다음을 각각 남기면 T09를 완료로 바꾼다.

- 실행한 기기 또는 시뮬레이터 이름과 OS 버전
- 첫 화면 스크린샷
- 시작 과정의 오류 유무
- 역 검색 화면 진입 여부

번들 생성 성공만으로는 T09의 완료 조건인 `iPhone·Android 실행 증거`를 충족했다고 판정하지 않는다.
