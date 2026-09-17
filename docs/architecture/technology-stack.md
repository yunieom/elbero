# Elbero 기술 스택과 기술 결정

- 기준일: 2026-09-17
- 대상: iOS, Android, 개발용 Web, NestJS API
- 저장소: npm workspaces 기반 모노레포

## 1. 문서 목적

이 문서는 Elbero가 현재 사용하는 기술과 앞으로 도입하기로 한 기술을 구분한다. 패키지가
설치되어 있다는 사실과 도입 예정인 설계를 섞지 않으며, 새로운 의존성을 추가할 때는 이 문서의
결정과 실제 `package.json`을 함께 갱신한다.

상태는 다음과 같이 사용한다.

- **사용 중**: 저장소에 설치되고 현재 코드가 사용한다.
- **채택 예정**: 구조와 사용 목적을 결정했지만 아직 설치 또는 전환하지 않았다.
- **조건부**: 실제 요구가 생겼을 때만 추가한다.
- **미결정**: 데이터 검증이나 운영 조건을 확인한 뒤 결정한다.

## 2. 전체 구조

```text
React Native 앱
  -> Elbero NestJS API
     -> KRIC 등 공공데이터 API
     -> 정규화·검증·캐시
  <- 앱 전용 응답
```

- 모바일 앱은 KRIC를 직접 호출하지 않는다.
- `KRIC_SERVICE_KEY`와 같은 비밀값은 NestJS 서버에서만 사용한다.
- 백엔드는 외부 API의 필드와 오류를 앱 계약으로 변환한다.
- 앱은 KRIC 원본 코드가 아니라 `Station`, `Journey`, `GuidanceStep` 같은 Elbero 도메인 모델을
  사용한다.
- `tools/kric`의 스크립트는 조사·원본 검증·회귀 확인 도구이며 제품 백엔드가 아니다.

## 3. 현재 사용 중인 기술

### 공통과 저장소

| 구분 | 기술 | 현재 버전/설정 | 역할 |
| --- | --- | --- | --- |
| 런타임 | Node.js | `.nvmrc`의 `24.15.0` | 개발·빌드·API 실행 |
| 패키지 관리 | npm workspaces | `apps/*`, `packages/*` | 단일 저장소에서 앱·API·계약 관리 |
| 언어 | TypeScript | 6.x, strict | 앱·API·공유 계약의 정적 타입 |
| 공유 계약 | `@elbero/contracts` | workspace package | 안정된 공용 도메인 타입 공유 |
| 형상 관리 | Git/GitHub | GitHub Project 연동 | 작업·코드·결정 추적 |

### 모바일 앱

| 구분 | 기술 | 현재 상태 |
| --- | --- | --- |
| 앱 프레임워크 | Expo SDK 57 | 사용 중 |
| UI 런타임 | React 19.2.3 | 사용 중 |
| 네이티브 런타임 | React Native 0.86.3 | 사용 중 |
| 웹 확인 | React Native Web 0.21.x | 개발용으로 사용 중 |
| 스타일 | React Native `StyleSheet` | 사용 중 |
| 플랫폼 | iOS·Android, 개발용 Web | 사용 중 |

Expo SDK 57은 React Native 0.86과 React 19.2.3 조합을 대상으로 한다. Expo 패키지는 호환
버전을 선택하도록 `npx expo install`로 설치한다.

### 백엔드

| 구분 | 기술 | 현재 상태 |
| --- | --- | --- |
| 프레임워크 | NestJS 12 | 사용 중 |
| HTTP 어댑터 | Express | 사용 중 |
| 테스트 | Vitest, Supertest | 사용 중 |
| 린트 | Oxlint | 사용 중 |
| 포맷 | Prettier | 사용 중 |
| 외부 데이터 | KRIC Open API | T02에서 표본 검증 중 |

현재 제품 API는 `/health`만 구현되어 있다. KRIC 호출 스크립트는 제품 API가 아니며, Swagger와
KRIC 도메인 모듈은 별도 구현 대상이다.

## 4. 채택 예정인 모바일 기술

| 영역 | 선택 | 상태 | 선택 기준 |
| --- | --- | --- | --- |
| 내비게이션 | Expo Router | 채택 예정 | Expo SDK 57 호환, 파일 기반 라우팅, 딥링크와 화면 경계 표준화 |
| 서버 상태 | TanStack Query | 채택 예정 | 요청 상태·캐시·재시도·무효화와 화면 상태 분리 |
| API 계약 | Nest Swagger OpenAPI에서 앱 타입 생성 | 채택 예정 | 요청·응답 계약의 단일 원천 유지 |
| 로컬 상태 | React state/context | 기본 선택 | 화면·작은 공유 상태에 추가 라이브러리 없이 사용 |
| 전역 클라이언트 상태 | Zustand | 조건부 | 여러 화면이 동시에 수정하는 상태가 실제로 생길 때만 도입 |
| 폼 | React Hook Form | 조건부 | 복잡한 입력·검증 화면이 생길 때 도입 |
| 런타임 스키마 | Zod | 조건부 | 외부·로컬 저장 데이터에 런타임 검증이 필요한 경계에서만 사용 |
| 컴포넌트 테스트 | Jest Expo + React Native Testing Library | 채택 예정 | Expo 공식 테스트 흐름과 사용자 행동 중심 검증 |
| E2E | Maestro | 채택 예정 | iOS·Android 핵심 여정 반복 검증 |

