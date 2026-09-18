import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { PlanJourneyReqDto } from './dto/req/plan-journey.req.dto.js';
import { JourneyPlanResDto } from './dto/res/journey-plan.res.dto.js';
import { JourneyService } from './journey.service.js';

@ApiTags('여정')
@Controller('journeys')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @Get('plan')
  @ApiOperation({
    summary: '검증된 엘리베이터 경로와 현재 상태를 결합한 여정 조회',
    description:
      '현재는 답십리→강동·굽은다리·홍대입구를 지원합니다. 필수 승강기가 운행 중지이면 검증된 대체 경로를 선택하고, 연결이 불확실하면 추천하지 않습니다.',
  })
  @ApiOkResponse({ type: JourneyPlanResDto })
  @ApiBadRequestResponse({ description: '역 코드 형식이 올바르지 않음' })
  @ApiUnprocessableEntityResponse({
    description: '아직 검증되지 않은 출발역·도착역 조합',
  })
  @ApiServiceUnavailableResponse({
    description: '서울 승강기 상태 조회 실패',
  })
  plan(@Query() query: PlanJourneyReqDto): Promise<JourneyPlanResDto> {
    return this.journeyService.plan(
      query.originStationCode,
      query.destinationStationCode,
    );
  }
}
