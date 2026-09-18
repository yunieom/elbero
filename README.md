# Elbero

교통약자를 위한 엘리베이터 중심 지하철 경로 안내 서비스입니다.

## 구조

- `apps/mobile`: Expo 기반 React Native 앱
- `apps/api`: NestJS API 서버
- `packages/contracts`: 앱과 API가 공유하는 TypeScript 계약

하나의 Git 저장소에서 관리하지만 모바일 앱과 API는 각각 독립적으로 실행하고 배포합니다.

## 실행

```bash
nvm use
npm install
```

API와 모바일 앱은 서로 다른 터미널에서 실행합니다.

```bash
npm run dev:api
```

```bash
npm run dev:mobile
```

API 상태 확인 주소는 `http://localhost:3000/health`, Swagger 테스트 화면은
`http://localhost:3000/docs`입니다. 서울 승강기 상태 API를 사용하려면
`apps/api/.env.example`을 참고해 `SEOUL_OPEN_DATA_API_KEY`를 설정합니다.

역별 승강기 상태는 다음 주소에서 조회합니다. 3자리 KRIC 역 코드는 API가
4자리 서울교통공사 코드로 정규화합니다.

```text
GET http://localhost:3000/elevator-status/stations/2543
```

검증된 여정과 현재 승강기 상태를 결합한 결과는 다음 주소에서 확인합니다.

```text
GET http://localhost:3000/journeys/plan?originStationCode=2543&destinationStationCode=2549
GET http://localhost:3000/journeys/plan?originStationCode=2543&destinationStationCode=2551
GET http://localhost:3000/journeys/plan?originStationCode=2543&destinationStationCode=239
```

현재 지원 여정과 안전한 제외 기준은
[`T03 대표 여정 지원 범위와 G0 점검`](docs/product/t03-g0-support-scope.md)에 기록합니다.

실제 휴대폰에서 개발 API에 연결할 때는 `apps/mobile/.env.example`을 복사한 뒤
localhost를 개발 PC의 같은 네트워크 IP로 바꿉니다.

## 공공데이터 조사

T02의 KRIC 동선·환승·엘리베이터 API 검증 결과는
[`docs/research/t02-f03-public-data-validation.md`](docs/research/t02-f03-public-data-validation.md)에
기록합니다. 인증키 없이 요청 목록을 점검하려면 다음 명령을 실행합니다.

```bash
npm run research:t02 -- --dry-run
```

1~9호선의 KRIC·서울교통공사 API 응답 차이는 노선별 감사 명령으로 수집합니다. 현재
완료된 감사 결과는 다음 문서에 있습니다.

- [`5호선 API 정보 차이 감사`](docs/research/line-5-api-sync-audit.md)
- [`9호선 API 정보 차이 감사`](docs/research/line-9-api-sync-audit.md)

지도·편의정보·현장 확인으로 확정한 값은 생성되는 감사 보고서를 직접 수정하지 않고
[`5호선 지상 출구 수동 검증값`](data/verification/line-5-surface-exits.json)에 별도로 기록합니다.

```bash
npm run research:line-sync -- --line 5
```

## 아키텍처와 컨벤션

- [기술 스택과 기술 결정](docs/architecture/technology-stack.md)
- [모바일 앱 아키텍처 및 코딩 컨벤션](docs/conventions/mobile-app-convention.md)
