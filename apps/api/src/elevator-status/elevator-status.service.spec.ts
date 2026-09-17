import { NotFoundException } from '@nestjs/common';
import { ElevatorStatusClient } from './elevator-status.client.js';
import { ElevatorStatusService } from './elevator-status.service.js';
import { ELEVATOR_STATUS } from './types/seoul-elevator-status.type.js';

describe('ElevatorStatusService', () => {
  const checkedAt = '2026-09-17T12:00:00.000Z';
  const getSnapshot = vi.fn();
  const client = { getSnapshot } as unknown as ElevatorStatusClient;
  const service = new ElevatorStatusService(client);

  beforeEach(() => {
    getSnapshot.mockReset();
  });

  it('3자리 역 코드를 정규화하고 엘리베이터만 반환한다', async () => {
    getSnapshot.mockResolvedValue({
      checkedAt,
      expiresAt: Date.now() + 60_000,
      rows: [
        {
          STN_CD: '0205',
          STN_NM: '동대문역사문화공원(2)',
          ELVTR_NM: '외부 엘리베이터',
          OPR_SEC: 'B1-1F',
          INSTL_PSTN: '1번 출입구',
          USE_YN: '사용가능',
          ELVTR_SE: 'EV',
        },
        {
          STN_CD: '0205',
          STN_NM: '동대문역사문화공원(2)',
          ELVTR_NM: '에스컬레이터',
          OPR_SEC: 'B1-1F',
          INSTL_PSTN: '3번 출입구',
          USE_YN: '보수중',
          ELVTR_SE: 'ES',
        },
      ],
    });

    const result = await service.getStationStatus('205');

    expect(result.stationCode).toBe('0205');
    expect(result.stationName).toBe('동대문역사문화공원');
    expect(result.overallStatus).toBe(ELEVATOR_STATUS.OPERATIONAL);
    expect(result.elevators).toHaveLength(1);
    expect(result.checkedAt).toBe(checkedAt);
  });

  it('엘리베이터 한 대라도 보수중이면 역 종합 상태를 운행 중지로 표시한다', async () => {
    getSnapshot.mockResolvedValue({
      checkedAt,
      expiresAt: Date.now() + 60_000,
      rows: [
        {
          STN_CD: '2543',
          STN_NM: '답십리(5)',
          ELVTR_NM: '내부 엘리베이터',
          OPR_SEC: 'B2-B3',
          INSTL_PSTN: '승강장',
          USE_YN: '보수중',
          ELVTR_SE: 'EV',
        },
      ],
    });

    const result = await service.getStationStatus('2543');

    expect(result.overallStatus).toBe(ELEVATOR_STATUS.OUT_OF_SERVICE);
    expect(result.elevators[0].status).toBe(ELEVATOR_STATUS.OUT_OF_SERVICE);
  });

  it('역 코드가 없으면 404 예외를 던진다', async () => {
    getSnapshot.mockResolvedValue({
      checkedAt,
      expiresAt: Date.now() + 60_000,
      rows: [],
    });

    await expect(service.getStationStatus('9999')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
