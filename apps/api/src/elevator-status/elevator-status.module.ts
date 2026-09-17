import { Module } from '@nestjs/common';
import { ElevatorStatusClient } from './elevator-status.client.js';
import { ElevatorStatusController } from './elevator-status.controller.js';
import { ElevatorStatusService } from './elevator-status.service.js';

@Module({
  controllers: [ElevatorStatusController],
  providers: [ElevatorStatusClient, ElevatorStatusService],
  exports: [ElevatorStatusClient],
})
export class ElevatorStatusModule {}
