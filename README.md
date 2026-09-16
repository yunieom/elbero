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

API 상태 확인 주소는 `http://localhost:3000/health`입니다. 실제 휴대폰에서
개발 API에 연결할 때는 `apps/mobile/.env.example`을 복사한 뒤 localhost를
개발 PC의 같은 네트워크 IP로 바꿉니다.
