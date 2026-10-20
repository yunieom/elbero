# 에버라인 API 정보 차이 감사

- 수집 시각: 2026-10-20T07:30:33.745Z
- 대상: 15개 역
- 차이가 기록된 역: 15개
- 차이 항목: 47건
- 판정 원칙: 어떤 API가 맞는지 결정하지 않고 API별 반환 값만 병기한다.
- 상세 응답: [everline-latest.json](../../data/research/line-sync/everline-latest.json)

## 비교 기준

- 지상 출구: 네 API에서 추출한 출구 번호 집합이 다르면 기록한다.
- 운행 층: KRIC 시설 현황과 서울교통공사 현황의 층 구간 집합이 다르면 기록한다.
- 차량·문: 세 API의 차량-문 번호 집합이 다르면 기록한다.
- 승강장·이격거리: 승강장, 인접 차량·문, 문별 이격거리 레코드가 연결되지 않으면 기록한다.
- 빈 값은 `없음`으로 표시하며, 누락인지 실제 시설 부재인지 판정하지 않는다.
- `값 차이`와 `API 값 없음`은 별도 유형으로 표시한다.

## API별 역 데이터 제공 범위

| API | 값이 있는 역 | 값이 없는 역 | 응답 행 |
| --- | ---: | ---: | ---: |
| stationMovement | 15 | 0 | 210 |
| stinElevatorMovement | 15 | 0 | 224 |
| stationElevator | 15 | 0 | 50 |
| stationElevatorCarNumber | 15 | 0 | 32 |
| stationStairCarNumber | 0 | 15 | 0 |
| stPlf | 15 | 0 | 30 |
| stationPlatformTrainDistance | 15 | 0 | 58 |
| SeoulMetroFaciInfo | 0 | 15 | 0 |

> 서울교통공사 승강기 가동현황 API가 이 노선의 역을 반환하지 않았다. 이 빈 값은 정답 오류가 아니라 API 제공 범위 차이로 기록한다.

## 승강장 이격거리

| 구간 | 등급 | 의미 |
| --- | --- | --- |
| 0cm 이상~10cm 이하 | `green` | 안전 |
| 10cm 초과~15cm 이하 | `yellow` | 유의 |
| 15cm 초과 | `red` | 추천하지 않음 |

전체 58건: green 58, yellow 0, red 0, 값 없음 0.

## 권장 차량·문 선택 우선순위

- `stationElevator`에 차량·문이 있으면 이 값을 우선한다.
- `stationElevator`에 차량·문이 없을 때만 `stationElevatorCarNumber`를 사용한다.
- 두 API 모두 차량·문이 없을 때만 사용자 확인 대상으로 남긴다.

- stationElevator 선택: 0역
- stationElevatorCarNumber 대체: 15역
- 두 API 모두 없음: 0역

### 우선순위로 선택한 권장 문·이격거리 (15역)

| 역 | 우선 API | 권장 문·승강장·이격거리 |
| --- | --- | --- |
| 기흥(백남준아트센터) (Y110, EV) | stationElevatorCarNumber | 1번 승강장 · 1-1 → 1번 승강장 6.4cm green<br>2번 승강장 · 1-2 → 2번 승강장 6.5cm green<br>3번 승강장 · 1-2 → 이격거리 없음<br>4번 승강장 · 1-1 → 이격거리 없음 |
| 강남대 (Y111, EV) | stationElevatorCarNumber | 1번 승강장 · 1-1 → 1번 승강장 7.4cm green<br>2번 승강장 · 1-2 → 2번 승강장 6.6cm green |
| 지석 (Y112, EV) | stationElevatorCarNumber | 1번 승강장 · 1-1 → 1번 승강장 5.6cm green<br>2번 승강장 · 1-2 → 2번 승강장 6.1cm green |
| 어정 (Y113, EV) | stationElevatorCarNumber | 1번 승강장 · 1-1 → 1번 승강장 6.1cm green<br>2번 승강장 · 1-2 → 2번 승강장 5.6cm green |
| 동백 (Y114, EV) | stationElevatorCarNumber | 1번 승강장 · 1-1 → 1번 승강장 5.7cm green<br>2번 승강장 · 1-2 → 2번 승강장 5.2cm green |
| 초당 (Y115, EV) | stationElevatorCarNumber | 1번 승강장 · 1-1 → 1번 승강장 6.7cm green<br>2번 승강장 · 1-2 → 2번 승강장 6.3cm green |
| 삼가 (Y116, EV) | stationElevatorCarNumber | 1번 승강장 · 1-1 → 1번 승강장 7.2cm green<br>2번 승강장 · 1-2 → 2번 승강장 6.8cm green |
| 시청.용인대 (Y117, EV) | stationElevatorCarNumber | 1번 승강장 · 1-1 → 1번 승강장 5.3cm green<br>2번 승강장 · 1-2 → 2번 승강장 5.9cm green |
| 명지대 (Y118, EV) | stationElevatorCarNumber | 1번 승강장 · 1-1 → 1번 승강장 5.7cm green<br>2번 승강장 · 1-2 → 2번 승강장 5.3cm green |
| 김량장 (Y119, EV) | stationElevatorCarNumber | 1번 승강장 · 1-1 → 1번 승강장 6.8cm green<br>2번 승강장 · 1-2 → 2번 승강장 7cm green |
| 용인중앙시장(용인예술과학대) (Y120, EV) | stationElevatorCarNumber | 1번 승강장 · 1-1 → 1번 승강장 5.2cm green<br>2번 승강장 · 1-2 → 2번 승강장 5.1cm green |
| 고진 (Y121, EV) | stationElevatorCarNumber | 1번 승강장 · 1-1 → 1번 승강장 7.4cm green<br>2번 승강장 · 1-2 → 2번 승강장 6.4cm green |
| 보평 (Y122, EV) | stationElevatorCarNumber | 1번 승강장 · 1-1 → 1번 승강장 7.6cm green<br>2번 승강장 · 1-2 → 2번 승강장 6.8cm green |
| 둔전 (Y123, EV) | stationElevatorCarNumber | 1번 승강장 · 1-1 → 1번 승강장 5.7cm green<br>2번 승강장 · 1-2 → 2번 승강장 5.4cm green |
| 전대.에버랜드 (Y124, EV) | stationElevatorCarNumber | 1번 승강장 · 1-2 → 1번 승강장 6.2cm green<br>2번 승강장 · 1-1 → 이격거리 없음 |

