import { Injectable, NotFoundException } from '@nestjs/common';
import { ElevatorStatusClient } from './elevator-status.client.js';
import {
  type ElevatorStatusItemResDto,
  type StationElevatorStatusResDto,
} from './dto/res/elevator-status.res.dto.js';
import {
  ELEVATOR_STATUS,
  type ElevatorStatus,
  type SeoulElevatorFacilityRow,
} from './types/seoul-elevator-status.type.js';

const SOURCE_NAME = '서울 열린데이터광장 SeoulMetroFaciInfo';
const MAX_SOURCE_DELAY_MINUTES = 60;

@Injectable()
export class ElevatorStatusService {
  constructor(private readonly elevatorStatusClient: ElevatorStatusClient) {}

  async getStationStatus(
    stationCode: string,
  ): Promise<StationElevatorStatusResDto> {
    const normalizedStationCode = stationCode.padStart(4, '0');
    const snapshot = await this.elevatorStatusClient.getSnapshot();
    const stationRows = snapshot.rows.filter(
      (row) => row.STN_CD === normalizedStationCode,
    );

    if (stationRows.length === 0) {
      throw new NotFoundException(
        `역 코드 ${normalizedStationCode}의 승강기 정보를 찾을 수 없습니다.`,
      );
    }

    const elevators = stationRows
      .filter((row) => row.ELVTR_SE === 'EV')
      .map((row) => this.toElevator(row));

    return {
      stationCode: normalizedStationCode,
      stationName: this.toBaseStationName(stationRows[0].STN_NM),
      overallStatus: this.toOverallStatus(elevators),
      checkedAt: snapshot.checkedAt,
      maxSourceDelayMinutes: MAX_SOURCE_DELAY_MINUTES,
      source: SOURCE_NAME,
      notice:
        '실제 상태는 서울교통공사 갱신 주기에 따라 최대 1시간 지연될 수 있습니다.',
      elevators,
    };
  }

  private toElevator(
    row: SeoulElevatorFacilityRow,
  ): ElevatorStatusItemResDto {
    return {
      name: row.ELVTR_NM,
      operatingSection: row.OPR_SEC,
      location: row.INSTL_PSTN,
      status: this.toStatus(row.USE_YN),
      sourceStatus: row.USE_YN,
    };
  }

  private toStatus(sourceStatus: string): ElevatorStatus {
    if (sourceStatus === '사용가능') {
      return ELEVATOR_STATUS.AVAILABLE;
    }
    if (sourceStatus === '보수중') {
      return ELEVATOR_STATUS.OUT_OF_SERVICE;
    }
    return ELEVATOR_STATUS.UNKNOWN;
  }

  private toOverallStatus(
    elevators: ElevatorStatusItemResDto[],
  ): ElevatorStatus {
    if (
      elevators.some(
        (elevator) => elevator.status === ELEVATOR_STATUS.OUT_OF_SERVICE,
      )
    ) {
      return ELEVATOR_STATUS.OUT_OF_SERVICE;
    }
    if (
      elevators.length === 0 ||
      elevators.some(
        (elevator) => elevator.status === ELEVATOR_STATUS.UNKNOWN,
      )
    ) {
      return ELEVATOR_STATUS.UNKNOWN;
    }
    return ELEVATOR_STATUS.AVAILABLE;
  }

  private toBaseStationName(stationName: string): string {
    return stationName.replace(/\(\d+\)$/, '');
  }
}
