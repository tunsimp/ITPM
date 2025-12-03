import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Money (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('CRUD flow for money', async () => {
    // create
    const createRes = await request(app.getHttpServer())
      .post('/money')
      .send({ name: 'Test Wallet', amount: 99, description: 'testing' })
      .expect(201);

    expect(createRes.body.success).toBe(true);
    const created = createRes.body.item;
    expect(created).toHaveProperty('id');

    // get all
    const allRes = await request(app.getHttpServer()).get('/money').expect(200);
    expect(allRes.body.success).toBe(true);
    expect(Array.isArray(allRes.body.items)).toBe(true);

    // get one
    const oneRes = await request(app.getHttpServer())
      .get(`/money/${created.id}`)
      .expect(200);
    expect(oneRes.body.item.id).toBe(created.id);

    // update
    const updRes = await request(app.getHttpServer())
      .patch(`/money/${created.id}`)
      .send({ amount: 200 })
      .expect(200);
    expect(updRes.body.item.amount).toBe(200);

    // delete
    await request(app.getHttpServer()).delete(`/money/${created.id}`).expect(200);

    // should now return 404 when fetching deleted
    await request(app.getHttpServer()).get(`/money/${created.id}`).expect(404);
  });
});
