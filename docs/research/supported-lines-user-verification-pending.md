# 지원 노선 및 수도권 전철 사용자 검증 대기 목록

- 생성일: 2026-10-22
- 사용자 검증값 반영 완료: 1·2·3·4·5·6·7·8·9호선·공항철도·용인에버라인·김포골드라인·신림선·신분당선·GTX-A
- 현재 경로 엔진 구현 완료: 1·2·3·4·5·6·7·8·9호선·공항철도·용인에버라인·김포골드라인·신림선·신분당선·GTX-A
- 1호선 상태: 분기형 경로 어댑터와 운영기관별 고유 역 코드 연결 완료
- 현재 구현 노선의 방향별 차량·문 또는 이격거리 확인 필요: 0역·건
- 현재 구현 노선의 지상 엘리베이터 출구 확인 필요: 0역

## 판정 기준

- 사용자가 이미 확정한 값과 서비스 정책으로 선택 가능한 API 충돌은 제외한다.
- 지상 엘리베이터 출구는 `stationMovement`와 `stinElevatorMovement`의 비어 있지 않은 값이 일치하면 해당 값을 우선 확정한다.
- 방향별 차량·문이 없거나, 선택한 문과 이격거리 레코드가 연결되지 않거나, 안전 경로 검증 상태가 거짓인 경우만 기록한다.
- 지상 엘리베이터 출구 번호가 없더라도 다른 호선 이용으로 확정한 역은 제외한다.
- 이 문서는 생성 데이터에서 자동 산출한다. 같은 감사를 반복하지 말고 `npm run verification:pending-guidance`로 갱신한다.

## 전체 노선 요약

| 노선 | 상태 | API 수집일 | 출구 충돌 | 차량·문 확인 | 이격거리 연결 | 원천 미제공 역 |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| 1호선 | 반영 완료 | 2026-10-20 | 0 | 0 | 0 | 0 |
| 2호선 | 반영 완료 | 2026-10-01 | 0 | 0 | 0 | 0 |
| 3호선 | 반영 완료 | 2026-10-01 | 0 | 0 | 0 | 0 |
| 4호선 | 반영 완료 | 2026-10-01 | 0 | 0 | 0 | 1 |
| 5호선 | 반영 완료 | 2026-10-01 | 0 | 0 | 0 | 0 |
| 6호선 | 반영 완료 | 2026-09-18 | 0 | 0 | 0 | 0 |
| 7호선 | 반영 완료 | 2026-10-01 | 0 | 0 | 0 | 0 |
| 8호선 | 반영 완료 | 2026-10-22 | 0 | 0 | 0 | 0 |
| 9호선 | 반영 완료 | 2026-09-18 | 0 | 0 | 0 | 0 |
| 공항철도 | 반영 완료 | 2026-10-20 | 0 | 0 | 0 | 1 |
| 신분당선 | 반영 완료 | 2026-10-13 | 0 | 0 | 0 | 0 |
| 에버라인 | 반영 완료 | 2026-10-20 | 0 | 0 | 0 | 0 |
| 김포골드라인 | 반영 완료 | 2026-10-13 | 0 | 0 | 0 | 0 |
| GTX-A | 반영 완료 | 2026-10-13 | 0 | 0 | 0 | 0 |
| 신림선 | 반영 완료 | 2026-10-13 | 0 | 0 | 0 | 0 |
| 수인분당선 | 경로 엔진 지원 대상 | 2026-10-13 | 2 | 35 | 6 | 0 |
| 경의중앙선 | 경로 엔진 지원 대상 | 2026-10-13 | 0 | 15 | 15 | 0 |
| 인천 1호선 | 후속 지원 대상 | 2026-09-20 | 0 | 20 | 3 | 0 |
| 인천 2호선 | 후속 지원 대상 | 2026-09-21 | 2 | 10 | 0 | 0 |
| 인천공항 자기부상철도 | 후속 지원 대상 | 2026-09-21 | 0 | 6 | 0 | 0 |
| 경춘선 | 후속 지원 대상 | 2026-09-21 | 0 | 1 | 6 | 0 |
| 경강선 | 후속 지원 대상 | 2026-09-21 | 1 | 12 | 0 | 0 |
| 서해선 | 후속 지원 대상 | 2026-09-21 | 0 | 13 | 12 | 0 |
| 우이신설선 | 후속 지원 대상 | 2026-09-21 | 0 | 13 | 0 | 0 |
| 의정부경전철 | 후속 지원 대상 | 2026-09-21 | 0 | 0 | 0 | 0 |

