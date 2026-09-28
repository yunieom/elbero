import { ApiProperty } from '@nestjs/swagger';

export class Line5StationResDto {
  @ApiProperty({ example: '2543' })
  stationCode: string;

  @ApiProperty({ example: '답십리' })
  stationName: string;

  @ApiProperty({ example: '5호선' })
  lineName: '5호선';
}
