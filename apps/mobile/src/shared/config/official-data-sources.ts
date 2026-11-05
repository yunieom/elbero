export interface OfficialDataSource {
  title: string;
  provider: string;
  description: string;
  url: string;
}

export const governmentAffiliationDisclaimer =
  '엘베로는 대한민국 정부, 국가철도공단, 서울특별시, 서울교통공사 또는 기타 철도 운영기관을 대표하지 않으며, 이들 기관이 승인하거나 제공하는 공식 앱이 아닙니다.';

export const officialDataSources: OfficialDataSource[] = [
  {
    title: '도시철도 전체노선정보',
    provider: '국가철도공단 철도 데이터 포털',
    description: '노선, 역 순서와 운영기관 정보',
    url: 'https://data.kric.go.kr/rips/M_01_02/detail.do?id=431&operation=subwayRouteInfo&service=trainUseInfo',
  },
  {
    title: '출입구 승강장 이동경로(표준)',
    provider: '국가철도공단 철도 데이터 포털',
    description: '출입구부터 승강장까지의 교통약자 이동경로',
    url: 'https://data.kric.go.kr/rips/M_01_02/detail.do?id=429&operation=stationMovement&service=handicapped',
  },
  {
    title: '환승 이동경로(표준)',
    provider: '국가철도공단 철도 데이터 포털',
    description: '역사 내 교통약자 환승 이동경로',
    url: 'https://data.kric.go.kr/rips/M_01_02/detail.do?id=428&operation=transferMovement&service=handicapped',
  },
  {
    title: '역사별 엘리베이터 이동동선',
    provider: '국가철도공단 철도 데이터 포털',
    description: '역사 내 엘리베이터 위치와 이동동선',
    url: 'https://data.kric.go.kr/rips/M_01_02/detail.do?id=208&operation=stinElevatorMovement&service=trafficWeekInfo',
  },
  {
    title: '역사별 인접 승강기 차량번호',
    provider: '국가철도공단 철도 데이터 포털',
    description: '승강기와 가까운 차량·문 정보',
    url: 'https://data.kric.go.kr/rips/M_01_02/detail.do?id=210&operation=stationElevatorCarNumber&service=vulnerableUserInfo',
  },
  {
    title: '역사별 승강장 이격거리',
    provider: '국가철도공단 철도 데이터 포털',
    description: '승강장과 열차 사이의 이격거리',
    url: 'https://data.kric.go.kr/rips/M_01_02/detail.do?id=206&operation=stationPlatformTrainDistance&service=vulnerableUserInfo',
  },
  {
    title: '역사별 엘리베이터 현황',
    provider: '국가철도공단 철도 데이터 포털',
    description: '역사별 엘리베이터 위치와 운행 층',
    url: 'https://data.kric.go.kr/rips/M_01_02/detail.do?id=189&operation=stationElevator&service=convenientInfo',
  },
  {
    title: '교통약자 이용시설 승강기 가동현황',
    provider: '서울 열린데이터광장 · 서울교통공사',
    description: '서울교통공사 역별 승강기 정상 가동 여부',
    url: 'https://data.seoul.go.kr/dataList/OA-15994/S/1/datasetView.do',
  },
];
