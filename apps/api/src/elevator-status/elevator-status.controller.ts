import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetStationElevatorStatusReqDto } from './dto/req/get-station-elevator-status.req.dto.js';
import { StationElevatorStatusResDto } from './dto/res/elevator-status.res.dto.js';
import { ElevatorStatusService } from './elevator-status.service.js';

@ApiTags('승강기 상태')
@Controller('elevator-status')
export class ElevatorStatusController {
  constructor(private readonly elevatorStatusService: ElevatorStatusService) {}

  @Get('stations/:stationCode')
  @ApiOperation({
    summary: '역별 엘리베이터 작동 상태 조회',
    description:
      '서울교통공사 승강기 가동현황을 조회합니다. 원천 데이터는 최대 1시간 지연될 수 있으며, Elbero는 응답을 1시간 캐시합니다.',
  })
  @ApiOkResponse({ type: StationElevatorStatusResDto })
  @ApiBadRequestResponse({ description: '역 코드 형식이 올바르지 않음' })
  @ApiNotFoundResponse({ description: '해당 역 코드의 설비 정보를 찾지 못함' })
  @ApiServiceUnavailableResponse({
    description: '인증키 미설정 또는 서울 열린데이터광장 조회 실패',
  })
  getStationStatus(
    @Param() params: GetStationElevatorStatusReqDto,
  ): Promise<StationElevatorStatusResDto> {
    return this.elevatorStatusService.getStationStatus(params.stationCode);
  }
}