상태 도구는 중복해서 사용하지 않는다. 서버에서 받은 여정은 TanStack Query, 현재 단계처럼 한
화면 흐름에 속한 상태는 React state, 재실행 후 복구할 데이터는 저장소가 소유한다.

## 5. 데이터 저장 결정

| 데이터 | 저장 방식 | 상태 |
| --- | --- | --- |
| API URL·공개 빌드 설정 | `EXPO_PUBLIC_*` | 사용 중 |
| KRIC 키·서버 비밀값 | API 서버 환경변수 | 사용 중 |
| 작은 UI 설정 | AsyncStorage | 조건부 |
| 인증 토큰 | SecureStore | 인증 도입 시에만 |
| 버전이 있는 역·경로 데이터 | SQLite 또는 파일 패키지 | T02·T03 이후 결정 |
| 현재 여정 복구 snapshot | 작은 크기는 AsyncStorage, 관계 조회가 필요하면 SQLite | T07에서 결정 |

`EXPO_PUBLIC_*` 값은 앱 번들에서 읽을 수 있으므로 비밀값을 넣지 않는다. 현재 앱에는 공개 API
주소만 둔다.

## 6. 백엔드 도입 예정 기술

| 영역 | 선택 | 상태 |
| --- | --- | --- |
| API 문서와 수동 테스트 | `@nestjs/swagger` | 채택 예정 |
| 설정 검증 | `@nestjs/config` + 시작 시 환경변수 검증 | 채택 예정 |
| 요청 검증 | `class-validator`, `class-transformer`, 전역 `ValidationPipe` | 채택 예정 |
| 외부 API | KRIC 전용 client/service + timeout + 오류 매핑 | 채택 예정 |
| 캐시 | 먼저 메모리 또는 파일 패키지, 운영 규모에 따라 Redis 검토 | 조건부 |
| DB | 지원 범위·갱신 방식 확정 후 선택 | 미결정 |
| 관측성 | request ID, 구조화 로그, 오류 추적 | 채택 예정 |

Swagger를 추가할 때는 단순히 페이지를 띄우는 것으로 끝내지 않는다. 모든 외부 endpoint가 요청
DTO, 성공 응답, 주요 오류 응답을 포함하고 Swagger의 `Try it out`으로 실제 호출 가능해야 한다.

## 7. 계약의 단일 원천

- 백엔드의 Request/Response DTO와 Swagger OpenAPI가 HTTP 계약의 원천이다.
- 앱 API 타입은 OpenAPI에서 생성한다. 같은 응답 타입을 앱에서 손으로 다시 작성하지 않는다.
- `@elbero/contracts`에는 HTTP 프레임워크와 무관하고 양쪽에서 안정적으로 사용하는 도메인
  enum·값 객체만 둔다.
- KRIC 원본 타입은 백엔드의 KRIC 모듈 내부에만 둔다.
- 외부 DTO를 앱 화면까지 전달하지 않고 mapper에서 앱 도메인 모델로 변환한다.

## 8. 품질 기준

모든 변경은 최소한 다음 검사를 통과해야 한다.

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

모바일 기능은 iOS와 Android에서 확인한다. Web은 빠른 레이아웃 확인용이며 네이티브 검증을
대체하지 않는다. 경로·방향·이격거리처럼 안전에 영향을 주는 데이터는 fixture만 통과했다고
완료하지 않고 원본 및 실제 동선 근거와 대조한다.

## 9. 변경 규칙

- 신규 라이브러리는 해결하는 문제와 제거 가능한 자체 코드가 명확할 때만 추가한다.
- Expo SDK 패키지는 SDK 57 문서와 호환 버전을 확인한다.
- 상태 관리·UI 프레임워크를 편의만으로 중복 도입하지 않는다.
- 기술 선택이 바뀌면 이 문서의 상태와 이유를 같은 변경에서 갱신한다.
- 실험용 코드는 제품 경로에 섞지 않고 `tools/` 또는 명시적인 spike에 둔다.

## 10. 공식 참고 문서

- [Expo SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/)
- [Expo Router for SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/)
- [Expo environment variables](https://docs.expo.dev/guides/environment-variables/)
- [Expo unit testing with Jest](https://docs.expo.dev/develop/unit-testing/)
- [React Native accessibility](https://reactnative.dev/docs/accessibility)
- [TanStack Query for React Native](https://tanstack.com/query/latest/docs/framework/react/react-native)
