import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { CreateHospitalDto } from '@/hospital/dto/create-hospital.dto';
import prisma from './helpers/prisma';
import { AppModule } from '@/app.module';
import { customCreateMock } from './utils';
import { configureApp } from '@utils/configureApp';

describe('HospitalController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .useMocker(customCreateMock)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('/api/hospital', () => {
    describe('[post] /', () => {
      it('should respond with a `201` status code and hospital entity', async () => {
        const createHospitalDto: CreateHospitalDto = {
          name: 'Victors hospital',
          address: '221 Baker Street',
        };

        const { status, body } = await request(app.getHttpServer())
          .post('/api/hospital')
          .send(createHospitalDto);
        const newHospital = await prisma.hospital.findFirst();

        expect(status).toBe(201);
        expect(newHospital).not.toBeNull();
        expect(body.name).toBe(createHospitalDto.name);
      });

      it('should respond with a `400` status code when compulsory details are omitted', async () => {
        const incompleteDto = {
          name: '',
        };

        const { status, body: _body } = await request(app.getHttpServer())
          .post('/api/hospital')
          .send(incompleteDto);

        expect(status).toBe(400);
      });
    });
  });
});