## 1호선 반영 상태

- 1호선은 경로 엔진과 모바일 역 검색에 연결되어 있다.
- 인천·신창·광명·서동탄 분기는 별도 운행 경로로 계산하며 필요한 경우 구로·금천구청·병점에서 같은 1호선 계통 환승을 안내한다.
- API 수집 대상: 102역
- 사용자 방향별 차량·문 검토 반영: 13역
- 사용자 이격거리 확인값 반영: 9역
- 지상 엘리베이터 출구 충돌: 0역
- 방향별 차량·문 확인: 0역
- 승강장·문·이격거리 연결 확인: 0역
- 이격거리 값 없음: 40건
- 검토 완료값 원본: [1호선 사용자 검증 데이터](../../data/verification/line-1-manual-verification.json)

### 지상 엘리베이터 출구 충돌 (0역)

| 역 | API별 값 |
| --- | --- |
| 없음 | - |

### 방향별 차량·문 확인 (0역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 없음 | - | - | - |

### 승강장·문·이격거리 연결 확인 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 6·8·9호선 반영 상태

- 6호선은 응암순환 단방향과 응암↔신내 본선 경로를 분리해 경로 엔진과 앱에 연결했다.
- 8·9호선은 사용자 확인값과 API 합의값을 경로 엔진과 앱에 연결했다.
- 원천 이격거리 값이 없는 경우에는 안전 등급을 추정하지 않고 승강장 간격 미확인으로 안내한다.

## 신분당선·GTX-A 반영 상태

- 신분당선 16개 역은 직통 경로와 기존 지원 노선 환승을 경로 엔진과 앱에 연결했다.
- GTX-A는 운정중앙–서울역과 수서–동탄을 서로 분리된 운행 구간으로 연결했다. 두 구간 사이의 미개통 연결은 경로로 생성하지 않는다.
- GTX-A에서 차량·문 원천값이 없는 역은 빠른 승하차 위치를 추정하지 않고 위치 미확인으로 안내한다.
- 검토 완료값 원본: [신분당선](../../data/verification/shinbundang-line-manual-verification.json), [GTX-A](../../data/verification/gtx-a-manual-verification.json)

## 2호선

### 방향별 차량·문·이격거리 (0건)

| 역 | 진행 방향 | 확인할 내용 |
| --- | --- | --- |
| 없음 | - | - |

### 지상 엘리베이터 출구 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 3호선

### 방향별 차량·문·이격거리 (0건)

| 역 | 진행 방향 | 확인할 내용 |
| --- | --- | --- |
| 없음 | - | - |

### 지상 엘리베이터 출구 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 4호선

### 방향별 차량·문·이격거리 (0건)

| 역 | 진행 방향 | 확인할 내용 |
| --- | --- | --- |
| 없음 | - | - |

### 지상 엘리베이터 출구 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

### KRIC 원천 이격거리 미제공 (1역)

| 역 | 방향·문 | 처리 |
| --- | --- | --- |
| 진접 (0405) | 7-3 | 수치와 안전 등급을 추정하지 않고 승강장 간격 미확인으로 안내 |

## 5호선

### 방향별 차량·문·이격거리 (0건)

| 역 | 진행 방향 | 확인할 내용 |
| --- | --- | --- |
| 없음 | - | - |

### 지상 엘리베이터 출구 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 7호선

### 방향별 차량·문·이격거리 (0건)

| 역 | 진행 방향 | 확인할 내용 |
| --- | --- | --- |
| 없음 | - | - |