### 두 API 모두 차량·문이 없는 역 (0역)

| 역 | 상태 |
| --- | --- |
| 없음 | - |

### 권장 문 이격거리 연결 확인 (3건)

| 역 | 우선 API | 권장 문 | 승강장 | 상태 |
| --- | --- | --- | --- | --- |
| 기흥(백남준아트센터) (Y110, EV) | stationElevatorCarNumber | 1-2 | 3 | 이격거리 레코드 없음 |
| 기흥(백남준아트센터) (Y110, EV) | stationElevatorCarNumber | 1-1 | 4 | 이격거리 레코드 없음 |
| 전대.에버랜드 (Y124, EV) | stationElevatorCarNumber | 1-1 | 2 | 이격거리 레코드 없음 |

## 지상 엘리베이터 출구 번호 (15역)

| 역 | 구분 | SeoulMetroFaciInfo | stationElevator | stationMovement | stinElevatorMovement |
| --- | --- | --- | --- | --- | --- |
| 기흥(백남준아트센터) (Y110, EV) | 값 차이 + API 값 없음 | 없음 | `8`, `9` | `8` | `8` |
| 강남대 (Y111, EV) | 값 차이 + API 값 없음 | 없음 | `1`, `2`, `3` | `2`, `3` | `2`, `3` |
| 지석 (Y112, EV) | 값 차이 + API 값 없음 | 없음 | `1`, `2`, `3`, `4` | `2`, `4` | `2`, `4` |
| 어정 (Y113, EV) | 값 차이 + API 값 없음 | 없음 | `1`, `2` | `1` | `1` |
| 동백 (Y114, EV) | 값 차이 + API 값 없음 | 없음 | `1`, `2`, `3` | `2` | `2` |
| 초당 (Y115, EV) | 값 차이 + API 값 없음 | 없음 | `1`, `2` | `1` | `1` |
| 삼가 (Y116, EV) | 값 차이 + API 값 없음 | 없음 | `1`, `3` | `3` | `3` |
| 시청.용인대 (Y117, EV) | API 값 없음 | 없음 | `1` | `1` | `1` |
| 명지대 (Y118, EV) | 값 차이 + API 값 없음 | 없음 | `1`, `2` | `2` | `2` |
| 김량장 (Y119, EV) | 값 차이 + API 값 없음 | 없음 | `1`, `2` | `2` | `2` |
| 용인중앙시장(용인예술과학대) (Y120, EV) | 값 차이 + API 값 없음 | 없음 | `1`, `2`, `3` | `2` | `2` |
| 고진 (Y121, EV) | API 값 없음 | 없음 | `1` | `1` | `1` |
| 보평 (Y122, EV) | 값 차이 + API 값 없음 | 없음 | `1`, `2`, `3` | `1`, `2` | `1`, `2` |
| 둔전 (Y123, EV) | 값 차이 + API 값 없음 | 없음 | `1`, `2` | `2` | `2` |
| 전대.에버랜드 (Y124, EV) | 값 차이 + API 값 없음 | 없음 | `1`, `2`, `3`, `4` | `2`, `4` | `2`, `4` |

