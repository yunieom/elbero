import type { TransitLineId } from './station.types';

export interface TransitLine {
  id: TransitLineId;
  name: string;
  badge: string;
  color: string;
}

export const transitLines: TransitLine[] = [
  { id: '5', name: '5호선', badge: '5', color: '#996CAC' },
  { id: '1', name: '1호선', badge: '1', color: '#0052A4' },
  { id: '2', name: '2호선', badge: '2', color: '#00A84D' },
  { id: '3', name: '3호선', badge: '3', color: '#EF7C1C' },
  { id: '4', name: '4호선', badge: '4', color: '#00A5DE' },
  { id: '6', name: '6호선', badge: '6', color: '#CD7C2F' },
  { id: '7', name: '7호선', badge: '7', color: '#747F00' },
  { id: '8', name: '8호선', badge: '8', color: '#E6186C' },
  { id: '9', name: '9호선', badge: '9', color: '#BDB092' },
  {
    id: 'gyeongui-jungang',
    name: '경의중앙선',
    badge: '경',
    color: '#77C4A3',
  },
  { id: 'airport', name: '공항철도', badge: '공', color: '#0090D2' },
  { id: 'suin-bundang', name: '수인분당선', badge: '수', color: '#F5A200' },
  { id: 'gyeongchun', name: '경춘선', badge: '춘', color: '#178C72' },
  { id: 'gyeonggang', name: '경강선', badge: '강', color: '#003DA5' },
  { id: 'seohae', name: '서해선', badge: '서', color: '#8FC31F' },
  { id: 'shinbundang', name: '신분당선', badge: '신', color: '#D4003B' },
  { id: 'incheon-1', name: '인천1호선', badge: '인1', color: '#759CCE' },
  { id: 'incheon-2', name: '인천2호선', badge: '인2', color: '#ED8B00' },
  { id: 'ui-sinseol', name: '우이신설선', badge: '우', color: '#B7C450' },
  { id: 'sillim', name: '신림선', badge: '림', color: '#6789CA' },
  { id: 'gimpo-gold', name: '김포골드라인', badge: '김', color: '#AD8605' },
  { id: 'everline', name: '용인에버라인', badge: '용', color: '#56AD2D' },
  { id: 'uijeongbu', name: '의정부경전철', badge: '의', color: '#FDA600' },
  { id: 'gtx-a', name: 'GTX-A', badge: 'A', color: '#9A6292' },
  {
    id: 'airport-maglev',
    name: '인천공항자기부상철도',
    badge: '자',
    color: '#FFCD12',
  },
];

export const transitLineById = Object.fromEntries(
  transitLines.map((line) => [line.id, line]),
) as Record<TransitLineId, TransitLine>;
