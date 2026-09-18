# Elbero 모바일 앱 아키텍처 및 코딩 컨벤션

## 1. 문서 목적

이 문서는 Elbero React Native 앱을 기능 단위로 나누고, 화면·데이터 요청·상태·컴포넌트·오류·
접근성·테스트를 일관되게 구현하기 위한 표준이다.

앱의 핵심 흐름은 다음과 같다.

```text
역 선택
  -> 접근 가능한 여정 검색
  -> 출발역 진입 안내
  -> 권장 차량·문과 이격거리 경고
  -> 환승 안내 반복
  -> 도착역 퇴장 안내
```

새 코드는 이 문서를 따른다. 구조가 아직 없는 폴더를 미리 전부 만들지는 않고, 첫 기능이 생길
때 표준 위치에 추가한다.

## 2. 핵심 원칙

### 2.1 기능 중심으로 나눈다

`screens`, `components`, `hooks`를 전역 폴더 하나에 모두 모으지 않는다. 사용자가 수행하는 기능을
중심으로 관련 화면, API hook, 상태와 테스트를 가까이 둔다.

Elbero의 초기 기능 모듈은 다음을 기준으로 한다.

- `station-search`: 출발·도착역 검색과 선택
- `journey-search`: 접근 가능한 여정 요청과 후보 선택
- `journey-guidance`: 진입·탑승·환승·퇴장 단계 안내
- `journey-progress`: 현재 단계와 이전·다음 이동
- `issue-report`: 오류 제보와 도움말

### 2.2 라우트는 얇게 유지한다

Expo Router의 `app/` 파일은 URL, 화면 옵션과 feature screen 연결만 담당한다. API 호출, 경로
조합, 문구 생성 같은 로직을 라우트 파일에 넣지 않는다.

```tsx
import { JourneyGuideScreen } from '@/features/journey-guidance';

export default function JourneyRoute() {
  return <JourneyGuideScreen />;
}
```

### 2.3 외부 데이터와 화면 모델을 분리한다

```text
NestJS response DTO
  -> API client
  -> mapper
  -> 앱 domain model
  -> query hook
  -> screen/component
```

- KRIC 원본 필드와 코드를 컴포넌트가 직접 해석하지 않는다.
- API 응답이 바뀌어도 mapper와 API 경계 안에서 흡수한다.
- `unknown`, `out_of_service`, 오래된 데이터 상태를 정상 데이터와 구분한다.
- 근거 없는 시간·거리·상태를 UI 기본값으로 만들어내지 않는다.

## 3. 목표 폴더 구조

```text
apps/mobile/
├── app/                         # Expo Router route와 layout만
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── stations.tsx
│   └── journeys/
│       └── [journeyId].tsx
├── src/
│   ├── core/                    # 앱 전체 조립
│   │   ├── providers/
│   │   └── config/
│   ├── features/
│   │   ├── station-search/
│   │   ├── journey-search/
│   │   ├── journey-guidance/
│   │   ├── journey-progress/
│   │   └── issue-report/
│   ├── entities/
│   │   ├── station/
│   │   ├── journey/
│   │   ├── guidance-step/
│   │   └── elevator/
│   └── shared/
│       ├── api/
│       ├── config/
│       ├── hooks/
│       ├── lib/
│       ├── storage/
│       ├── theme/
│       ├── ui/
│       └── test/
├── assets/
├── app.json
└── package.json
```

### Feature 내부 구조

필요한 폴더만 생성한다.

```text
src/features/journey-guidance/
├── api/
│   ├── journey-guidance.api.ts
│   └── journey-guidance.queries.ts
├── components/
│   ├── guidance-step-card.tsx
│   └── platform-gap-warning.tsx
├── hooks/
│   └── use-journey-guidance.ts
├── model/
│   ├── journey-guidance.mapper.ts
│   ├── journey-guidance.types.ts
│   └── journey-guidance.constants.ts
├── screens/
│   └── journey-guide.screen.tsx
├── journey-guidance.test.tsx
└── index.ts
```

`index.ts`는 모듈의 공개 API다. 다른 모듈은 내부 파일을 깊게 import하지 않는다.