### 지상 엘리베이터 출구 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 8호선 · 경로 엔진 연결 전

### 방향별 차량·문 (0역)

| 역 | 확인 이유 | 확인 완료 방향 | 남은 방향 | API별 후보 |
| --- | --- | --- | --- | --- |
| 없음 | - | - | - | - |

### 지상 엘리베이터 출구 (0역)

| 역 | API별 값 |
| --- | --- |
| 없음 | - |

## 9호선 · 경로 엔진 연결 전

### 방향별 차량·문 (0역)

| 역 | 확인 이유 | 확인 완료 방향 | 남은 방향 | API별 후보 |
| --- | --- | --- | --- | --- |
| 없음 | - | - | - | - |

### 지상 엘리베이터 출구 (0역)

| 역 | API별 값 |
| --- | --- |
| 없음 | - |

## 공항철도 · 지원 중 · 알려진 데이터 공백

- API 수집: 2026-10-20T07:30:35.048Z
- 대상 역: 14개

### 지상 엘리베이터 출구 충돌 (0역)

| 역 | API별 값 |
| --- | --- |
| 없음 | - |

### 방향별 차량·문 확인 (0역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 없음 | - | - | - |

### 승강장·문·이격거리 연결 확인 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

### 원천 API 미제공 (1역)

| 역 | 미제공 정보 | 처리 |
| --- | --- | --- |
| 인천공항2터미널 (A11, AR) | 승강장 1 · 3-2, 4-2 문 이격거리 | 수치·안전 등급을 추정하지 않고 승강장 간격 미확인으로 안내 |

## 인천 1호선 · 수도권 확대 지원 전

- API 수집: 2026-09-20T11:07:19.407Z
- 대상 역: 33개

### 지상 엘리베이터 출구 충돌 (0역)

| 역 | API별 값 |
| --- | --- |
| 없음 | - |

### 방향별 차량·문 확인 (20역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 검단호수공원 (0107, IC) | stationElevatorCarNumber 누락 | - | stationElevator: 4-3, 5-2 |
| 신검단중앙 (0108, IC) | stationElevatorCarNumber 누락 | - | stationElevator: 4-3, 5-2 |
| 아라 (0109, IC) | stationElevatorCarNumber 누락 | - | stationElevator: 4-3, 5-2 |
| 박촌 (0112, IC) | API 값 충돌 | - | stationElevatorCarNumber: 1-1, 8-4<br>stationElevator: 0-1, 9-4 |
| 계산 (0114, IC) | API 값 충돌 | - | stationElevatorCarNumber: 3-1, 6-4<br>stationElevator: 2-4, 7-1 |
| 경인교대입구 (0115, IC) | API 값 충돌 | - | stationElevatorCarNumber: 3-1, 6-4<br>stationElevator: 2-4, 7-1 |
| 부평 (0120, IC) | API 값 충돌 | - | stationElevatorCarNumber: 3-1, 6-4<br>stationElevator: 2-4 |
| 동수 (0121, IC) | API 값 충돌 | - | stationElevatorCarNumber: 2-2, 7-3<br>stationElevator: 2-4, 7-1 |
| 부평삼거리 (0122, IC) | API 값 충돌 | - | stationElevatorCarNumber: 2-4, 7-1<br>stationElevator: 2-2, 7-2 |
| 간석오거리 (0123, IC) | API 값 충돌 | - | stationElevatorCarNumber: 4-2, 5-3<br>stationElevator: 4-2, 5-2 |
| 예술회관 (0125, IC) | API 값 충돌 | - | stationElevatorCarNumber: 2-3, 7-2<br>stationElevator: 2-4 |
| 문학경기장 (0127, IC) | API 값 충돌 | - | stationElevatorCarNumber: 1-1, 8-4<br>stationElevator: 1-3, 8-1 |
| 선학 (0128, IC) | API 값 충돌 | - | stationElevatorCarNumber: 3-3, 6-2<br>stationElevator: 4-1, 5-4 |
| 신연수 (0129, IC) | API 값 충돌 | - | stationElevatorCarNumber: 4-4, 5-1<br>stationElevator: 4-3 |
| 동춘 (0131, IC) | API 값 충돌 | - | stationElevatorCarNumber: 2-4, 7-1<br>stationElevator: 6-4 |
| 동막 (0132, IC) | API 값 충돌 | - | stationElevatorCarNumber: 4-4<br>stationElevator: 5-1 |
| 캠퍼스타운 (0133, IC) | API 값 충돌 | - | stationElevatorCarNumber: 4-4<br>stationElevator: 4-4, 5-1 |
| 테크노파크 (0134, IC) | API 값 충돌 | - | stationElevatorCarNumber: 4-4, 5-1<br>stationElevator: 5-1 |
| 지식정보단지 (0135, IC) | API 값 충돌 | - | stationElevatorCarNumber: 4-1, 5-1<br>stationElevator: 4-4, 5-1 |
| 송도달빛축제공원 (0139, IC) | API 값 충돌 | - | stationElevatorCarNumber: 4-4<br>stationElevator: 5-1 |

