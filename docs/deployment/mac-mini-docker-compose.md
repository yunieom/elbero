# 맥미니 상시 테스트 서버

Docker Compose로 API, 웹 앱, Expo Go용 Metro 서버를 상시 실행한다. 모든 서비스는 `restart: unless-stopped` 정책을 사용하므로 Docker Desktop이 로그인 시 시작되면 맥미니 재부팅 후에도 자동 복구된다.

## 최초 설정

1. 맥미니 공유기에서 LAN IP를 고정하거나 DHCP 예약을 설정한다.
2. Compose 설정 파일을 만든다.

```bash
cp .env.compose.example .env.compose
```

3. `.env.compose`의 `MAC_MINI_HOST`에 맥미니의 고정 IP 또는 로컬 DNS 이름을 입력한다.
4. `apps/api/.env`에 `SEOUL_OPEN_DATA_API_KEY`를 설정한다. 이 파일은 Docker 이미지에 복사되지 않고 컨테이너의 `/app/.env`에 읽기 전용으로 연결된다. 키에 `$` 같은 특수 문자가 있어도 Compose가 값을 다시 해석하지 않는다.
5. Docker Desktop의 `Start Docker Desktop when you sign in`을 켠다.

## 실행

웹 앱과 API만 상시 실행:

```bash
docker compose --env-file .env.compose up -d --build api web
```

iPhone·Android에서 Expo Go까지 사용:

```bash
docker compose --env-file .env.compose --profile native up -d --build
```

접속 주소:

- 웹 앱: `http://<MAC_MINI_HOST>:4318`
- API 상태: `http://<MAC_MINI_HOST>:3000/health`
- Swagger: `http://<MAC_MINI_HOST>:3000/docs`
- Expo Go: `exp://<MAC_MINI_HOST>:8081`

휴대폰과 맥미니는 같은 네트워크에 있어야 한다. iOS 또는 Android에 Expo Go를 설치하고 Expo 주소를 열거나 Metro QR 코드를 스캔한다.

## 운영 명령

```bash
# 상태
docker compose --env-file .env.compose --profile native ps

# 로그
docker compose --env-file .env.compose --profile native logs -f --tail=200

# 새 코드 반영
git pull
docker compose --env-file .env.compose --profile native up -d --build

# 재시작
docker compose --env-file .env.compose --profile native restart

# 종료
docker compose --env-file .env.compose --profile native down
```

## 공개 인터넷 연결 전 주의

현재 구성은 같은 LAN에서 QA하기 위한 것이다. 외부 인터넷에 공개할 때는 3000·8081 포트를 직접 포트포워딩하지 말고 HTTPS 리버스 프록시, 인증, 방화벽 정책을 먼저 추가한다.