```ts
// 허용
import { JourneyGuideScreen } from '@/features/journey-guidance';

// 금지
import { JourneyGuideScreen } from '@/features/journey-guidance/screens/journey-guide.screen';
```

## 4. 의존 방향

```text
app routes
  -> features
     -> entities
        -> shared

core providers
  -> shared infrastructure
```

- `shared`는 feature나 entity를 import하지 않는다.
- `entities`는 feature를 import하지 않는다.
- feature 간 직접 참조는 피하고 route 또는 상위 orchestration feature에서 조합한다.
- 두 feature가 같은 로직을 쓴다고 즉시 `shared`로 옮기지 않는다. 도메인 규칙이면 적절한 entity가
  소유한다.
- 순환 의존성이 생기면 barrel export를 늘리기 전에 책임을 다시 나눈다.

## 5. 모듈별 책임

| 영역 | 책임 | 하지 않는 일 |
| --- | --- | --- |
| `app/` | route, layout, route parameter 전달 | API 호출, 업무 규칙 |
| `screens/` | 화면 조합, loading/error/empty 분기 | 원본 응답 파싱 |
| `components/` | 재사용 가능한 UI와 사용자 상호작용 | 전역 상태 임의 접근 |
| `hooks/` | UI와 use case 연결, side effect 생명주기 | JSX 대량 작성 |
| `api/` | HTTP 호출, query key와 server-state hook | 화면 문구 결정 |
| `model/` | 타입, mapper, selector, 도메인 규칙 | 네이티브 UI 렌더링 |
| `entities/` | 안정된 핵심 개념과 표현 | 특정 화면 흐름 소유 |
| `shared/` | API 기반, theme, 공용 UI, 순수 utility | 특정 역·여정 규칙 |

## 6. 파일과 이름 규칙

| 대상 | 형식 | 예시 |
| --- | --- | --- |
| 파일·폴더 | kebab-case | `platform-gap-warning.tsx` |
| 컴포넌트 | PascalCase | `PlatformGapWarning` |
| screen 파일 | `*.screen.tsx` | `journey-guide.screen.tsx` |
| hook | `use-*.ts` | `use-journey-guidance.ts` |
| API 호출 | `*.api.ts` | `journeys.api.ts` |
| query 정의 | `*.queries.ts` | `journeys.queries.ts` |
| mapper | `*.mapper.ts` | `journey.mapper.ts` |
| 타입 | `*.types.ts` | `journey.types.ts` |
| 상수 | `*.constants.ts` | `journey.constants.ts` |
| 테스트 | 대상명 + `.test.ts(x)` | `guidance-step-card.test.tsx` |

- 컴포넌트·타입은 `PascalCase`, 함수·변수는 `camelCase`를 사용한다.
- boolean은 `is`, `has`, `can`, `should`로 시작한다.
- 이벤트 prop은 `onPress`, `onSelectStation`, handler는 `handlePress`, `handleSelectStation`으로
  구분한다.
- `data`, `item`, `value`는 작은 콜백 범위를 제외하고 의미가 드러나는 이름으로 바꾼다.

## 7. 컴포넌트 컨벤션

### 7.1 Screen과 UI 컴포넌트를 구분한다

- Screen은 query와 상태를 연결하고 화면 상태를 선택한다.
- UI 컴포넌트는 props로 받은 값을 렌더링하고 사용자 이벤트를 위로 전달한다.
- 공용 UI가 특정 feature의 query store를 직접 읽지 않는다.
- API client를 컴포넌트 body에서 직접 호출하지 않는다.

### 7.2 Props 기준

- 화면에서 필요한 최소 데이터만 전달한다.
- API DTO 전체를 편의상 넘기지 않는다.
- boolean prop이 늘어나 서로 모순되는 조합이 생기면 variant 또는 분리된 컴포넌트를 사용한다.
- `children`이 구조를 명확하게 만들 때 사용하고, 이름 있는 slot이 더 명확하면 명시적 prop을
  사용한다.

### 7.3 렌더링과 성능

- 렌더링 중 데이터 변경, navigation, storage 쓰기를 수행하지 않는다.
- 파생값은 먼저 일반 계산으로 작성하고 실제 측정 결과가 있을 때만 `useMemo`를 사용한다.
- 모든 handler를 습관적으로 `useCallback`으로 감싸지 않는다.
- 긴 역·단계 목록은 `FlatList`를 사용하고 안정된 ID를 key로 사용한다.
- 배열 index를 변경 가능한 목록의 key로 사용하지 않는다.

## 8. 상태 관리 컨벤션

상태의 소유자를 먼저 결정한다.

| 상태 | 소유 도구 | 예시 |
| --- | --- | --- |
| 컴포넌트 한 곳의 임시 상태 | `useState` | 카드 펼침 여부 |
| 복잡하지만 한 화면에 한정 | `useReducer` | 출발·도착 선택 흐름 |
| 서버 데이터 | TanStack Query | 역 목록, 여정 결과 |
| route로 표현되는 상태 | Expo Router params | 선택한 `journeyId` |
| 재실행 후 필요한 상태 | storage repository | 현재 여정 snapshot |
| 여러 화면의 쓰기 가능한 상태 | Zustand 검토 | 실제 요구가 생긴 경우만 |

- 서버 응답을 전역 store에 복사하지 않는다.
- query 결과와 같은 값을 local state에 다시 저장하지 않는다.
- 파생 상태는 원본 상태에서 계산한다.
- URL/route parameter로 복구 가능한 값은 navigation 상태와 별도 store에 이중 저장하지 않는다.

## 9. API와 오류 처리

### 9.1 API 호출 규칙

- 앱은 NestJS API만 호출한다.
- base URL은 `shared/config`에서 한 번 검증한다.
- KRIC 키나 서버 비밀값을 `EXPO_PUBLIC_*`에 넣지 않는다.
- 요청에는 timeout 또는 취소 신호를 적용한다.
- query key는 feature API 폴더에서 관리한다.
- 같은 endpoint를 여러 화면이 각자 다른 방식으로 호출하지 않는다.

### 9.2 화면 상태

모든 서버 기반 화면은 아래 상태를 명시적으로 처리한다.

1. 초기 loading
2. 기존 데이터가 있는 background refresh
3. empty
4. 사용자가 다시 시도할 수 있는 error
5. 지원하지 않는 여정
6. 일부 단계 또는 상태를 확인할 수 없는 incomplete
7. offline 또는 오래된 저장 데이터

`catch` 후 빈 배열을 반환해 실패를 정상적인 empty 상태로 보이게 하지 않는다.

### 9.3 Elbero 데이터 표시 원칙

- `unknown` 상태를 정상 운행으로 표시하지 않는다.
- 확인 시각이 없는 데이터에 현재 시각을 붙이지 않는다.
- 승강장 이격거리는 cm로 표시하고 `0~10cm` 안전(green), `10cm 초과~15cm` 유의(yellow),
  `15cm 초과` 추천하지 않음(red) 기준을 사용한다.
- 색상만으로 위험도를 구분하지 않고 아이콘·문구·접근성 label을 함께 사용한다.
- 연결이 검증되지 않은 진입·환승·퇴장 단계는 하나의 완결 여정으로 통과시키지 않는다.

## 10. Navigation 컨벤션

- route 파일은 화면 이름과 URL 경계를 나타낸다.
- domain ID는 path parameter, 검색·필터는 query parameter 사용을 우선한다.
- route parameter는 문자열 입력으로 보고 feature 경계에서 검증한다.
- `router.push` 문자열을 여러 곳에서 직접 조립하지 않고 route helper 또는 typed route를 사용한다.
- navigation만으로 업무 처리가 완료됐다고 간주하지 않는다.
- Android back, iOS swipe back, deep link 진입에서 같은 상태 복구 규칙을 적용한다.

## 11. 스타일과 디자인 시스템

초기에는 React Native `StyleSheet`와 design token을 사용한다.

```text
src/shared/theme/
├── colors.ts
├── spacing.ts
├── typography.ts
├── radius.ts
└── index.ts
```

- feature 코드에 같은 색상·간격 숫자를 반복하지 않는다.
- platform별 차이가 필요한 값만 `Platform.select` 또는 `.ios.tsx`/`.android.tsx`로 분리한다.
- 작은 차이 때문에 전체 화면을 플랫폼별로 복제하지 않는다.
- 다크 모드를 지원하기 전에도 의미 기반 색상 이름을 사용한다: `textPrimary`, `surface`,
  `danger`, `warning`.
- 고정 높이로 큰 글씨를 잘라내지 않는다.

## 12. 접근성 컨벤션

접근성은 공통 완료 기준이다.

- 모든 상호작용 요소에 올바른 `accessibilityRole`과 의미 있는 label을 제공한다.
- 현재 선택·비활성·확장 상태는 `accessibilityState`로 전달한다.
- 동적으로 바뀌는 오류·진행 상태는 플랫폼에 맞는 live region 또는 announcement를 검토한다.
- VoiceOver와 TalkBack의 읽기 순서가 시각적 순서와 일치해야 한다.
- 장식 아이콘은 중복해서 읽히지 않게 하고, 의미가 있는 아이콘은 텍스트 대안을 제공한다.
- 터치 영역은 iOS 최소 44pt, Android 최소 48dp를 기준으로 한다.
- 시스템 글꼴 크기 확대에서 내용과 주요 버튼을 사용할 수 있어야 한다.
- 초록·노랑·주황 같은 색상만으로 이격거리 위험을 전달하지 않는다.

## 13. Side effect와 네이티브 API

- 구독, timer, listener는 effect cleanup을 반드시 반환한다.
- 앱 foreground·network 상태와 query online/focus 상태를 연결하는 코드는 `core/providers`에서
  한 번만 구성한다.
- 권한 요청은 실제 기능 진입 시점에 설명과 함께 수행한다.
- 네이티브 API 호출을 screen마다 반복하지 않고 adapter 또는 feature hook으로 감싼다.
- 실패 가능한 native 동작은 사용자가 복구할 대안을 제공한다. 예: 메일 앱이 없으면 주소 복사.

## 14. 환경변수와 보안

- 앱에서 읽는 공개 설정은 `process.env.EXPO_PUBLIC_NAME` 형식으로 정적으로 참조한다.
- `EXPO_PUBLIC_*`에는 API URL처럼 공개되어도 되는 값만 둔다.
- KRIC 키, 서명 키, 관리자 토큰, DB URL은 모바일 저장소와 번들에 넣지 않는다.
- 로그에 전체 API 응답, 위치 정보, 토큰, 환경변수 값을 남기지 않는다.
- `.env.example`에는 이름과 안전한 예시만 두고 실제 값을 기록하지 않는다.

## 15. TypeScript 컨벤션

- `strict: true`를 유지한다.
- `any` 대신 구체 타입 또는 `unknown`과 type guard를 사용한다.
- 컴포넌트 props와 공개 hook 반환 타입은 의미가 불분명할 때 명시한다.
- 화면 표시용 union은 문자열 union 또는 `as const`를 우선한다.
- type assertion으로 API 오류를 숨기지 않는다.
- nullable 데이터는 `null`과 누락의 의미를 계약에서 구분한다.
- React 컴포넌트에 `React.FC`를 강제하지 않는다.

## 16. Import와 공개 API

import 순서는 다음을 기본으로 한다.

1. React·React Native·Expo
2. 외부 라이브러리
3. workspace package
4. `@/features`, `@/entities`, `@/shared`
5. 같은 모듈의 상대 경로
6. type-only import

- alias는 `@/`를 `apps/mobile/src`에 연결한다.
- 모듈 외부에서는 해당 모듈의 `index.ts`만 import한다.
- 하나의 모듈 안에서는 순환을 숨길 수 있는 barrel보다 상대 경로를 사용할 수 있다.
- type-only 의존성은 `import type`을 사용한다.

## 17. 테스트 컨벤션

### 순수 로직

- mapper, 이격거리 등급, 단계 연결, 지원 여부 판정은 입력·출력이 명확한 단위 테스트로 작성한다.
- `unknown`, 누락, 잘못된 방향, 끊긴 환승을 정상 경로만큼 중요하게 검증한다.

### 컴포넌트

- 구현 세부사항보다 사용자가 보는 텍스트·role·상태·행동을 검증한다.
- testID는 접근성 query로 찾을 수 없는 제한된 경우에만 추가한다.
- loading, error, empty, incomplete, stale 상태를 모두 포함한다.