### 승강장·문·이격거리 연결 확인 (3역)

| 역 | 확인할 내용 |
| --- | --- |
| 검단호수공원 (0107, IC) | 이격거리 API 행 없음 |
| 신검단중앙 (0108, IC) | 이격거리 API 행 없음 |
| 아라 (0109, IC) | 이격거리 API 행 없음 |

## 인천 2호선 · 수도권 확대 지원 전

- API 수집: 2026-09-21T01:00:45.344Z
- 대상 역: 27개

### 지상 엘리베이터 출구 충돌 (2역)

| 역 | API별 값 |
| --- | --- |
| 만수 (0224, IC) | stationMovement: 2, 3, 4<br>stinElevatorMovement: 2, 3<br>stationElevator: 1, 4 |
| 남동구청 (0225, IC) | stationMovement: 1, 3, 4<br>stinElevatorMovement: 1, 3<br>stationElevator: 1, 3 |

### 방향별 차량·문 확인 (10역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 가정중앙시장 (0212, IC) | API 값 충돌 | - | stationElevatorCarNumber: 1-3, 2-1<br>stationElevator: 1-3 |
| 석남 (0213, IC) | API 값 충돌 | - | stationElevatorCarNumber: 1-3, 2-1<br>stationElevator: 1-3 |
| 서부여성회관 (0214, IC) | API 값 충돌 | - | stationElevatorCarNumber: 1-3, 2-1<br>stationElevator: 1-3 |
| 인천가좌 (0215, IC) | API 값 충돌 | - | stationElevatorCarNumber: 1-3, 2-1<br>stationElevator: 1-3 |
| 가재울 (0216, IC) | API 값 충돌 | - | stationElevatorCarNumber: 1-3, 2-1<br>stationElevator: 1-3 |
| 주안국가산단 (0217, IC) | API 값 충돌 | - | stationElevatorCarNumber: 1-3, 2-1<br>stationElevator: 1-3 |
| 주안 (0218, IC) | API 값 충돌 | - | stationElevatorCarNumber: 1-3, 2-1<br>stationElevator: 1-3 |
| 인천시청 (0221, IC) | API 값 충돌 | - | stationElevatorCarNumber: 1-3, 2-1<br>stationElevator: 1-1, 1-3, 2-3, 8-4 |
| 석천사거리 (0222, IC) | API 값 충돌 | - | stationElevatorCarNumber: 1-3, 2-1<br>stationElevator: 1-3 |
| 모래내시장 (0223, IC) | API 값 충돌 | - | stationElevatorCarNumber: 1-3, 2-1<br>stationElevator: 1-3 |

### 승강장·문·이격거리 연결 확인 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 인천공항 자기부상철도 · 수도권 확대 지원 전

- API 수집: 2026-09-21T00:56:53.431Z
- 대상 역: 6개

### 지상 엘리베이터 출구 충돌 (0역)

| 역 | API별 값 |
| --- | --- |
| 없음 | - |

