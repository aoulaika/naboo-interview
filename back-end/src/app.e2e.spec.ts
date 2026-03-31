import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { BaseAppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { TestModule, closeInMongodConnection } from './test/test.module';

describe('App e2e', () => {
  let app: INestApplication;
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRATION_TIME = '3600';

    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, BaseAppModule],
    }).compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await closeInMongodConnection();
  });
  it('app should be defined', () => {
    expect(app).toBeDefined();
  });

  test('sign-up, sign-in, getMe', async () => {
    const email = randomUUID() + '@test.com';
    const password = randomUUID();

    const signUpResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation Register($input: SignUpInput!) {
            register(signUpInput: $input) {
              email
            }
          }
        `,
        variables: {
          input: {
            email,
            password,
            firstName: 'firstName',
            lastName: 'lastName',
          },
        },
      })
      .expect(200);

    expect(signUpResponse.body.data.register.email).toBe(email);

    const signInResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation Login($input: SignInInput!) {
            login(signInInput: $input) {
              access_token
            }
          }
        `,
        variables: { input: { email, password } },
      })
      .expect(200);

    const jwt = signInResponse.body.data.login.access_token;
    expect(jwt).toEqual(expect.any(String));

    const getMeResponse = await request(app.getHttpServer())
      .post('/graphql')
      .set('Cookie', `jwt=${jwt}`)
      .send({
        query: `
          query {
            getMe {
              id
              email
              firstName
              lastName
            }
          }
        `,
      })
      .expect(200);

    expect(getMeResponse.body.data.getMe).toMatchObject({
      id: expect.any(String),
      email,
      firstName: 'firstName',
      lastName: 'lastName',
    });
  });
});
