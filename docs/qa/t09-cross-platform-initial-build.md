# T09 공통 프로젝트·양 플랫폼 초기 빌드 확인

- 확인일: 2026-09-28
- Phase / Epic / Feature: Phase 1 / EP06 / F11
- 완료 증거: iPhone·Android 실행
- 현재 상태: 완료 — iPhone·Android 시뮬레이터에서 동일한 Expo Router 앱의 첫 화면 실행 확인

## 이번 확인 결과

| 확인 항목 | 결과 | 증거 |
| --- | --- | --- |
| 공통 Expo 프로젝트 설정 | 통과 | Expo SDK 57, iOS·Android 플랫폼과 각 앱 식별자 확인 |
| Expo 구성·의존성 | 통과 | `expo-doctor` 21/21 통과 |
| TypeScript | 통과 | 모바일 앱 `tsc --noEmit` 통과 |
| iOS 번들 | 통과 | Expo Router 진입점 기준 Hermes 번들 생성 |
| Android 번들 | 통과 | Expo Router 진입점 기준 Hermes 번들 생성 |
| iPhone 시뮬레이터 실행 | 통과 | iPhone 18 Pro / iOS 27.0에서 첫 화면과 역 검색 진입 화면 표시 |
| Android 에뮬레이터 실행 | 통과 | `medium_phone` / Android 16(API 36)에서 첫 화면과 역 검색 진입 화면 표시 |

## 실행 환경과 증거

| 플랫폼 | 설치·실행 환경 | 실행 결과 | 스크린샷 |
| --- | --- | --- | --- |
| iOS | Xcode 27.0, iOS 27.0 Simulator, iPhone 18 Pro, Expo Go 57.0.9 | 앱 번들 로드와 첫 화면 렌더링 통과 | [iOS 실행 화면](./evidence/t09-ios-27.png) |
| Android | Android Studio 2026.1.4.8, Android 16(API 36), `medium_phone`, JDK 17 | 앱 번들 로드와 첫 화면 렌더링 통과 | [Android 실행 화면](./evidence/t09-android-api36.png) |

- 두 플랫폼 모두 출발역·도착역 선택 화면이 표시되고 역 검색 화면으로 진입할 수 있다.
- 시작 과정에서 앱 실행을 막는 오류는 없었다.
- 두 플랫폼에서 React Native `SafeAreaView` 사용 중단 예정 경고가 동일하게 표시된다. 실행을 막지는 않으므로 별도 UI 유지보수 항목으로 다룬다.
- iOS 스크린샷에는 Expo Go 최초 실행 시 한 번 표시되는 개발자 메뉴 설명창이 포함되어 있다. 뒤쪽에 앱 첫 화면이 정상 렌더링된 것을 확인했다.

## 확인 중 반영한 변경

- Expo SDK 57이 요구하는 패치 버전에 맞춰 `expo`를 `~57.0.25`로 갱신했다.
- 플랫폼별 소스 분기는 추가하지 않았다. iOS와 Android 모두 같은 Expo Router 앱 진입점과 TypeScript 코드를 사용한다.

## 설치 결과와 재실행 방법

### iOS

- Xcode 27.0과 iOS 27.0 Simulator 설치 및 초기 구성을 완료했다.
- 현재 로그인 세션에서는 `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer`로 Xcode 도구를 선택해 실행했다.
- 재로그인 뒤에도 기본 Xcode로 사용하려면 관리자 권한이 있는 사용자가 한 번 아래 명령을 실행해야 한다.

  ```sh
  sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
  ```

- 이후 `npm run ios --workspace @elbero/mobile`로 다시 실행할 수 있다.

### Android

- Android Studio, JDK 17, Android SDK Platform 36, Build-Tools, Platform-Tools와 Emulator 설치를 완료했다.
- Google APIs ARM64 이미지로 `medium_phone` 가상 기기를 생성했다.
- 가상 기기를 켠 뒤 `npm run android --workspace @elbero/mobile`로 다시 실행할 수 있다.

## 완료 판정

실행한 기기·OS, 첫 화면 스크린샷, 시작 오류 유무와 역 검색 진입 여부를 모두 기록했다. T09의 완료 조건인 `iPhone·Android 실행 증거`를 충족한다.
