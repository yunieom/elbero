import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { ElevatorStatusClient } from '../src/elevator-status/elevator-status.client.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const elevatorStatusClient = {
    getSnapshot: vi.fn().mockResolvedValue({
      checkedAt: '2026-09-17T12:00:00.000Z',
      expiresAt: Date.now() + 60_000,
      rows: [
        {
          STN_CD: '2543',
          STN_NM: '답십리(5)',
          ELVTR_NM: '승강기)엘리베이터-답십리 내부2',
          OPR_SEC: 'B2-B3',
          INSTL_PSTN: '장한평 방면5-1',
          USE_YN: '사용가능',
          ELVTR_SE: 'EV',
        },
        {
          STN_CD: '2543',
          STN_NM: '답십리(5)',
          ELVTR_NM: '승강기)엘리베이터-답십리 외부3',
          OPR_SEC: 'B2-1F',
          INSTL_PSTN: '2번 출입구',
          USE_YN: '사용가능',
          ELVTR_SE: 'EV',
        },
        {
          STN_CD: '2543',
          STN_NM: '답십리(5)',
          ELVTR_NM: '승강기)엘리베이터-답십리 외부4',
          OPR_SEC: 'B2-1F',
          INSTL_PSTN: '6번 출입구',
          USE_YN: '사용가능',
          ELVTR_SE: 'EV',
        },
        {
          STN_CD: '2549',
          STN_NM: '강동(5)',
          ELVTR_NM: '승강기)엘리베이터-강동 내부 1호기',
          OPR_SEC: 'B3-B4',
          INSTL_PSTN: '둔촌동 방면8-3',
          USE_YN: '사용가능',
          ELVTR_SE: 'EV',
        },
        {
          STN_CD: '2549',
          STN_NM: '강동(5)',
          ELVTR_NM: '승강기)엘리베이터-강동 외부 2호기',
          OPR_SEC: 'B3-1F',
          INSTL_PSTN: '1번 출입구',
          USE_YN: '사용가능',
          ELVTR_SE: 'EV',
        },
      ],
    }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ElevatorStatusClient)
      .useValue(elevatorStatusClient)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok', service: 'elbero-api' });
  });

  it('/elevator-status/stations/:stationCode (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/elevator-status/stations/2543')
      .expect(200);

    expect(response.body).toMatchObject({
      stationCode: '2543',
      stationName: '답십리',
      overallStatus: 'operational',
      maxSourceDelayMinutes: 60,
    });
    expect(response.body.elevators).toHaveLength(3);
  });

  it('/elevator-status/stations/:stationCode rejects an invalid code', () => {
    return request(app.getHttpServer())
      .get('/elevator-status/stations/not-a-code')
      .expect(400);
  });

  it('/journeys/plan combines verified paths and elevator statuses', async () => {
    const response = await request(app.getHttpServer())
      .get('/journeys/plan')
      .query({ originStationCode: '2543', destinationStationCode: '2549' })
      .expect(200);

    expect(response.body).toMatchObject({
      journeyId: 'dapsimni-to-gangdong',
      recommendedRouteId: 'line-5-direct',
    });
    expect(response.body.candidates[0].status).toBe('operational');
  });

  it('/journeys/plan rejects an unsupported journey', () => {
    return request(app.getHttpServer())
      .get('/journeys/plan')
      .query({ originStationCode: '2543', destinationStationCode: '9999' })
      .expect(422);
  });

  afterEach(async () => {
    await app.close();
  });
});
