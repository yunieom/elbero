import { Controller, Get, Query } from '@nestjs/common';
import type { JourneyContractResult } from '@elbero/contracts';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { PlanJourneyReqDto } from './dto/req/plan-journey.req.dto.js';
import {
  JourneyPlanErrorResDto,
  JourneyPlanResDto,
  JourneyPlanResultResDto,
} from './dto/res/journey-plan.res.dto.js';
import { Line5StationResDto } from './dto/res/line-5-station.res.dto.js';
import { JourneyContractException } from '../common/http/journey-contract.exception.js';
import { JourneyService } from './journey.service.js';

@ApiTags('여정')
@Controller('journeys')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @Get('line-5/stations')
  @ApiOperation({
    summary: '현재 지원하는 5호선 역 목록 조회',
    description:
      '앱의 출발역·도착역 검색에서 사용하는 5호선 56개 역을 노선 순서로 반환합니다.',
  })
  @ApiOkResponse({ type: [Line5StationResDto] })
  listLine5Stations(): Line5StationResDto[] {
    return this.journeyService.listLine5Stations();
  }

  @Get('plan')
  @ApiOperation({
    summary: '검증된 엘리베이터 경로와 현재 상태를 결합한 여정 조회',
    description:
      '2호선·5호선·7호선 전체 역 조합, 2호선 본선과 신정·성수 지선 환승, 군자역 5↔7호선 환승, 답십리→홍대입구 대표 환승 여정을 지원합니다. 정보가 부족한 경로는 일반 경로와 확인된 차량·문을 표시하되 엘리베이터 안전 경로 미확인으로 반환합니다.',
  })
  @ApiOkResponse({ type: JourneyPlanResultResDto })
  @ApiBadRequestResponse({ description: '역 코드 형식이 올바르지 않음' })
  @ApiUnprocessableEntityResponse({
    description: '아직 검증되지 않은 출발역·도착역 조합',
    type: JourneyPlanErrorResDto,
  })
  @ApiServiceUnavailableResponse({
    description: '서울 승강기 상태 조회 실패',
    type: JourneyPlanErrorResDto,
  })
  async plan(
    @Query() query: PlanJourneyReqDto,
  ): Promise<JourneyContractResult<JourneyPlanResDto>> {
    const result = await this.journeyService.plan(
      query.originStationCode,
      query.destinationStationCode,
    );
    if (!result.ok) throw new JourneyContractException(result);
    return result;
  }
}
