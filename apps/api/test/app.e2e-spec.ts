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
          ELVTR_NM: '답십리 내부 엘리베이터',
          OPR_SEC: 'B2-B3',
          INSTL_PSTN: '상일동 방면 승강장',
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
      overallStatus: 'available',
      maxSourceDelayMinutes: 60,
    });
    expect(response.body.elevators).toHaveLength(1);
  });

  it('/elevator-status/stations/:stationCode rejects an invalid code', () => {
    return request(app.getHttpServer())
      .get('/elevator-status/stations/not-a-code')
      .expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});