### 통합과 E2E

- API client는 MSW 또는 명시적인 test adapter로 대체한다.
- 대표 여정 fixture는 API DTO와 domain model을 구분한다.
- E2E는 역 선택 → 경로 조회 → 진입 → 환승 → 퇴장 핵심 흐름을 iOS·Android에서 검증한다.
- Web 테스트 성공을 네이티브 성공으로 간주하지 않는다.

## 18. 새 Feature 구현 순서

1. 사용자 행동과 완료 조건을 적는다.
2. 필요한 API 계약과 domain model을 정의한다.
3. API DTO를 domain model로 바꾸는 mapper를 만든다.
4. 정상·누락·오류 fixture와 순수 로직 테스트를 작성한다.
5. query hook 또는 use case hook을 구현한다.
6. 접근 가능한 UI 컴포넌트를 구현한다.
7. screen에서 loading/error/empty/incomplete 상태를 연결한다.
8. 얇은 route 파일에 screen을 연결한다.
9. iOS·Android와 큰 글씨·VoiceOver/TalkBack을 확인한다.
10. lint, typecheck, test, build를 실행한다.

## 19. 코드 리뷰 체크리스트

### 구조

- [ ] 파일이 사용자 기능 또는 안정된 entity 기준으로 배치됐는가?
- [ ] route와 screen에 원본 응답 파싱이나 업무 규칙이 없는가?
- [ ] feature 외부에서 내부 경로를 deep import하지 않는가?
- [ ] `shared`가 특정 feature에 의존하지 않는가?
- [ ] 불필요한 전역 상태와 새 라이브러리를 추가하지 않았는가?

### 데이터와 상태

- [ ] 앱이 NestJS API만 호출하는가?
- [ ] API DTO와 domain model이 mapper로 분리됐는가?
- [ ] loading/error/empty/incomplete/offline 상태가 구분되는가?
- [ ] `unknown`을 성공이나 정상으로 바꾸지 않는가?
- [ ] 서버 상태를 local/global store에 복제하지 않는가?

### UI와 접근성

- [ ] 색상 없이도 상태와 위험을 이해할 수 있는가?
- [ ] screen reader label, role, state, 읽기 순서가 올바른가?
- [ ] 큰 글씨에서 잘리거나 누를 수 없는 요소가 없는가?
- [ ] 터치 영역이 플랫폼 최소 기준을 충족하는가?
- [ ] Android back과 iOS back에서 상태가 일관되는가?

### 테스트와 보안

- [ ] 핵심 정상 흐름과 누락·실패 흐름을 함께 테스트했는가?
- [ ] KRIC 키나 서버 비밀값이 앱 코드·환경변수·로그에 없는가?
- [ ] 원본 개인정보와 전체 외부 응답을 로그에 남기지 않는가?
- [ ] iOS·Android 검증 증거가 있는가?

## 20. 현재 프로젝트 적용 순서

1. Expo Router를 도입하고 기존 `App.tsx`를 얇은 route와 feature screen으로 분리한다.
2. `src/shared/theme`, `src/shared/ui`, `src/core/providers`를 만든다.
3. 첫 기능인 `station-search`를 표준 구조로 구현한다.
4. NestJS Swagger가 준비되면 OpenAPI 기반 API client 생성을 연결한다.
5. `journey-search`와 `journey-guidance`를 API DTO와 domain model 분리 방식으로 구현한다.
6. Jest Expo·React Native Testing Library와 대표 fixture를 추가한다.
7. 현재 여정 저장 요구가 확정되면 storage adapter를 구현한다.

기존 단일 `App.tsx`는 초기 실행 확인용 코드다. 기능 구현을 계속 그 파일에 추가하지 않고 첫 화면
구현과 함께 위 구조로 전환한다.

## 21. 공식 참고 문서

- [Expo SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/)
- [Expo Router for SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/)
- [Expo environment variables](https://docs.expo.dev/guides/environment-variables/)
- [Expo unit testing with Jest](https://docs.expo.dev/develop/unit-testing/)
- [React Native accessibility](https://reactnative.dev/docs/accessibility)
- [TanStack Query for React Native](https://tanstack.com/query/latest/docs/framework/react/react-native)
