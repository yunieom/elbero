import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class GetStationElevatorStatusReqDto {
  @ApiProperty({
    description:
      '서울교통공사 역 코드. KRIC의 3자리 코드는 앞에 0을 붙여 조회합니다.',
    example: '2543',
  })
  @Matches(/^\d{3,4}$/, {
    message: 'stationCode는 숫자 3~4자리여야 합니다.',
  })
  stationCode: string;
}
