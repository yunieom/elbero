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
  {
    id: 'gyeongui-jungang',
    name: '경의중앙선',
    badge: '경',
    color: '#77C4A3',
  },
  { id: 'airport', name: '공항철도', badge: '공', color: '#0090D2' },
];

export const transitLineById = Object.fromEntries(
  transitLines.map((line) => [line.id, line]),
) as Record<TransitLineId, TransitLine>;
