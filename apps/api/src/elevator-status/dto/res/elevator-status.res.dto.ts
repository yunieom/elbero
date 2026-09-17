import { ApiProperty } from '@nestjs/swagger';
import {
  ELEVATOR_STATUS,
  type ElevatorStatus,
} from '../../types/seoul-elevator-status.type.js';

const STATUS_VALUES = Object.values(ELEVATOR_STATUS);

export class ElevatorStatusItemResDto {
  @ApiProperty({
    description: '서울교통공사가 제공한 승강기 명칭',
    example: '승강기)엘리베이터-답십리 외부#1',
  })
  name: string;

  @ApiProperty({ description: '운행 구간', example: 'B1-1F' })
  operatingSection: string;

  @ApiProperty({ description: '설치 위치', example: '2번 출입구' })
  location: string;

  @ApiProperty({
    description: 'Elbero 표준화 상태',
    enum: STATUS_VALUES,
    example: ELEVATOR_STATUS.OPERATIONAL,
  })
  status: ElevatorStatus;

  @ApiProperty({
    description: '서울교통공사 원본 상태',
    example: '사용가능',
  })
  sourceStatus: string;
}

export class StationElevatorStatusResDto {
  @ApiProperty({ description: '4자리로 정규화한 역 코드', example: '2543' })
  stationCode: string;

  @ApiProperty({ description: '호선 표기를 제외한 역명', example: '답십리' })
  stationName: string;

  @ApiProperty({
    description:
      '역 엘리베이터 종합 상태. 하나라도 운행 중지이면 out_of_service입니다.',
    enum: STATUS_VALUES,
    example: ELEVATOR_STATUS.OPERATIONAL,
  })
  overallStatus: ElevatorStatus;

  @ApiProperty({
    description: 'Elbero가 서울 열린데이터광장에서 상태를 수집한 시각',
    format: 'date-time',
    example: '2026-09-17T12:00:00.000Z',
  })
  checkedAt: string;

  @ApiProperty({
    description: '원천 데이터에 발생할 수 있는 최대 갱신 지연(분)',
    example: 60,
  })
  maxSourceDelayMinutes: number;

  @ApiProperty({
    description: '상태 데이터 출처',
    example: '서울 열린데이터광장 SeoulMetroFaciInfo',
  })
  source: string;

  @ApiProperty({
    description:
      '원천 데이터에 개별 설비 관측 시각이 없어 checkedAt은 Elbero 수집 시각입니다.',
    example:
      '실제 상태는 서울교통공사 갱신 주기에 따라 최대 1시간 지연될 수 있습니다.',
  })
  notice: string;

  @ApiProperty({ type: [ElevatorStatusItemResDto] })
  elevators: ElevatorStatusItemResDto[];
}
