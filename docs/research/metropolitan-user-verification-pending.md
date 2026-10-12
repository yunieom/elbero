# 수도권 전철 사용자 검증 대기 목록

- 생성일: 2026-10-12
- 근거: `data/research/line-sync/*-latest.json`에 저장된 KRIC·서울교통공사 API 응답
- 1호선 상태: **경로 엔진 지원 대상**. 현재 어댑터 연결 전이며, 아래 검증 항목을 원본 데이터로 확정해야 한다.
- 이미 반영 완료한 2·3·5·7호선은 상세 중복 목록에서 제외한다. 4호선의 남은 1건은 [지원 노선 검증 목록](supported-lines-user-verification-pending.md)에 유지한다.

## 판정 원칙

- 다른 운영기관 API가 해당 역을 반환하지 않는 것만으로는 검증 대상으로 잡지 않는다.
- 출처별 실제 값이 다를 때, `stationElevatorCarNumber`가 비어 방향별 차량·문을 정할 수 없을 때, 선택 문과 이격거리 레코드가 연결되지 않을 때만 기록한다.
- 운행 층은 기존 정책대로 `stationElevator`를 따르므로 별도 사용자 검증에서 제외한다.
- 저장된 응답의 수집일이 서로 다르므로 구현 직전 해당 노선만 재수집한다. 같은 전체 감사를 반복하지 않는다.

## 전체 노선 요약

| 노선 | 상태 | API 수집일 | 출구 충돌 | 차량·문 확인 | 이격거리 연결 | 이격거리 값 없음 |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| 1호선 | 경로 엔진 지원 대상 | 2026-09-18 | 46 | 24 | 29 | 40 |
| 2호선 | 반영 완료 | 2026-10-01 | 0 | 0 | 0 | 0 |
| 3호선 | 반영 완료 | 2026-10-01 | 0 | 0 | 0 | 0 |
| 4호선 | 반영 완료 | 2026-10-01 | 0 | 0 | 1 | 0 |
| 5호선 | 반영 완료 | 2026-10-01 | 0 | 0 | 0 | 0 |
| 6호선 | 경로 엔진 지원 대상 | 2026-09-18 | 11 | 30 | 6 | 0 |
| 7호선 | 반영 완료 | 2026-10-01 | 0 | 0 | 0 | 0 |
| 8호선 | 경로 엔진 지원 대상 | 2026-09-18 | 13 | 11 | 0 | 144 |
| 9호선 | 경로 엔진 지원 대상 | 2026-09-18 | 17 | 25 | 0 | 0 |
| 공항철도 | 후속 지원 대상 | 2026-09-18 | 4 | 2 | 2 | 60 |
| 인천 1호선 | 후속 지원 대상 | 2026-09-20 | 14 | 20 | 3 | 0 |
| 인천 2호선 | 후속 지원 대상 | 2026-09-21 | 11 | 10 | 0 | 0 |
| 신분당선 | 후속 지원 대상 | 2026-09-21 | 10 | 11 | 0 | 0 |
| 에버라인 | 후속 지원 대상 | 2026-09-21 | 13 | 0 | 2 | 0 |
| 김포골드라인 | 후속 지원 대상 | 2026-09-21 | 4 | 0 | 0 | 0 |
| GTX-A | 후속 지원 대상 | 2026-09-21 | 2 | 5 | 0 | 0 |
| 인천공항 자기부상철도 | 후속 지원 대상 | 2026-09-21 | 1 | 6 | 0 | 0 |
| 수인분당선 | 후속 지원 대상 | 2026-09-21 | 30 | 35 | 6 | 816 |
| 경춘선 | 후속 지원 대상 | 2026-09-21 | 3 | 1 | 6 | 128 |
| 경의중앙선 | 후속 지원 대상 | 2026-09-21 | 17 | 15 | 15 | 0 |
| 경강선 | 후속 지원 대상 | 2026-09-21 | 4 | 12 | 0 | 0 |
| 서해선 | 후속 지원 대상 | 2026-09-21 | 8 | 13 | 12 | 0 |
| 신림선 | 후속 지원 대상 | 2026-09-21 | 0 | 0 | 0 | 0 |
| 우이신설선 | 후속 지원 대상 | 2026-09-21 | 2 | 13 | 0 | 0 |
| 의정부경전철 | 후속 지원 대상 | 2026-09-21 | 0 | 0 | 0 | 0 |

## 1호선

- API 수집: 2026-09-18T09:13:36.285Z
- 대상 역: 102개
- 상태: 경로 엔진 지원 대상으로, 데이터 확정과 어댑터 연결이 필요함

### 지상 엘리베이터 출구 충돌 (46역)

