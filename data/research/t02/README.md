# T02 원본 응답 보관 규칙

KRIC 서비스 키로 수집한 원본 응답은 `raw/<수집시각>/`에 저장한다. `raw/`는
Git에서 제외되므로 인증키가 포함된 요청이나 검증 전 원본을 실수로 공개하지 않는다.

## 수집

요청 목록과 방향 조건만 먼저 확인할 수 있다.

```bash
npm run research:t02 -- --dry-run
```

KRIC 활용신청 후 발급받은 **디코딩 서비스 키**를 `apps/api/.env`의
`KRIC_SERVICE_KEY`에 저장한다. 수집기는 루트 `.env`와 `apps/api/.env`를 순서대로
확인하며, 이미 설정된 셸 환경변수를 가장 우선한다.

```bash
npm run research:t02
```

특정 요청만 다시 수집할 때는 `--only`를 사용한다.

```bash
npm run research:t02 -- --only ddp-transfer-5-to-2-westbound
```

키를 `.env`, 명령 파일, 이 문서 또는 이슈 댓글에 기록하지 않는다. 수집 결과의
`manifest.json`에는 키가 제거된 URL, HTTP 상태, KRIC 결과 코드·메시지, 응답 건수,
응답 파일명만 남는다.

## 판정 규칙

- HTTP 200만으로 데이터가 검증되었다고 보지 않는다.
- KRIC `header.resultCode`가 `00`인 응답만 성공으로 판정한다.
- 역·호선·운영기관 코드는 `subwayRouteInfo` 응답과 대조한다.
- 이동 단계는 같은 `mvPathMgNo` 안에서 순서 필드로 정렬한다.
- `elvtSttCd`는 공식 코드표가 확보될 때까지 `unknown`으로 정규화한다.
- 응답에 관측 시각이 없으면 수집 시각을 고장 상태의 관측 시각으로 사용하지 않는다.
- 시설 관리번호·승강기 일련번호·경로 관리번호의 동일성을 문서 근거 없이 추정하지 않는다.
