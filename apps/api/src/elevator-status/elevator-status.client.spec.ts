import { ConfigService } from '@nestjs/config';
import { ElevatorStatusClient } from './elevator-status.client.js';

describe('ElevatorStatusClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('서울 API 응답을 1시간 캐시한다', async () => {
    const configService = {
      get: vi.fn().mockReturnValue('test-service-key'),
    } as unknown as ConfigService;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          SeoulMetroFaciInfo: {
            list_total_count: 1,
            RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리되었습니다' },
            row: [
              {
                STN_CD: '2543',
                STN_NM: '답십리(5)',
                ELVTR_NM: '내부 엘리베이터',
                OPR_SEC: 'B2-B3',
                INSTL_PSTN: '승강장',
                USE_YN: '사용가능',
                ELVTR_SE: 'EV',
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const client = new ElevatorStatusClient(configService);

    const first = await client.getSnapshot();
    const second = await client.getSnapshot();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
  });

  it('동시에 들어온 첫 조회를 하나의 외부 요청으로 합친다', async () => {
    const configService = {
      get: vi.fn().mockReturnValue('test-service-key'),
    } as unknown as ConfigService;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          SeoulMetroFaciInfo: {
            list_total_count: 0,
            RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리되었습니다' },
            row: [],
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const client = new ElevatorStatusClient(configService);

    await Promise.all([client.getSnapshot(), client.getSnapshot()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