| 역 | API별 값 |
| --- | --- |
| 전곡 (100-2, KR) | stinElevatorMovement: 1, 3<br>stationElevator: 1 |
| 연천 (100-3, KR) | stinElevatorMovement: 2, 3, 4<br>stationElevator: 1, 2, 3, 4, 5-1 |
| 동두천중앙 (0103, KR) | stationMovement: 1, 2, 3, 4<br>stinElevatorMovement: 1, 2, 3, 4<br>stationElevator: 3, 4 |
| 녹양 (0108, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 2 |
| 의정부 (0110, KR) | stationMovement: 1, 3, 4, 6, 7<br>stinElevatorMovement: 1, 3, 4, 6, 7<br>stationElevator: 1, 2, 3, 4, 5, 6, 7, 8 |
| 회룡 (0111, KR) | stationMovement: 1, 2, 3, 5<br>stinElevatorMovement: 1, 2, 3, 5<br>stationElevator: 3, 5 |
| 망월사 (0112, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 1, 2, 3, 4, 6 |
| 광운대 (0119, KR) | stationMovement: 1, 2, 3<br>stinElevatorMovement: 1, 2, 3<br>stationElevator: 2 |
| 석계 (0120, KR) | stationMovement: 1<br>stinElevatorMovement: 1<br>stationElevator: 1, 6 |
| 신이문 (0121, KR) | stationMovement: 1, 2, 3, 4<br>stinElevatorMovement: 1, 2, 3, 4<br>stationElevator: 1, 2, 3, 5 |
| 용산 (0135, KR) | stationMovement: 1, 2, 3<br>stinElevatorMovement: 1, 2, 3<br>stationElevator: 1 |
| 노량진 (0136, KR) | stationMovement: 6, 8, 9<br>stinElevatorMovement: 6, 8, 9<br>stationElevator: 2, 9 |
| 대방 (0137, KR) | stationMovement: 5, 6<br>stinElevatorMovement: 5, 6<br>stationElevator: 5 |
| 신도림 (0140, KR) | stationMovement: 4<br>stinElevatorMovement: 4<br>stationElevator: 4, 6 |
| 오류동 (0144, KR) | stationMovement: 2, 3<br>stinElevatorMovement: 2, 3<br>stationElevator: 1, 2, 3 |
| 온수 (0145, KR) | stationMovement: 1, 8<br>stinElevatorMovement: 1, 8<br>stationElevator: 1, 3, 7, 8 |
| 소사 (0147, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 1 |
| 송내 (0150, KR) | stationMovement: 2, 3<br>stinElevatorMovement: 2, 3<br>stationElevator: 1, 2, 3 |
| 부평 (0152, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 1, 2, 3 |
| 동암 (0154, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 1 |
| 주안 (0156, KR) | stationMovement: 2, 4, 5<br>stinElevatorMovement: 2, 4, 5<br>stationElevator: 1, 4 |
| 도화 (0157, KR) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 1, 2, 3, 4 |
| 도원 (0159, KR) | stationMovement: 1, 2, 3<br>stinElevatorMovement: 1, 2, 3<br>stationElevator: 4-1, 7-4 |
| 동인천 (0160, KR) | stationMovement: 1<br>stinElevatorMovement: 1<br>stationElevator: 1, 2, 3, 4 |
| 가산디지털단지 (P142, KR) | stationMovement: 1, 7<br>stinElevatorMovement: 1, 7<br>stationElevator: 2, 3, 11 |
| 독산 (P143, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 1, 2, 3 |
| 광명 (P144-1, KR) | stationMovement: 1, 2, 5, 6<br>stinElevatorMovement: 1, 2, 5, 6<br>stationElevator: 1, 2, 3, 4, 5, 6, 8 |
| 안양 (P147, KR) | stationMovement: 1, 3<br>stinElevatorMovement: 1, 3<br>stationElevator: 1 |
| 금정 (P149, KR) | stationMovement: 2, 5, 8<br>stinElevatorMovement: 2, 5, 8<br>stationElevator: 1, 2 |
| 당정 (P151, KR) | stationMovement: 2, 3<br>stinElevatorMovement: 2, 3<br>stationElevator: 1, 2, 3 |
| 의왕 (P152, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 2 |
| 화서 (P154, KR) | stationMovement: 4, 6<br>stinElevatorMovement: 4, 6<br>stationElevator: 1, 2, 4, 5, 6 |
| 수원 (P155, KR) | stationMovement: 5, 7, 10<br>stinElevatorMovement: 5, 7, 10<br>stationElevator: 6 |
| 서동탄 (P157-1, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 1 |
| 송탄 (P162, KR) | stationMovement: 3, 6<br>stinElevatorMovement: 3, 6<br>stationElevator: 2, 3, 6 |
| 서정리 (P163, KR) | stationMovement: 1, 3<br>stinElevatorMovement: 1, 3<br>stationElevator: 1, 2, 3 |
| 평택지제 (P164, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 1 |
| 신창(순천향대) (P177, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 2 |
| 서울역 (0150, S1) | stationMovement: 1, 2, 3, 4<br>stinElevatorMovement: 1, 2, 3, 4<br>stationElevator: 2, 3, 4<br>SeoulMetroFaciInfo: 2, 3, 4 |
| 시청 (0151, S1) | stationMovement: 2, 3<br>stinElevatorMovement: 2, 3<br>stationElevator: 1, 2<br>SeoulMetroFaciInfo: 1-2, 2 |
| 종로3가 (0153, S1) | stationMovement: 2-1, 12<br>stinElevatorMovement: 2-1, 12<br>stationElevator: 12, 13<br>SeoulMetroFaciInfo: 12-13, 13 |
| 종로5가 (0154, S1) | stationMovement: 8<br>stinElevatorMovement: 8<br>SeoulMetroFaciInfo: 9 |
| 동대문 (0155, S1) | stationMovement: 1, 6<br>stinElevatorMovement: 1, 6<br>stationElevator: 6<br>SeoulMetroFaciInfo: 6 |
| 신설동 (0156, S1) | stationMovement: 3, 5<br>stinElevatorMovement: 3, 5<br>stationElevator: 1, 2, 3, 4, 5<br>SeoulMetroFaciInfo: 1, 3, 5, 12 |
| 청량리(서울시립대입구) (0158, S1) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 2, 6<br>SeoulMetroFaciInfo: 2, 6 |
| 동묘앞 (0159, S1) | stationMovement: 2, 3<br>stinElevatorMovement: 2, 3<br>stationElevator: 1, 3, 10<br>SeoulMetroFaciInfo: 1-10, 3, 10 |

### 방향별 차량·문 확인 (24역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 망월사 (0112, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 도봉산 (0113, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 도봉 (0114, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 방학 (0115, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 창동 (0116, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 광운대 (0119, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 외대앞 (0122, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 남영 (0134, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 노량진 (0136, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 신길 (0138, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 구로 (0141, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 구일 (0142, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 오류동 (0144, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 소사 (0147, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 석수 (P145, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 성균관대 (P153, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 화서 (P154, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 세류 (P156, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 오산대 (P159, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 탕정 (P173, KR) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 서울역 (0150, S1) | API 값 충돌 | - | stationElevatorCarNumber: 5-1, 7-1<br>stationElevator: 5-1<br>SeoulMetroFaciInfo: 5-1, 6-4 |
| 종로3가 (0153, S1) | API 값 충돌 | - | stationElevatorCarNumber: 5-1, 6-4<br>stationElevator: 5-1, 6-4<br>SeoulMetroFaciInfo: 4-4, 5-1, 6-4 |
| 동대문 (0155, S1) | API 값 충돌 | - | stationElevatorCarNumber: 2-2, 10-4<br>stationElevator: 2-1, 10-4<br>SeoulMetroFaciInfo: 2-1, 10-4 |
| 동묘앞 (0159, S1) | API 값 충돌 | - | stationElevatorCarNumber: 1-2, 4-3, 6-1, 6-4, 7-2, 10-3<br>stationElevator: 1-2, 4-8, 7-3, 10-3<br>SeoulMetroFaciInfo: 1-2, 4-3, 4-8, 6-2, 7-3, 10-3 |

### 승강장·문·이격거리 연결 확인 (29역)

| 역 | 확인할 내용 |
| --- | --- |
| 동두천 (0101, KR) | 권장 문 이격거리 없음: 3:6-4, 4:6-4 |
| 양주 (0107, KR) | 권장 문 이격거리 없음: 3:6-2 |
| 용산 (0135, KR) | 권장 문 이격거리 없음: 3:7-2, 4:4-3 |
| 대방 (0137, KR) | 권장 문 이격거리 없음: 3:6-1, 4:5-4 |
| 영등포 (0139, KR) | 권장 문 이격거리 없음: 3:4-1, 3:7-1, 4:4-1, 4:6-4, 5:4-1, 5:6-4 |
| 신도림 (0140, KR) | 권장 문 이격거리 없음: 3:7-2, 3:8-4, 3:9-1, 3:10-1, 4:3-1, 4:4-2, 4:4-4, 4:6-1 |
| 개봉 (0143, KR) | 권장 문 이격거리 없음: 3:6-2, 4:6-2 |
| 온수 (0145, KR) | 권장 문 이격거리 없음: 3:7-3, 4:7-3 |
| 역곡 (0146, KR) | 권장 문 이격거리 없음: 3:4-4, 4:4-4 |
| 부천 (0148, KR) | 권장 문 이격거리 없음: 3:3-4, 3:9-3, 4:3-4, 4:9-3 |
| 송내 (0150, KR) | 권장 문 이격거리 없음: 3:7-3, 4:7-3 |
| 부평 (0152, KR) | 권장 문 이격거리 없음: 3:1-1, 4:1-1 |
| 백운 (0153, KR) | 권장 문 이격거리 없음: 3:6-3, 4:6-3 |
| 동암 (0154, KR) | 권장 문 이격거리 없음: 3:4-1, 4:4-1 |
| 간석 (0155, KR) | 권장 문 이격거리 없음: 3:5-1, 4:5-1 |
| 주안 (0156, KR) | 권장 문 이격거리 없음: 3:6-2, 3:9-4, 4:6-2, 4:9-4 |
| 제물포 (0158, KR) | 권장 문 이격거리 없음: 3:4-2, 4:4-2 |
| 동인천 (0160, KR) | 권장 문 이격거리 없음: 3:6-1, 4:6-1 |
| 광명 (P144-1, KR) | 권장 문 이격거리 없음: 1:1-4, 2:4-4 |
| 안양 (P147, KR) | 권장 문 이격거리 없음: 3:7-2, 4:7-2 |
| 군포 (P150, KR) | 권장 문 이격거리 없음: 3:2-3, 4:2-3 |
| 수원 (P155, KR) | 권장 문 이격거리 없음: 8:6-4, 9:7-2 |
| 병점 (P157, KR) | 권장 문 이격거리 없음: 3:6-3, 4:6-3 |
| 오산 (P160, KR) | 권장 문 이격거리 없음: 7:1-1, 8:1-1 |
| 평택 (P165, KR) | 권장 문 이격거리 없음: 7:6-3, 8:6-3 |
| 성환 (P166, KR) | 권장 문 이격거리 없음: 6:7-3, 8:7-3 |
| 직산 (P167, KR) | 권장 문 이격거리 없음: 3:8-1, 4:8-1 |
| 두정 (P168, KR) | 권장 문 이격거리 없음: 3:2-1, 4:2-1 |
| 아산 (P172, KR) | 권장 문 이격거리 없음: 3:4-4, 4:6-4 |

## 6호선

- API 수집: 2026-09-18T09:14:16.096Z
- 대상 역: 39개
- 상태: 경로 엔진 지원 대상으로, 데이터 확정과 어댑터 연결이 필요함

### 지상 엘리베이터 출구 충돌 (11역)

| 역 | API별 값 |
| --- | --- |
| 새절(신사) (2617, S1) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1, 1-1<br>SeoulMetroFaciInfo: 1 |
| 합정 (2623, S1) | stationMovement: 5, 6<br>stinElevatorMovement: 5, 6<br>stationElevator: 6<br>SeoulMetroFaciInfo: 6 |
| 광흥창(서강) (2625, S1) | stationMovement: 1<br>stinElevatorMovement: 1<br>stationElevator: 1, 4<br>SeoulMetroFaciInfo: 1, 4 |
| 공덕 (2627, S1) | stationMovement: 2, 5<br>stinElevatorMovement: 2, 5<br>stationElevator: 5<br>SeoulMetroFaciInfo: 5 |
| 창신 (2638, S1) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 2, 3, 4<br>SeoulMetroFaciInfo: 2, 4 |
| 고려대(종암) (2641, S1) | stationMovement: 1, 4<br>stinElevatorMovement: 1, 4<br>stationElevator: 1, 3, 4<br>SeoulMetroFaciInfo: 1, 4 |
| 월곡(동덕여대) (2642, S1) | stationMovement: 1<br>stinElevatorMovement: 1<br>stationElevator: 1, 5<br>SeoulMetroFaciInfo: 5 |
| 석계 (2645, S1) | stationMovement: 4<br>stinElevatorMovement: 4<br>stationElevator: 1, 4<br>SeoulMetroFaciInfo: 1, 4 |
| 태릉입구 (2646, S1) | stationMovement: 8<br>stinElevatorMovement: 8<br>stationElevator: 6, 8<br>SeoulMetroFaciInfo: 6, 8 |
| 화랑대(서울여대입구) (2647, S1) | stationMovement: 1, 3, 6<br>stinElevatorMovement: 1, 3, 6<br>stationElevator: 1, 3, 7<br>SeoulMetroFaciInfo: 1, 3, 7 |
| 봉화산(서울의료원) (2648, S1) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 2, 4, 8-3<br>SeoulMetroFaciInfo: 2, 4 |

### 방향별 차량·문 확인 (30역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 응암 (2611, S1) | API 값 충돌 | - | stationElevatorCarNumber: 4-1, 5-4<br>stationElevator: 5-2<br>SeoulMetroFaciInfo: 4-2, 5-2 |
| 역촌 (2612, S1) | stationElevatorCarNumber 누락 | - | stationElevator: 4-2<br>SeoulMetroFaciInfo: 4-2 |
| 불광 (2613, S1) | API 값 충돌 | - | stationElevatorCarNumber: 4-1, 5-1<br>stationElevator: 2-3, 7-2<br>SeoulMetroFaciInfo: 4-1, 5-2 |
| 독바위 (2614, S1) | API 값 충돌 | - | stationElevatorCarNumber: 3-1<br>stationElevator: 3-2<br>SeoulMetroFaciInfo: 3-2 |
| 연신내 (2615, S1) | API 값 충돌 | - | stationElevatorCarNumber: 6-1<br>stationElevator: 6-2<br>SeoulMetroFaciInfo: 6-2 |
| 구산 (2616, S1) | stationElevatorCarNumber 누락 | - | SeoulMetroFaciInfo: 5-4 |
| 새절(신사) (2617, S1) | API 값 충돌 | - | stationElevatorCarNumber: 4-4<br>stationElevator: 5-4<br>SeoulMetroFaciInfo: 1-1, 4-4 |
| 증산(명지대앞) (2618, S1) | API 값 충돌 | - | stationElevatorCarNumber: 4-4, 5-1<br>stationElevator: 4-3, 5-1<br>SeoulMetroFaciInfo: 4-3, 5-1 |
| 디지털미디어시티 (2619, S1) | API 값 충돌 | - | stationElevatorCarNumber: 1-1, 8-4<br>stationElevator: 3-4, 8-4<br>SeoulMetroFaciInfo: 1-1, 8-4 |
| 월드컵경기장(성산) (2620, S1) | API 값 충돌 | - | stationElevatorCarNumber: 4-4, 5-1<br>stationElevator: 4-4<br>SeoulMetroFaciInfo: 4-4 |
| 마포구청 (2621, S1) | API 값 충돌 | - | stationElevatorCarNumber: 1-2, 8-2<br>stationElevator: 1-1, 8-4<br>SeoulMetroFaciInfo: 1-1, 8-4 |
| 망원 (2622, S1) | API 값 충돌 | - | stationElevatorCarNumber: 5-1, 5-2<br>stationElevator: 5-1<br>SeoulMetroFaciInfo: 5-1 |
| 합정 (2623, S1) | API 값 충돌 | - | stationElevatorCarNumber: 4-2, 5-2<br>stationElevator: 4-2, 6-2<br>SeoulMetroFaciInfo: 4-2, 5-1 |
| 광흥창(서강) (2625, S1) | API 값 충돌 | - | stationElevatorCarNumber: 1-1, 8-4<br>stationElevator: 1-2, 8-3<br>SeoulMetroFaciInfo: 1-2, 8-3 |
| 공덕 (2627, S1) | API 값 충돌 | - | stationElevatorCarNumber: 4-4<br>stationElevator: 4-4<br>SeoulMetroFaciInfo: 1-1, 4-4, 8-4 |
| 효창공원앞 (2628, S1) | API 값 충돌 | - | stationElevatorCarNumber: 4-1, 5-4<br>stationElevator: 4-2, 5-3<br>SeoulMetroFaciInfo: 4-2, 5-3 |
| 삼각지 (2629, S1) | API 값 충돌 | - | stationElevatorCarNumber: 1-1, 8-4<br>stationElevator: 1-1, 8-4<br>SeoulMetroFaciInfo: 1-1, 4-4, 6-1, 8-4 |
| 녹사평(용산구청) (2630, S1) | API 값 충돌 | - | stationElevatorCarNumber: 4-3, 5-2<br>stationElevator: 4-3, 5-1<br>SeoulMetroFaciInfo: 4-3, 5-1 |
| 이태원 (2631, S1) | API 값 충돌 | - | stationElevatorCarNumber: 3-2, 6-3<br>stationElevator: 3-1, 6-3<br>SeoulMetroFaciInfo: 3-1, 6-3 |
| 청구 (2635, S1) | API 값 충돌 | - | stationElevatorCarNumber: 6-1<br>stationElevator: 4-1, 5-3<br>SeoulMetroFaciInfo: 4-1, 5-3, 6-2 |
| 동묘앞 (2637, S1) | API 값 충돌 | - | stationElevatorCarNumber: 3-4, 8-4<br>stationElevator: 1-1, 4-2, 5-3, 8-4<br>SeoulMetroFaciInfo: 1-1, 3-3, 6-2, 8-4 |
| 창신 (2638, S1) | API 값 충돌 | - | stationElevatorCarNumber: 3-4, 6-1<br>stationElevator: 4-2, 5-3<br>SeoulMetroFaciInfo: 4-2, 5-3 |
| 보문 (2639, S1) | API 값 충돌 | - | stationElevatorCarNumber: 4-4<br>stationElevator: 4-4, 5-1<br>SeoulMetroFaciInfo: 4-4, 5-1 |
| 고려대(종암) (2641, S1) | API 값 충돌 | - | stationElevatorCarNumber: 3-2, 6-1<br>stationElevator: 3-2, 6-2<br>SeoulMetroFaciInfo: 3-2, 6-2 |
| 상월곡(한국과학기술연구원) (2643, S1) | stationElevatorCarNumber 누락 | - | stationElevator: 1-4, 8-4<br>SeoulMetroFaciInfo: 1-4, 8-4 |
| 돌곶이 (2644, S1) | stationElevatorCarNumber 누락 | - | stationElevator: 4-4<br>SeoulMetroFaciInfo: 4-4 |
| 태릉입구 (2646, S1) | API 값 충돌 | - | stationElevatorCarNumber: 3-4, 5-4<br>stationElevator: 3-4, 5-3<br>SeoulMetroFaciInfo: 3-4, 5-3 |
| 화랑대(서울여대입구) (2647, S1) | API 값 충돌 | - | stationElevatorCarNumber: 4-2, 5-4<br>stationElevator: 4-1, 5-4<br>SeoulMetroFaciInfo: 4-1, 5-4 |
| 봉화산(서울의료원) (2648, S1) | stationElevatorCarNumber 누락 | - | SeoulMetroFaciInfo: 1-2, 8-3 |
| 신내 (2649, S1) | stationElevatorCarNumber 누락 | - | 후보 없음 |

### 승강장·문·이격거리 연결 확인 (6역)

| 역 | 확인할 내용 |
| --- | --- |
| 응암 (2611, S1) | 승강장·차량·문·이격거리 연결 불가 |
| 역촌 (2612, S1) | 승강장·차량·문·이격거리 연결 불가 |
| 불광 (2613, S1) | 권장 문 이격거리 없음: 2:4-1, 2:5-1 |
| 독바위 (2614, S1) | 권장 문 이격거리 없음: 2:3-1 |
| 연신내 (2615, S1) | 승강장·차량·문·이격거리 연결 불가 |
| 구산 (2616, S1) | 승강장·차량·문·이격거리 연결 불가 |

## 8호선

- API 수집: 2026-09-18T09:14:31.475Z
- 대상 역: 24개
- 상태: 경로 엔진 지원 대상으로, 데이터 확정과 어댑터 연결이 필요함

### 지상 엘리베이터 출구 충돌 (13역)

| 역 | API별 값 |
| --- | --- |
| 구리 (2805, GU) | stationMovement: 7<br>stinElevatorMovement: 7<br>stationElevator: 4, 7 |
| 동구릉 (2807, GU) | stationMovement: 2, 5<br>stinElevatorMovement: 2, 5<br>stationElevator: 2, 3, 5 |
| 별내 (2804, NU) | stationMovement: 4, 5, 6<br>stinElevatorMovement: 4, 5, 6<br>stationElevator: 4, 5, 7 |
| 다산 (2806, NU) | stationMovement: 1, 2, 3, 4<br>stinElevatorMovement: 1, 3, 4<br>stationElevator: 1, 3, 4, 5, 6 |
| 암사 (2811, S1) | stationMovement: 3<br>stinElevatorMovement: 3<br>stationElevator: 3, 4<br>SeoulMetroFaciInfo: 4 |
| 잠실(송파구청) (2815, S1) | stationMovement: 9, 10<br>stinElevatorMovement: 9, 10<br>stationElevator: 9<br>SeoulMetroFaciInfo: 9 |
| 석촌 (2816, S1) | stationMovement: 1, 5<br>stinElevatorMovement: 1, 5<br>stationElevator: 1<br>SeoulMetroFaciInfo: 1 |
| 송파 (2817, S1) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 1, 2, 4<br>SeoulMetroFaciInfo: 2, 4 |
| 가락시장 (2818, S1) | stationMovement: 1, 4, 7<br>stinElevatorMovement: 1, 4, 7<br>stationElevator: 1, 2, 3, 4<br>SeoulMetroFaciInfo: 2, 4 |
| 문정 (2819, S1) | stationMovement: 2, 3, 4<br>stinElevatorMovement: 2, 3, 4<br>stationElevator: 2, 4<br>SeoulMetroFaciInfo: 2, 4 |
| 장지 (2820, S1) | stationMovement: 1, 4<br>stinElevatorMovement: 1, 4<br>stationElevator: 1, 3<br>SeoulMetroFaciInfo: 1, 3 |
| 남한산성입구(성남법원.검찰청) (2823, S1) | stationMovement: 3<br>stinElevatorMovement: 3<br>stationElevator: 3, 4 |
| 남위례 (2828, S1) | stationMovement: 5<br>stinElevatorMovement: 5<br>stationElevator: 1, 5<br>SeoulMetroFaciInfo: 1, 5 |

### 방향별 차량·문 확인 (11역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 구리 (2805, GU) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 동구릉 (2807, GU) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 장자호수공원 (2808, GU) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 강동구청 (2813, S1) | API 값 충돌; 나머지 방향 확인 필요 | 몽촌토성: 3-3 | stationElevatorCarNumber: 3-2, 4-2<br>stationElevator: 3-2, 3-3, 4-2<br>SeoulMetroFaciInfo: 3-2, 3-3, 4-2 |
| 몽촌토성(평화의문) (2814, S1) | API 값 충돌; 나머지 방향 확인 필요 | 천호: 4-2 | stationElevatorCarNumber: 3-4, 4-1<br>stationElevator: 3-4<br>SeoulMetroFaciInfo: 3-4 |
| 석촌 (2816, S1) | API 값 충돌 | - | stationElevatorCarNumber: 3-4, 4-1<br>stationElevator: 3-4, 4-1<br>SeoulMetroFaciInfo: 3-4 |
| 가락시장 (2818, S1) | API 값 충돌 | - | stationElevatorCarNumber: 1-1, 2-3, 5-4, 6-4<br>stationElevator: 2-3, 5-4<br>SeoulMetroFaciInfo: 1-1, 2-3, 5-4, 6-4 |
| 복정 (2821, S1) | API 값 충돌 | - | stationElevatorCarNumber: 3-4<br>stationElevator: 3-4, 4-1<br>SeoulMetroFaciInfo: 3-4 |
| 산성 (2822, S1) | API 값 충돌 | - | stationElevatorCarNumber: 1-1, 6-1<br>stationElevator: 1-3, 6-2<br>SeoulMetroFaciInfo: 1-3, 6-2 |
| 남한산성입구(성남법원.검찰청) (2823, S1) | API 값 충돌 | - | stationElevatorCarNumber: 1-1, 3-1, 3-2, 6-1<br>stationElevator: 3-4<br>SeoulMetroFaciInfo: 3-4 |
| 남위례 (2828, S1) | API 값 충돌 | - | stationElevatorCarNumber: 3-4, 4-1<br>SeoulMetroFaciInfo: 3-4 |

### 승강장·문·이격거리 연결 확인 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 9호선

- API 수집: 2026-09-18T03:13:31.764Z
- 대상 역: 38개
- 상태: 경로 엔진 지원 대상으로, 데이터 확정과 어댑터 연결이 필요함

### 지상 엘리베이터 출구 충돌 (17역)

| 역 | API별 값 |
| --- | --- |
| 공항시장 (0903) | stationMovement: 1<br>stinElevatorMovement: 1<br>stationElevator: 1, 2 |
| 신방화 (0904) | stationMovement: 3, 7<br>stinElevatorMovement: 3, 7<br>stationElevator: 3, 7, 8 |
| 마곡나루 (0905) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1, 2 |
| 양천향교 (0906) | stationMovement: 3, 5<br>stinElevatorMovement: 3, 5<br>stationElevator: 3, 4, 5, 6 |
| 가양 (0907) | stationMovement: 4, 8<br>stinElevatorMovement: 4, 8<br>stationElevator: 4, 5, 8, 9 |
| 염창 (0910) | stationMovement: 1, 3<br>stinElevatorMovement: 1, 3<br>stationElevator: 1, 2, 3, 4 |
| 선유도 (0912) | stationMovement: 1, 8<br>stinElevatorMovement: 1, 8<br>stationElevator: 1, 2, 7, 8 |
| 당산 (0913) | stationMovement: 10, 13<br>stinElevatorMovement: 10, 13<br>stationElevator: 1, 10, 13 |
| 국회의사당 (0914) | stationMovement: 2, 5, 6<br>stinElevatorMovement: 2, 5, 6<br>stationElevator: 2, 3, 4, 5, 6 |
| 샛강 (0916) | stationMovement: 2, 3<br>stinElevatorMovement: 2, 3<br>stationElevator: 1, 2, 3 |
| 노량진 (0917) | stationMovement: 5, 8, 9<br>stinElevatorMovement: 5, 8, 9<br>stationElevator: 5, 6, 8 |
| 노들 (0918) | stationMovement: 1, 2, 3, 5<br>stinElevatorMovement: 1, 2, 3, 5<br>stationElevator: 1, 3, 4, 5 |
| 흑석(중앙대입구) (0919) | stationMovement: 2, 3<br>stinElevatorMovement: 2, 3<br>stationElevator: 1, 2, 3, 4 |
| 동작(현충원) (0920) | stationMovement: 1, 5, 7<br>stinElevatorMovement: 1, 5, 7<br>stationElevator: 4, 5, 7, 8, 9 |
| 구반포 (0921) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 2, 3 |
| 신반포 (0922) | stationMovement: 1, 4<br>stinElevatorMovement: 1, 4<br>stationElevator: 1, 2, 3, 4 |
| 신논현 (0925) | stationMovement: 2, 8<br>stinElevatorMovement: 2, 8<br>stationElevator: 1, 2, 8, 9 |

### 방향별 차량·문 확인 (25역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 개화 (0901) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 김포공항 (0902) | stationElevatorCarNumber 누락 | - | stationElevator: 1-1, 4-2 |
| 공항시장 (0903) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 신방화 (0904) | stationElevatorCarNumber 누락 | - | stationElevator: 3-1, 4-4 |
| 마곡나루 (0905) | stationElevatorCarNumber 누락 | - | stationElevator: 3-3, 4-2 |
| 양천향교 (0906) | stationElevatorCarNumber 누락 | - | stationElevator: 3-2, 4-4 |
| 가양 (0907) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 증미 (0908) | API 값 충돌 | - | stationElevatorCarNumber: 2-4, 3-1<br>stationElevator: 3-4 |
| 등촌 (0909) | stationElevatorCarNumber 누락 | - | stationElevator: 1-1, 6-4 |
| 염창 (0910) | stationElevatorCarNumber 누락 | - | stationElevator: 3-4, 4-1 |
| 신목동 (0911) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 선유도 (0912) | stationElevatorCarNumber 누락 | - | stationElevator: 3-4, 4-1 |
| 당산 (0913) | stationElevatorCarNumber 누락 | - | stationElevator: 6-4 |
| 국회의사당 (0914) | stationElevatorCarNumber 누락 | - | stationElevator: 5-3 |
| 여의도 (0915) | stationElevatorCarNumber 누락 | - | stationElevator: 1-1, 6-4 |
| 샛강 (0916) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 노량진 (0917) | stationElevatorCarNumber 누락 | - | stationElevator: 3-4, 4-1 |
| 노들 (0918) | stationElevatorCarNumber 누락 | - | stationElevator: 3-2, 4-4 |
| 흑석(중앙대입구) (0919) | API 값 충돌 | - | stationElevatorCarNumber: 2-2, 3-3<br>stationElevator: 3-3, 4-2 |
| 동작(현충원) (0920) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 구반포 (0921) | stationElevatorCarNumber 누락 | - | stationElevator: 2-1, 5-4 |
| 신반포 (0922) | stationElevatorCarNumber 누락 | - | stationElevator: 3-4 |
| 고속터미널 (0923) | stationElevatorCarNumber 누락 | - | stationElevator: 1-1, 4-4 |
| 사평 (0924) | stationElevatorCarNumber 누락 | - | stationElevator: 4-1, 4-2 |
| 신논현 (0925) | stationElevatorCarNumber 누락 | - | stationElevator: 3-4, 4-1 |

### 승강장·문·이격거리 연결 확인 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 공항철도

- API 수집: 2026-09-18T09:40:44.587Z
- 대상 역: 14개
- 상태: 수도권 확대 지원 전 데이터 검증 필요

### 지상 엘리베이터 출구 충돌 (4역)

| 역 | API별 값 |
| --- | --- |
| 홍대입구 (A03, AR) | stationMovement: 4, 7<br>stinElevatorMovement: 4, 7<br>stationElevator: 4 |
| 디지털미디어시티 (A04, AR) | stationMovement: 7, 9<br>stinElevatorMovement: 7, 9<br>stationElevator: 3, 7, 9 |
| 공항화물청사 (A09, AR) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1, 2 |
| 마곡나루 (A042, AR) | stationMovement: 4, 5<br>stinElevatorMovement: 4, 5<br>stationElevator: 3, 4, 5 |

### 방향별 차량·문 확인 (2역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 김포공항 (A05, AR) | API 값 충돌 | - | stationElevatorCarNumber: 2-1, 6-4<br>stationElevator: 2-1, 5-4 |
| 인천공항1터미널 (A10, AR) | API 값 충돌 | - | stationElevatorCarNumber: 2-3, 3-1, 6-4, 7-2<br>stationElevator: 2-3, 3-1 |

### 승강장·문·이격거리 연결 확인 (2역)

| 역 | 확인할 내용 |
| --- | --- |
| 디지털미디어시티 (A04, AR) | 권장 문 이격거리 없음: 3:4-3, 3:5-1, 4:4-4, 4:5-2 |
| 인천공항1터미널 (A10, AR) | 권장 문 이격거리 없음: 2:7-2 |

## 인천 1호선

- API 수집: 2026-09-20T11:07:19.407Z
- 대상 역: 33개
- 상태: 수도권 확대 지원 전 데이터 검증 필요

### 지상 엘리베이터 출구 충돌 (14역)

| 역 | API별 값 |
| --- | --- |
| 아라 (0109, IC) | stationMovement: 1, 5<br>stinElevatorMovement: 1, 5<br>stationElevator: 1, 2, 5, 6 |
| 박촌 (0112, IC) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 2, 3 |
| 작전 (0116, IC) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 2, 3 |
| 부평시장 (0119, IC) | stationMovement: 1<br>stinElevatorMovement: 1<br>stationElevator: 1, 3 |
| 부평 (0120, IC) | stationMovement: 6<br>stinElevatorMovement: 6<br>stationElevator: 4 |
| 선학 (0128, IC) | stationMovement: 4<br>stinElevatorMovement: 4<br>stationElevator: 3 |
| 신연수 (0129, IC) | stationMovement: 1<br>stinElevatorMovement: 1<br>stationElevator: 1, 4 |
| 원인재 (0130, IC) | stationMovement: 6<br>stinElevatorMovement: 6<br>stationElevator: 1, 6 |
| 동막 (0132, IC) | stationMovement: 1<br>stinElevatorMovement: 1<br>stationElevator: 1, 2, 3, 4 |
| 캠퍼스타운 (0133, IC) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1, 2, 3, 4 |
| 테크노파크 (0134, IC) | stationMovement: 3<br>stinElevatorMovement: 3<br>stationElevator: 2, 3 |
| 지식정보단지 (0135, IC) | stationMovement: 3<br>stinElevatorMovement: 3<br>stationElevator: 2, 3 |
| 국제업무지구 (0138, IC) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1, 2, 3, 5 |
| 송도달빛축제공원 (0139, IC) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 1, 2 |

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

## 인천 2호선

- API 수집: 2026-09-21T01:00:45.344Z
- 대상 역: 27개
- 상태: 수도권 확대 지원 전 데이터 검증 필요

### 지상 엘리베이터 출구 충돌 (11역)

| 역 | API별 값 |
| --- | --- |
| 독정 (0206, IC) | stationMovement: 1, 3<br>stinElevatorMovement: 1, 3<br>stationElevator: 1, 2, 3 |
| 가정 (0211, IC) | stationMovement: 3, 4, 7<br>stinElevatorMovement: 3, 4, 7<br>stationElevator: 3, 4 |
| 석남 (0213, IC) | stationMovement: 1, 8<br>stinElevatorMovement: 1, 8<br>stationElevator: 1, 2 |
| 인천가좌 (0215, IC) | stationMovement: 1<br>stinElevatorMovement: 1<br>stationElevator: 1, 2 |
| 가재울 (0216, IC) | stationMovement: 1<br>stinElevatorMovement: 1<br>stationElevator: 1, 2 |
| 주안국가산단 (0217, IC) | stationMovement: 1<br>stinElevatorMovement: 1<br>stationElevator: 1, 2 |
| 주안 (0218, IC) | stationMovement: 5<br>stinElevatorMovement: 5<br>stationElevator: 5, 6 |
| 석천사거리 (0222, IC) | stationMovement: 1, 4<br>stinElevatorMovement: 1, 4<br>stationElevator: 1, 2 |
| 만수 (0224, IC) | stationMovement: 2, 3, 4<br>stinElevatorMovement: 2, 3<br>stationElevator: 1, 4 |
| 남동구청 (0225, IC) | stationMovement: 1, 3, 4<br>stinElevatorMovement: 1, 3<br>stationElevator: 1, 3 |
| 인천대공원 (0226, IC) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1, 2 |

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

## 신분당선

- API 수집: 2026-09-21T00:55:31.218Z
- 대상 역: 16개
- 상태: 수도권 확대 지원 전 데이터 검증 필요

### 지상 엘리베이터 출구 충돌 (10역)

| 역 | API별 값 |
| --- | --- |
| 신사 (D004, DX) | stationMovement: 1, 6, 8<br>stinElevatorMovement: 1, 6, 8<br>stationElevator: 6 |
| 논현 (D005, DX) | stationMovement: 3, 4, 10<br>stinElevatorMovement: 3, 4, 10<br>stationElevator: 3, 4 |
| 강남 (D007, DX) | stationMovement: 3, 6<br>stinElevatorMovement: 3, 6<br>stationElevator: 3, 4, 5, 6 |
| 양재(서초구청) (D008, DX) | stationMovement: 4, 7, 10, 11<br>stinElevatorMovement: 4, 7, 10, 11<br>stationElevator: 7, 10 |
| 양재시민의숲(매헌) (D009, DX) | stationMovement: 1, 3<br>stinElevatorMovement: 1, 3<br>stationElevator: 1, 2, 3 |
| 미금(분당서울대병원) (D013, DX) | stationMovement: 4, 6<br>stinElevatorMovement: 4, 6<br>stationElevator: 5, 6 |
| 동천 (D014, DX) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 1, 2, 3 |
| 수지구청 (D015, DX) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 1, 2, 3, 4 |
| 상현 (D017, DX) | stationMovement: 1, 4<br>stinElevatorMovement: 1, 4<br>stationElevator: 1, 2, 4 |
| 광교중앙(아주대) (D018, DX) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 1, 2, 3, 4 |

### 방향별 차량·문 확인 (11역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 논현 (D005, DX) | API 값 충돌 | - | stationElevatorCarNumber: 1-2, 3-3, 4-2, 6-3<br>stationElevator: 1-2, 6-3 |
| 강남 (D007, DX) | API 값 충돌 | - | stationElevatorCarNumber: 2-1, 5-1<br>stationElevator: 2-1, 4-4, 5-2, 7-1 |
| 양재(서초구청) (D008, DX) | API 값 충돌 | - | stationElevatorCarNumber: 2-1, 5-1<br>stationElevator: 2-1, 5-4, 6-3 |
| 양재시민의숲(매헌) (D009, DX) | API 값 충돌 | - | stationElevatorCarNumber: 2-1, 5-1<br>stationElevator: 2-4, 5-1 |
| 청계산입구 (D010, DX) | API 값 충돌 | - | stationElevatorCarNumber: 3-1, 4-1<br>stationElevator: 3-1, 4-4 |
| 판교(판교테크노밸리) (D011, DX) | API 값 충돌 | - | stationElevatorCarNumber: 2-1, 5-1<br>stationElevator: 2-1, 5-4 |
| 정자 (D012, DX) | API 값 충돌 | - | stationElevatorCarNumber: 3-1, 4-1<br>stationElevator: 1-1, 3-4, 4-1, 6-4 |
| 미금(분당서울대병원) (D013, DX) | stationElevatorCarNumber 누락 | - | stationElevator: 3-2, 4-4 |
| 동천 (D014, DX) | API 값 충돌 | - | stationElevatorCarNumber: 3-1<br>stationElevator: 3-4 |
| 수지구청 (D015, DX) | API 값 충돌 | - | stationElevatorCarNumber: 3-1<br>stationElevator: 3-4 |
| 상현 (D017, DX) | API 값 충돌 | - | stationElevatorCarNumber: 3-1<br>stationElevator: 3-4, 4-1 |

### 승강장·문·이격거리 연결 확인 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 에버라인

- API 수집: 2026-09-21T00:56:08.448Z
- 대상 역: 15개
- 상태: 수도권 확대 지원 전 데이터 검증 필요

### 지상 엘리베이터 출구 충돌 (13역)

| 역 | API별 값 |
| --- | --- |
| 기흥(백남준아트센터) (Y110, EV) | stationMovement: 8<br>stinElevatorMovement: 8<br>stationElevator: 8, 9 |
| 강남대 (Y111, EV) | stationMovement: 2, 3<br>stinElevatorMovement: 2, 3<br>stationElevator: 1, 2, 3 |
| 지석 (Y112, EV) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 1, 2, 3, 4 |
| 어정 (Y113, EV) | stationMovement: 1<br>stinElevatorMovement: 1<br>stationElevator: 1, 2 |
| 동백 (Y114, EV) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1, 2, 3 |
| 초당 (Y115, EV) | stationMovement: 1<br>stinElevatorMovement: 1<br>stationElevator: 1, 2 |
| 삼가 (Y116, EV) | stationMovement: 3<br>stinElevatorMovement: 3<br>stationElevator: 1, 3 |
| 명지대 (Y118, EV) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1, 2 |
| 김량장 (Y119, EV) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1, 2 |
| 용인중앙시장(용인예술과학대) (Y120, EV) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1, 2, 3 |
| 보평 (Y122, EV) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 1, 2, 3 |
| 둔전 (Y123, EV) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1, 2 |
| 전대.에버랜드 (Y124, EV) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 1, 2, 3, 4 |

### 방향별 차량·문 확인 (0역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 없음 | - | - | - |

### 승강장·문·이격거리 연결 확인 (2역)

| 역 | 확인할 내용 |
| --- | --- |
| 기흥(백남준아트센터) (Y110, EV) | 권장 문 이격거리 없음: 3:1-2, 4:1-1 |
| 전대.에버랜드 (Y124, EV) | 권장 문 이격거리 없음: 2:1-1 |

## 김포골드라인

- API 수집: 2026-09-21T00:56:29.559Z
- 대상 역: 10개
- 상태: 수도권 확대 지원 전 데이터 검증 필요

### 지상 엘리베이터 출구 충돌 (4역)

| 역 | API별 값 |
| --- | --- |
| 구래 (G101, GM) | stationMovement: 1, 3<br>stinElevatorMovement: 1, 3<br>stationElevator: 1, 2 |
| 장기 (G103, GM) | stationMovement: 2, 5<br>stinElevatorMovement: 2, 5<br>stationElevator: 1, 5 |
| 운양 (G104, GM) | stationMovement: 1, 3<br>stinElevatorMovement: 1, 3<br>stationElevator: 2, 4 |
| 김포공항 (G109, GM) | stationMovement: 3<br>stinElevatorMovement: 3<br>stationElevator: 1 |

### 방향별 차량·문 확인 (0역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 없음 | - | - | - |

### 승강장·문·이격거리 연결 확인 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## GTX-A

- API 수집: 2026-09-21T00:56:48.564Z
- 대상 역: 9개
- 상태: 수도권 확대 지원 전 데이터 검증 필요

### 지상 엘리베이터 출구 충돌 (2역)

| 역 | API별 값 |
| --- | --- |
| 수서 (X108, GX) | stinElevatorMovement: 5-1, 5-2, 7<br>stationElevator: 5-1, 5-2, 5-3 |
| 동탄 (X111, SR) | stationMovement: 1<br>stinElevatorMovement: 1, 2 |

### 방향별 차량·문 확인 (5역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
| 운정중앙 (X101, GX) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 킨텍스 (X102, GX) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 대곡 (X103, GX) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 연신내 (X105, GX) | stationElevatorCarNumber 누락 | - | 후보 없음 |
| 서울역 (X106, GX) | stationElevatorCarNumber 누락 | - | 후보 없음 |

### 승강장·문·이격거리 연결 확인 (0역)

| 역 | 확인할 내용 |
| --- | --- |
| 없음 | - |

## 인천공항 자기부상철도

- API 수집: 2026-09-21T00:56:53.431Z
- 대상 역: 6개
- 상태: 수도권 확대 지원 전 데이터 검증 필요

### 지상 엘리베이터 출구 충돌 (1역)

| 역 | API별 값 |
| --- | --- |
| 장기주차장 (0102, IA) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 1, 3 |

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

## 수인분당선

- API 수집: 2026-09-21T00:57:00.570Z
- 대상 역: 63개
- 상태: 수도권 확대 지원 전 데이터 검증 필요

### 지상 엘리베이터 출구 충돌 (30역)

| 역 | API별 값 |
| --- | --- |
| 압구정로데오 (K212, KR) | stationMovement: 3, 7<br>stinElevatorMovement: 3, 7<br>stationElevator: 1, 2, 7 |
| 구룡 (K218, KR) | stationMovement: 1, 4<br>stinElevatorMovement: 1, 4<br>stationElevator: 2, 4 |
| 개포동 (K219, KR) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 1, 2, 4 |
| 수서 (K221, KR) | stationMovement: 1, 5<br>stinElevatorMovement: 1, 5<br>stationElevator: 1 |
| 가천대 (K223, KR) | stationMovement: 2, 5<br>stinElevatorMovement: 2, 5<br>stationElevator: 2, 4, 5 |
| 태평 (K224, KR) | stationMovement: 5<br>stinElevatorMovement: 5<br>stationElevator: 5, 6 |
| 야탑 (K226, KR) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 1, 2, 3, 4 |
| 이매(성남아트센터) (K227, KR) | stationMovement: 3, 5, 6, 9<br>stinElevatorMovement: 3, 5, 6, 9<br>stationElevator: 3, 9 |
| 서현 (K228, KR) | stationMovement: 1, 3<br>stinElevatorMovement: 1, 3<br>stationElevator: 1 |
| 정자 (K230, KR) | stationMovement: 2, 3, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 2, 4 |
| 미금(분당서울대병원) (K231, KR) | stationMovement: 4, 6<br>stinElevatorMovement: 4, 6<br>stationElevator: 4 |
| 오리 (K232, KR) | stationMovement: 6<br>stinElevatorMovement: 6<br>stationElevator: 3, 6 |
| 죽전(단국대) (K233, KR) | stationMovement: 1, 2, 3<br>stinElevatorMovement: 1, 2, 3<br>stationElevator: 1 |
| 신갈 (K236, KR) | stationMovement: 2, 3<br>stinElevatorMovement: 2, 3<br>stationElevator: 2, 3, 4 |
| 기흥(백남준아트센터) (K237, KR) | stationMovement: 2, 4, 5, 6<br>stinElevatorMovement: 2, 4, 5, 6<br>stationElevator: 2, 3, 4, 5, 6, 7 |
| 상갈(루터대학교) (K238, KR) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 2, 3, 4 |
| 영통(경희대) (K240, KR) | stationMovement: 2, 6<br>stinElevatorMovement: 2, 6<br>stationElevator: 1, 2, 5, 6 |
| 매탄권선 (K242, KR) | stationMovement: 1, 4<br>stinElevatorMovement: 1, 4<br>stationElevator: 1, 2, 4, 5 |
| 수원시청(경기도문화의전당) (K243, KR) | stationMovement: 3, 7<br>stinElevatorMovement: 3, 7<br>stationElevator: 3, 4, 7, 8 |
| 매교 (K244, KR) | stationMovement: 3, 8<br>stinElevatorMovement: 3, 8<br>stationElevator: 4, 7, 8 |
| 수원 (K245, KR) | stationMovement: 5, 7, 10<br>stinElevatorMovement: 5, 7, 10<br>stationElevator: 8, 10 |
| 고색 (K246, KR) | stinElevatorMovement: 3<br>stationElevator: 3, 4 |
| 오목천 (K247, KR) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1-2, 2, 3 |
| 한대앞 (K251, KR) | stationMovement: 1, 2, 3<br>stinElevatorMovement: 1, 2, 3<br>stationElevator: 2 |
| 고잔 (K253, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 1 |
| 달월 (K259, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 1 |
| 인천논현 (K262, KR) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 2, 3 |
| 연수 (K266, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 1, 2, 3, 4 |
| 인하대 (K269, KR) | stationMovement: 2, 7<br>stinElevatorMovement: 2, 7<br>stationElevator: 1, 2, 6, 7 |
| 신포 (K271, KR) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 2, 3, 4 |

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

## 경춘선

- API 수집: 2026-09-21T00:57:18.591Z
- 대상 역: 25개
- 상태: 수도권 확대 지원 전 데이터 검증 필요

### 지상 엘리베이터 출구 충돌 (3역)

| 역 | API별 값 |
| --- | --- |
| 갈매 (P123, KR) | stationMovement: 1, 2, 3<br>stinElevatorMovement: 1, 2, 3<br>stationElevator: 1, 2 |
| 천마산 (P129, KR) | stationMovement: 1, 3<br>stinElevatorMovement: 1, 3<br>stationElevator: 2, 3 |
| 마석 (P130, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 2 |

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

## 경의중앙선

- API 수집: 2026-09-21T00:57:28.719Z
- 대상 역: 58개
- 상태: 수도권 확대 지원 전 데이터 검증 필요

### 지상 엘리베이터 출구 충돌 (17역)

| 역 | API별 값 |
| --- | --- |
| 용산 (K110, KR) | stationMovement: 1, 2, 3<br>stinElevatorMovement: 1, 2, 3<br>stationElevator: 1 |
| 서빙고 (K112, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 1 |
| 망우 (K121, KR) | stationMovement: 1, 3<br>stinElevatorMovement: 1, 3<br>stationElevator: 1, 2, 3 |
| 양원(서울시북부병원) (K122, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 1, 2, 3, 4 |
| 구리 (K123, KR) | stationMovement: 1, 2, 3<br>stinElevatorMovement: 1, 2, 3<br>stationElevator: 1 |
| 덕소 (K126, KR) | stationMovement: 1, 3<br>stinElevatorMovement: 1, 3<br>stationElevator: 1, 2, 3 |
| 용문 (K137, KR) | stationMovement: 2, 3<br>stinElevatorMovement: 2, 3<br>stationElevator: 1, 2, 3 |
| 청량리 (K209, KR) | stationMovement: 1<br>stinElevatorMovement: 1<br>stationElevator: 1, 3 |
| 공덕 (K312, KR) | stationMovement: 9, 10<br>stinElevatorMovement: 9, 10<br>stationElevator: 9 |
| 홍대입구 (K314, KR) | stationMovement: 4, 7, 8<br>stinElevatorMovement: 4, 7, 8<br>stationElevator: 7 |
| 가좌 (K315, KR) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 1, 2, 3, 4 |
| 강매 (K319, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 1, 2, 3 |
| 행신 (K320, KR) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1, 2 |
| 풍산 (K325, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 2 |
| 야당 (K328, KR) | stationMovement: 2, 3<br>stinElevatorMovement: 2, 3<br>stationElevator: 1, 2, 3 |
| 금릉 (K330, KR) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1, 2 |
| 문산 (K335, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 1 |

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

## 경강선

- API 수집: 2026-09-21T00:57:47.297Z
- 대상 역: 12개
- 상태: 수도권 확대 지원 전 데이터 검증 필요

### 지상 엘리베이터 출구 충돌 (4역)

| 역 | API별 값 |
| --- | --- |
| 판교(판교테크노밸리) (K409, KR) | stationMovement: 1, 2, 3<br>stinElevatorMovement: 2, 3 |
| 성남 (K410, KR) | stationMovement: 3, 5<br>stinElevatorMovement: 3, 5<br>stationElevator: 1, 3, 4, 5 |
| 이매 (K411, KR) | stationMovement: 3, 5, 6, 9<br>stinElevatorMovement: 3, 5, 6, 9<br>stationElevator: 5, 6 |
| 초월 (K414, KR) | stationMovement: 1, 2<br>stinElevatorMovement: 1, 2<br>stationElevator: 2 |

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

## 서해선

- API 수집: 2026-09-21T00:57:53.523Z
- 대상 역: 21개
- 상태: 수도권 확대 지원 전 데이터 검증 필요

### 지상 엘리베이터 출구 충돌 (8역)

| 역 | API별 값 |
| --- | --- |
| 소사 (S16, SW) | stationMovement: 2, 3, 6<br>stinElevatorMovement: 2, 3, 6<br>stationElevator: 1, 2, 3, 6 |
| 시흥대야 (S18, SW) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1, 3 |
| 신현 (S20, SW) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1, 2 |
| 시흥시청 (S22, SW) | stationMovement: 1<br>stinElevatorMovement: 1<br>stationElevator: 1, 2 |
| 선부 (S25, SW) | stationMovement: 2, 4<br>stinElevatorMovement: 2, 4<br>stationElevator: 1, 2, 4 |
| 초지 (S26, SW) | stationMovement: 5<br>stinElevatorMovement: 5<br>stationElevator: 1, 2-3, 3, 4, 5 |
| 시우 (S27, SW) | stationMovement: 1, 3<br>stinElevatorMovement: 1, 3<br>stationElevator: 1, 2, 3-4 |
| 원시 (S28, SW) | stationMovement: 2<br>stinElevatorMovement: 2<br>stationElevator: 1, 2 |

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

## 신림선

- API 수집: 2026-09-21T00:58:12.242Z
- 대상 역: 11개
- 상태: 수도권 확대 지원 전 데이터 검증 필요

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

## 우이신설선

- API 수집: 2026-09-21T00:58:27.310Z
- 대상 역: 13개
- 상태: 수도권 확대 지원 전 데이터 검증 필요

### 지상 엘리베이터 출구 충돌 (2역)

| 역 | API별 값 |
| --- | --- |
| 보문 (S121, UI) | stationMovement: 7<br>stinElevatorMovement: 7<br>stationElevator: 1-8, 7 |
| 신설동 (S122, UI) | stationMovement: 1, 11<br>stinElevatorMovement: 1, 11<br>stationElevator: 1, 12 |

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

## 의정부경전철

- API 수집: 2026-09-21T00:58:52.607Z
- 대상 역: 15개
- 상태: 수도권 확대 지원 전 데이터 검증 필요

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