### 방향별 차량·문 확인 (6역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 인천공항1터미널 (0101, IA) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 장기주차장 (0102, IA) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 합동청사 (0103, IA) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 파라다이스시티 (0104, IA) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 워터파크 (0105, IA) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 용유 (0106, IA) | stationElevatorCarNumber 누락 | - | 후보 없음 |

### 승강장·문·이격거리 연결 확인 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 수인분당선 · 경로 엔진 연결 전

- API 수집: 2026-10-13T23:17:09.809Z
- 대상 역: 63개

### 지상 엘리베이터 출구 충돌 (2역)

| 역 | API별 값 |
| --- | --- |
| 정자 (K230, KR) | stationMovement: 2, 3, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 2, 4 |
| 고색 (K246, KR) | stinElevatorMovement: 3<br>stationElevator: 3, 4 |

### 방향별 차량·문 확인 (35역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 청량리 (K209, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 강남구청 (K213, KR) | API 값 충돌 | - | stationElevatorCarNumber: 1-2, 2-2, 3-1, 4-4, 5-3, 6-3<br>stationElevator: 1-2, 6-2 |
| 선릉 (K215, KR) | stationElevatorCarNumber 누락 | - | stationElevator: 1-2, 2-4, 3-4, 5-1, 6-3, 8-1 |
| 한티 (K216, KR) | API 값 충돌 | - | stationElevatorCarNumber: 3-2, 4-3<br>stationElevator: 3-3, 4-3 |
| 도곡 (K217, KR) | API 값 충돌 | - | stationElevatorCarNumber: 2-4, 3-1, 6-4<br>stationElevator: 2-4, 3-1 |
| 개포동 (K219, KR) | API 값 충돌 | - | stationElevatorCarNumber: 5-1<br>stationElevator: 4-4 |
| 대모산입구 (K220, KR) | API 값 충돌 | - | stationElevatorCarNumber: 4-4, 5-1<br>stationElevator: 4-4 |
| 가천대 (K223, KR) | API 값 충돌 | - | stationElevatorCarNumber: 2-4, 6-4<br>stationElevator: 2-4, 7-2 |
| 태평 (K224, KR) | API 값 충돌 | - | stationElevatorCarNumber: 1-1<br>stationElevator: 2-3, 6-4 |
| 이매(성남아트센터) (K227, KR) | API 값 충돌 | - | stationElevatorCarNumber: 2-1, 5-3<br>stationElevator: 3-1, 6-4 |
| 서현 (K228, KR) | API 값 충돌 | - | stationElevatorCarNumber: 3-1, 6-4<br>stationElevator: 3-2, 6-4 |
| 미금(분당서울대병원) (K231, KR) | API 값 충돌 | - | stationElevatorCarNumber: 3-2, 4-3<br>stationElevator: 2-1, 5-4 |
| 청명 (K239, KR) | API 값 충돌 | - | stationElevatorCarNumber: 4-2, 5-3<br>stationElevator: 1-3, 8-1 |
| 영통(경희대) (K240, KR) | API 값 충돌 | - | stationElevatorCarNumber: 2-1, 2-2<br>stationElevator: 3-2, 6-2 |
| 망포 (K241, KR) | API 값 충돌 | - | stationElevatorCarNumber: 2-4, 5-1<br>stationElevator: 1-3, 8-1 |
| 매탄권선 (K242, KR) | API 값 충돌 | - | stationElevatorCarNumber: 4-1, 5-2<br>stationElevator: 2-2, 7-2 |
| 수원시청(경기도문화의전당) (K243, KR) | API 값 충돌 | - | stationElevatorCarNumber: 3-3, 6-1<br>stationElevator: 3-4, 6-1 |
| 매교 (K244, KR) | API 값 충돌 | - | stationElevatorCarNumber: 2-1, 6-4<br>stationElevator: 2-1, 7-4 |
| 수원 (K245, KR) | API 값 충돌 | - | stationElevatorCarNumber: 1-4, 2-1, 7-4<br>stationElevator: 1-4, 7-4 |
| 고색 (K246, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 오목천 (K247, KR) | stationElevatorCarNumber 누락 | - | stationElevator: 4-3, 5-2 |
| 어천 (K248, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 야목 (K249, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 사리 (K250, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 한대앞 (K251, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 중앙 (K252, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 고잔 (K253, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 초지 (K254, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 안산 (K255, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 능길 (K256, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 정왕 (K257, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 인하대 (K269, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 숭의(인하대병원) (K270, KR) | stationElevatorCarNumber 누락 | - | stationElevator: 2-4, 7-1 |
| 신포 (K271, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 인천 (K272, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |

### 승강장·문·이격거리 연결 확인 (6역)

| 역 | 확인할 내용 |
| --- | --- |
| 압구정로데오 (K212, KR) | 권장 문 이격거리 없음: 1:7-2 |
| 죽전(단국대) (K233, KR) | 권장 문 이격거리 없음: 3:3-1, 4:3-1 |
| 기흥(백남준아트센터) (K237, KR) | 권장 문 이격거리 없음: 3:3-2, 4:3-2 |
| 수원 (K245, KR) | 권장 문 이격거리 없음: 1:7-4, 2:7-4 |
| 오이도 (K258, KR) | 권장 문 이격거리 없음: 1:7-2, 2:7-2, 3:4-3, 4:4-3 |
| 월곶 (K260, KR) | 권장 문 이격거리 없음: 3:5-2, 4:5-2 |

## 경춘선 · 수도권 확대 지원 전

- API 수집: 2026-09-21T00:57:18.591Z
- 대상 역: 25개

### 지상 엘리베이터 출구 충돌 (0역)

| 역 | API별 값 |
| --- | --- |
| 없음 | - |

### 방향별 차량·문 확인 (1역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 광운대 (0119, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |

### 승강장·문·이격거리 연결 확인 (6역)

| 역 | 확인할 내용 |
| --- | --- |
| 퇴계원 (P125, KR) | 권장 문 이격거리 없음: 3:4-2, 4:4-2 |
| 사릉 (P126, KR) | 권장 문 이격거리 없음: 4:3-3 |
| 평내호평 (P128, KR) | 권장 문 이격거리 없음: 3:4-4, 4:4-4 |
| 마석 (P130, KR) | 권장 문 이격거리 없음: 4:5-2 |
| 대성리 (P131, KR) | 권장 문 이격거리 없음: 3:4-4, 4:4-4 |
| 춘천(한림대) (P140, KR) | 권장 문 이격거리 없음: 3:4-2, 4:5-2 |

## 경의중앙선 · 경로 엔진 연결 전

- API 수집: 2026-10-13T23:17:30.977Z
- 대상 역: 58개

### 지상 엘리베이터 출구 충돌 (0역)

| 역 | API별 값 |
| --- | --- |
| 없음 | - |

### 방향별 차량·문 확인 (15역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 서빙고 (K112, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 한남 (K113, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 응봉 (K115, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 지평 (K138, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 효창공원앞 (K311, KR) | stationElevatorCarNumber 누락 | - | stationElevator: 4-2, 5-4 |
| 공덕 (K312, KR) | API 값 충돌 | - | stationElevatorCarNumber: 4-1, 5-1<br>stationElevator: 1-1, 4-4, 8-4 |
| 서강대 (K313, KR) | API 값 충돌 | - | stationElevatorCarNumber: 4-4, 5-1<br>stationElevator: 4-3, 5-2 |
| 홍대입구 (K314, KR) | API 값 충돌 | - | stationElevatorCarNumber: 1-2, 4-4<br>stationElevator: 1-1, 3-2, 6-3, 8-4 |
| 가좌 (K315, KR) | API 값 충돌 | - | stationElevatorCarNumber: 1-1, 4-3, 4-4, 5-2<br>stationElevator: 4-3, 5-2 |
| 대곡 (K322, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 일산 (K326, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 운천 (K336, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 임진강 (K337, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 도라산 (K338, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 서울역 (P313, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |

### 승강장·문·이격거리 연결 확인 (15역)

| 역 | 확인할 내용 |
| --- | --- |
| 국수 (K132, KR) | 권장 문 이격거리 없음: 3:5-3, 4:5-3 |
| 아신(아세아연합신학대) (K133, KR) | 권장 문 이격거리 없음: 3:5-1, 4:5-1 |
| 양평 (K135, KR) | 권장 문 이격거리 없음: 7:1-2, 8:1-2 |
| 원덕(추읍산) (K136, KR) | 권장 문 이격거리 없음: 3:6-2, 4:6-2 |
| 용문 (K137, KR) | 권장 문 이격거리 없음: 5:6-2, 6:6-2 |
| 가좌 (K315, KR) | 권장 문 이격거리 없음: 3:5-2, 4:4-3 |
| 디지털미디어시티 (K316, KR) | 권장 문 이격거리 없음: 3:6-1, 4:3-4 |
| 능곡 (K321, KR) | 권장 문 이격거리 없음: 5:4-1, 6:4-1 |
| 백마 (K324, KR) | 권장 문 이격거리 없음: 3:5-4, 4:5-4 |
| 탄현 (K327, KR) | 권장 문 이격거리 없음: 3:4-3, 4:5-2 |
| 운정 (K329, KR) | 권장 문 이격거리 없음: 3:5-1, 4:5-1 |
| 월롱(서영대학교) (K333, KR) | 권장 문 이격거리 없음: 3:5-2, 4:5-2 |
| 문산 (K335, KR) | 승강장·차량·문·이격거리 연결 불가 |
| 운천 (K336, KR) | 승강장·차량·문·이격거리 연결 불가 |
| 신촌 (P314, KR) | 권장 문 이격거리 없음: 1:4-4, 2:1-1 |

## 경강선 · 수도권 확대 지원 전

- API 수집: 2026-09-21T00:57:47.297Z
- 대상 역: 12개

### 지상 엘리베이터 출구 충돌 (1역)

| 역 | API별 값 |
| --- | --- |
| 판교(판교테크노밸리) (K409, KR) | stationMovement: 1, 2, 3<br>stinElevatorMovement: 2, 3 |

### 방향별 차량·문 확인 (12역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 판교(판교테크노밸리) (K409, KR) | stationElevatorCarNumber 누락 | - | stationElevator: 0-4, 5-4 |
| 성남 (K410, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 이매 (K411, KR) | stationElevatorCarNumber 누락 | - | stationElevator: 1-1, 2-1, 2-2, 3-4, 4-4 |
| 삼동 (K412, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 경기광주 (K413, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 초월 (K414, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 곤지암 (K415, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 신둔도예촌 (K416, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 이천 (K417, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 부발 (K418, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 세종대왕릉 (K419, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 여주 (K420, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |

### 승강장·문·이격거리 연결 확인 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 서해선 · 수도권 확대 지원 전

- API 수집: 2026-09-21T00:57:53.523Z
- 대상 역: 21개

### 지상 엘리베이터 출구 충돌 (0역)

| 역 | API별 값 |
| --- | --- |
| 없음 | - |

### 방향별 차량·문 확인 (13역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 일산 (S07, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 풍산 (S08, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 백마 (S09, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 곡산 (S10, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 대곡 (S11, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 능곡 (S12, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 김포공항역 (S13, KR) | stationElevatorCarNumber 누락 | - | stationElevator: 3-4, 4-1 |
| 원종 (S14, KR) | stationElevatorCarNumber 누락 | - | stationElevator: 1-1, 6-4 |
| 부천종합운동장역 (S15, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 시흥대야 (S18, SW) | API 값 충돌 | - | stationElevatorCarNumber: 3-3, 3-4, 4-1<br>stationElevator: 3-3, 4-1 |
| 시흥능곡 (S23, SW) | API 값 충돌 | - | stationElevatorCarNumber: 3-1, 4-4<br>stationElevator: 3-2, 4-3 |
| 달미 (S24, SW) | API 값 충돌 | - | stationElevatorCarNumber: 3-3, 4-2<br>stationElevator: 3-2, 4-3 |
| 시우 (S27, SW) | API 값 충돌 | - | stationElevatorCarNumber: 3-3, 4-2<br>stationElevator: 3-4, 4-1 |

### 승강장·문·이격거리 연결 확인 (12역)

| 역 | 확인할 내용 |
| --- | --- |
| 소사 (S16, SW) | 권장 문 이격거리 없음: 2:3-3 |
| 소새울 (S17, SW) | 권장 문 이격거리 없음: 2:3-4 |
| 시흥대야 (S18, SW) | 권장 문 이격거리 없음: 1:3-3, 1:3-4 |
| 신천 (S19, SW) | 권장 문 이격거리 없음: 1:3-4, 2:3-4 |
| 신현 (S20, SW) | 권장 문 이격거리 없음: 2:3-4 |
| 시흥시청 (S22, SW) | 권장 문 이격거리 없음: 2:4-3 |
| 시흥능곡 (S23, SW) | 권장 문 이격거리 없음: 2:4-4 |
| 달미 (S24, SW) | 권장 문 이격거리 없음: 1:3-3 |
| 선부 (S25, SW) | 권장 문 이격거리 없음: 1:3-4, 2:3-4 |
| 초지 (S26, SW) | 권장 문 이격거리 없음: 1:4-4, 2:2-3, 2:4-4 |
| 시우 (S27, SW) | 권장 문 이격거리 없음: 1:3-3 |
| 원시 (S28, SW) | 권장 문 이격거리 없음: 1:3-4, 2:3-4 |

## 우이신설선 · 수도권 확대 지원 전

- API 수집: 2026-09-21T00:58:27.310Z
- 대상 역: 13개

### 지상 엘리베이터 출구 충돌 (0역)

| 역 | API별 값 |
| --- | --- |
| 없음 | - |

### 방향별 차량·문 확인 (13역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 북한산우이 (S110, UI) | stationElevatorCarNumber 누락 | - | stationElevator: 1-2, 2-1 |
| 솔밭공원 (S111, UI) | stationElevatorCarNumber 누락 | - | stationElevator: 1-1, 2-2 |
| 4.19민주묘지 (S112, UI) | stationElevatorCarNumber 누락 | - | stationElevator: 1-1, 2-2 |
| 가오리 (S113, UI) | stationElevatorCarNumber 누락 | - | stationElevator: 1-1, 2-2 |
| 화계 (S114, UI) | stationElevatorCarNumber 누락 | - | stationElevator: 1-1, 2-2 |
| 삼양 (S115, UI) | stationElevatorCarNumber 누락 | - | stationElevator: 1-1, 2-2 |
| 삼양사거리 (S116, UI) | stationElevatorCarNumber 누락 | - | stationElevator: 1-1, 2-2 |
| 솔샘 (S117, UI) | stationElevatorCarNumber 누락 | - | stationElevator: 1-1, 2-2 |
| 북한산보국문 (S118, UI) | stationElevatorCarNumber 누락 | - | stationElevator: 1-1, 2-2 |
| 정릉 (S119, UI) | stationElevatorCarNumber 누락 | - | stationElevator: 1-1, 2-2 |
| 성신여대입구 (S120, UI) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 보문 (S121, UI) | stationElevatorCarNumber 누락 | - | stationElevator: 1-1 |
| 신설동 (S122, UI) | stationElevatorCarNumber 누락 | - | stationElevator: 1-1, 2-2 |

### 승강장·문·이격거리 연결 확인 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 의정부경전철 · 수도권 확대 지원 전

- API 수집: 2026-09-21T00:58:52.607Z
- 대상 역: 15개

### 지상 엘리베이터 출구 충돌 (0역)

| 역 | API별 값 |
| --- | --- |
| 없음 | - |

### 방향별 차량·문 확인 (0역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 없음 | - | - | - |

### 승강장·문·이격거리 연결 확인 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |
