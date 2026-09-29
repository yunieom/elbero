export type TransitLineId =
  '5' | '1' | '2' | '3' | 'gyeongui-jungang' | 'airport';

export interface Station {
  id: string;
  stationKey: string;
  stationCode: string;
  stationName: string;
  lineId: TransitLineId;
  lineName: string;
  lineOrder: number;
  journeySupported: boolean;
}
