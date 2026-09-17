import { Module } from '@nestjs/common';
import { ElevatorStatusModule } from '../elevator-status/elevator-status.module.js';
import { JourneyController } from './journey.controller.js';
import { JourneyService } from './journey.service.js';

@Module({
  imports: [ElevatorStatusModule],
  controllers: [JourneyController],
  providers: [JourneyService],
})
export class JourneyModule {}
