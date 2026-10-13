import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class PlanJourneyReqDto {
  @ApiProperty({
    description: '출발역 코드. 숫자 또는 영문 대문자를 포함한 3~4자리 코드',
    example: 'K309',
  })
  @Matches(/^[A-Z0-9]{3,4}$/, {
    message: 'originStationCode는 영문 대문자 또는 숫자 3~4자리여야 합니다.',
  })
  originStationCode: string;

  @ApiProperty({
    description:
      '도착역 코드. 숫자 3자리 코드는 앞에 0을 붙여 처리하며 영문 대문자를 포함할 수 있습니다.',
    example: '0342',
  })
  @Matches(/^[A-Z0-9]{3,4}$/, {
    message:
      'destinationStationCode는 영문 대문자 또는 숫자 3~4자리여야 합니다.',
  })
  destinationStationCode: string;
}
