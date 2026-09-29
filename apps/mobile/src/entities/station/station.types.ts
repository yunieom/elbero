export type TransitLineId =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'gyeongui-jungang'
  | 'airport'
  | 'suin-bundang'
  | 'gyeongchun'
  | 'gyeonggang'
  | 'seohae'
  | 'shinbundang'
  | 'incheon-1'
  | 'incheon-2'
  | 'ui-sinseol'
  | 'sillim'
  | 'gimpo-gold'
  | 'everline'
  | 'uijeongbu'
  | 'gtx-a'
  | 'airport-maglev';

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