## 엘리베이터 운행 층 구간 (15역)

| 역 | 구분 | SeoulMetroFaciInfo | stationElevator |
| --- | --- | --- | --- |
| 기흥(백남준아트센터) (Y110, EV) | API 값 없음 | 없음 | `1F↔2F`, `2F↔3F`, `2F↔B1` |
| 강남대 (Y111, EV) | API 값 없음 | 없음 | `1F↔2F` |
| 지석 (Y112, EV) | API 값 없음 | 없음 | `1F↔2F`, `2F↔3F` |
| 어정 (Y113, EV) | API 값 없음 | 없음 | `1F↔2F`, `2F↔3F` |
| 동백 (Y114, EV) | API 값 없음 | 없음 | `1F↔2F`, `2F↔3F` |
| 초당 (Y115, EV) | API 값 없음 | 없음 | `2F↔3F` |
| 삼가 (Y116, EV) | API 값 없음 | 없음 | `1F↔2F`, `2F↔4F` |
| 시청.용인대 (Y117, EV) | API 값 없음 | 없음 | `1F↔2F`, `2F↔3F` |
| 명지대 (Y118, EV) | API 값 없음 | 없음 | `1F↔2F`, `2F↔3F` |
| 김량장 (Y119, EV) | API 값 없음 | 없음 | `1F↔2F`, `2F↔3F` |
| 용인중앙시장(용인예술과학대) (Y120, EV) | API 값 없음 | 없음 | `1F↔2F`, `2F↔3F` |
| 고진 (Y121, EV) | API 값 없음 | 없음 | `1F↔2F`, `2F↔3F` |
| 보평 (Y122, EV) | API 값 없음 | 없음 | `1F↔2F`, `2F↔3F` |
| 둔전 (Y123, EV) | API 값 없음 | 없음 | `1F↔2F`, `2F↔3F` |
| 전대.에버랜드 (Y124, EV) | API 값 없음 | 없음 | `1F↔2F` |

## 승강기 인접 차량·문 (15역)

| 역 | 구분 | SeoulMetroFaciInfo | stationElevator | stationElevatorCarNumber |
| --- | --- | --- | --- | --- |
| 기흥(백남준아트센터) (Y110, EV) | API 값 없음 | 없음 | 없음 | `1-1`, `1-2` |
| 강남대 (Y111, EV) | API 값 없음 | 없음 | 없음 | `1-1`, `1-2` |
| 지석 (Y112, EV) | API 값 없음 | 없음 | 없음 | `1-1`, `1-2` |
| 어정 (Y113, EV) | API 값 없음 | 없음 | 없음 | `1-1`, `1-2` |
| 동백 (Y114, EV) | API 값 없음 | 없음 | 없음 | `1-1`, `1-2` |
| 초당 (Y115, EV) | API 값 없음 | 없음 | 없음 | `1-1`, `1-2` |
| 삼가 (Y116, EV) | API 값 없음 | 없음 | 없음 | `1-1`, `1-2` |
| 시청.용인대 (Y117, EV) | API 값 없음 | 없음 | 없음 | `1-1`, `1-2` |
| 명지대 (Y118, EV) | API 값 없음 | 없음 | 없음 | `1-1`, `1-2` |
| 김량장 (Y119, EV) | API 값 없음 | 없음 | 없음 | `1-1`, `1-2` |
| 용인중앙시장(용인예술과학대) (Y120, EV) | API 값 없음 | 없음 | 없음 | `1-1`, `1-2` |
| 고진 (Y121, EV) | API 값 없음 | 없음 | 없음 | `1-1`, `1-2` |
| 보평 (Y122, EV) | API 값 없음 | 없음 | 없음 | `1-1`, `1-2` |
| 둔전 (Y123, EV) | API 값 없음 | 없음 | 없음 | `1-1`, `1-2` |
| 전대.에버랜드 (Y124, EV) | API 값 없음 | 없음 | 없음 | `1-1`, `1-2` |

## 승강장·인접 문·이격거리 연결 (2역)

| 역 | 구분 | adjacentCarsMissingGap | stationElevatorCarNumber | stationPlatformTrainDistance | stPlf |
| --- | --- | --- | --- | --- | --- |
| 기흥(백남준아트센터) (Y110, EV) | 연결 레코드 없음 | `3:1-2`, `4:1-1` | `1`, `2`, `3`, `4` | `1`, `2` | `1`, `2` |
| 전대.에버랜드 (Y124, EV) | 연결 레코드 없음 | `2:1-1` | `1`, `2` | `1` | `1`, `2` |

## 지원 노선 확대

동일한 수집기에서 `--line 1`부터 `--line 9` 및 등록된 수도권 노선 식별자를 실행할 수 있다. 이번 결과는 에버라인만 포함한다.
