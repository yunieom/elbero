# T25 최종 빌드·릴리스와 운영 인계

## 현재 고정값

| 항목 | 값 |
| --- | --- |
| 앱 이름 | 엘베로 |
| 공개 버전 | 1.0.0 |
| iOS Bundle ID | `com.elbero.mobile` |
| iOS buildNumber | `1`부터 시작 |
| Android Package | `com.elbero.mobile` |
| Android versionCode | `1`부터 시작 |
| 지원 노선 | 13개 |
| 모바일 역 카탈로그 | 508역 |
| EAS 버전 관리 | local, production 자동 증가 |

## 1. 운영 API 준비

1. NestJS API를 HTTPS 주소에 배포한다.
2. 서버 환경변수 `KRIC_SERVICE_KEY`, `SEOUL_OPEN_DATA_API_KEY`, `PORT`를 배포 서비스에만 저장한다.
3. `/health`가 200을 반환하는지 확인한다.
4. 대표 정상·고장·미확인 여정 API를 확인한다.
5. 배포 사업자의 IP·보안 로그 항목과 보존 기간을 개인정보 처리방침에 기록한다.

공공데이터 키는 모바일 앱이나 `EXPO_PUBLIC_` 환경변수에 넣지 않는다.

## 2. EAS 프로젝트 연결과 환경변수

`apps/mobile`에서 Expo 계정으로 프로젝트를 연결한다.

```bash
npx eas-cli init
npx eas-cli env:set --name EXPO_PUBLIC_API_URL --value https://API주소 --environment production --visibility plaintext
npx eas-cli env:set --name EXPO_PUBLIC_REPORT_EMAIL --value 지원이메일 --environment production --visibility plaintext
npx eas-cli env:list --environment production
```

`EXPO_PUBLIC_` 값은 앱 번들에서 읽을 수 있으므로 API 비밀키를 저장하지 않는다.

## 3. 출시 전 검사

환경변수를 노출하지 않고 현재 셸에 주입해 실행한다.

```bash
EXPO_PUBLIC_API_URL=https://API주소 \
EXPO_PUBLIC_REPORT_EMAIL=지원이메일 \
npm run release:check

npm test
npm run typecheck
npm run lint
npm run build
```

Git 상태가 깨끗하고 출시 커밋이 원격 저장소에 올라갔는지 확인한다.

## 4. 내부 배포

```bash
cd apps/mobile
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
```

내부 배포에서 앱 시작, 역 검색, 정상 경로, 미확인 경로, 오프라인 복구, 오류 제보를 확인한다.

## 5. 제출 패키지

```bash
cd apps/mobile
npx eas-cli build --platform all --profile production
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```

실제 제출은 Apple·Google 개발자 계정, 약관, 인증서와 스토어 등록 정보가 준비된 뒤 사용자가 수행한다.

## 6. 출시 후 운영

- 승강기 상태 조회 실패율과 `NO_ACCESSIBLE_ROUTE` 증가를 확인한다.
- 제보 메일은 노선·역·방향·시설 ID로 분류한다.
- 잘못된 안전 추천 제보는 즉시 해당 시설 또는 경로를 미확인 처리한다.
- 수정 후 자동 회귀와 대표 여정을 재검증한다.
- 데이터 변경만으로 해결되는 경우에도 데이터 버전과 확인일을 갱신한다.

## 롤백 기준

- 운행 중지 시설이 안전 경로로 추천됨
- 방향 또는 출구가 반대로 안내됨
- 저장 여정이 다른 사용자 선택으로 복구됨
- 운영 API 장애가 지속되어 미확인 상태도 표시할 수 없음

스토어 즉시 롤백이 어려운 경우 운영 API에서 위험 경로를 추천 제외하고, 앱에는 안전 경로 미확인 상태를 반환한다.
