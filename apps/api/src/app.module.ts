import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ElevatorStatusModule } from './elevator-status/elevator-status.module.js';
import { JourneyModule } from './journey/journey.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
    }),
    ElevatorStatusModule,
    JourneyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
