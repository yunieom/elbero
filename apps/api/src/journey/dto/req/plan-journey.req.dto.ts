import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class PlanJourneyReqDto {
  @ApiProperty({
    description: '출발역 코드',
    example: '2543',
  })
  @Matches(/^\d{3,4}$/, {
    message: 'originStationCode는 숫자 3~4자리여야 합니다.',
  })
  originStationCode: string;

  @ApiProperty({
    description: '도착역 코드. 3자리 코드는 앞에 0을 붙여 처리합니다.',
    example: '239',
  })
  @Matches(/^\d{3,4}$/, {
    message: 'destinationStationCode는 숫자 3~4자리여야 합니다.',
  })
  destinationStationCode: string;
}
