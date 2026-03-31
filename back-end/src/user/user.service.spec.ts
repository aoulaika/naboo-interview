import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { randomUUID } from 'crypto';
import { TestModule, closeInMongodConnection } from 'src/test/test.module';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let userService: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, UserModule],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('createUser', () => {
    it('creates a user and returns it with hashed password', async () => {
      const email = `${randomUUID()}@test.com`;
      const user = await userService.createUser({
        email,
        password: 'plaintext',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(user.email).toBe(email);
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.role).toBe('user');
      // password must be stored hashed, never in plaintext
      expect(user.password).not.toBe('plaintext');
      expect(await bcrypt.compare('plaintext', user.password)).toBe(true);
    });

    it('stores email in lowercase', async () => {
      const base = randomUUID();
      const user = await userService.createUser({
        email: `${base}@TEST.COM`,
        password: 'pw',
        firstName: 'A',
        lastName: 'B',
      });
      expect(user.email).toBe(`${base}@test.com`);
    });

    it('creates a user with admin role when specified', async () => {
      const user = await userService.createUser({
        email: `${randomUUID()}@test.com`,
        password: 'pw',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      });
      expect(user.role).toBe('admin');
    });

    it('throws on duplicate email', async () => {
      const email = `${randomUUID()}@test.com`;
      await userService.createUser({
        email,
        password: 'pw',
        firstName: 'First',
        lastName: 'User',
      });
      await expect(
        userService.createUser({
          email,
          password: 'pw',
          firstName: 'Second',
          lastName: 'User',
        }),
      ).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('returns the user for a valid id', async () => {
      const email = `${randomUUID()}@test.com`;
      const created = await userService.createUser({
        email,
        password: 'password',
        firstName: 'firstName',
        lastName: 'lastName',
      });

      const fetched = await userService.getById(created.id);

      expect(fetched).toMatchObject({
        email,
        firstName: 'firstName',
        lastName: 'lastName',
      });
    });

    it('throws NotFoundException for unknown id', async () => {
      await expect(
        userService.getById('000000000000000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('returns the user matching the email', async () => {
      const email = `${randomUUID()}@test.com`;
      const created = await userService.createUser({
        email,
        password: 'pw',
        firstName: 'Find',
        lastName: 'Me',
      });

      const found = await userService.findByEmail(email);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it('is case-insensitive', async () => {
      const base = randomUUID();
      await userService.createUser({
        email: `${base}@test.com`,
        password: 'pw',
        firstName: 'Case',
        lastName: 'Test',
      });

      const found = await userService.findByEmail(`${base}@TEST.COM`);
      expect(found).not.toBeNull();
    });

    it('returns null for unknown email', async () => {
      const result = await userService.findByEmail('nobody@nowhere.com');
      expect(result).toBeNull();
    });
  });

  describe('countDocuments', () => {
    it('returns a non-negative number', async () => {
      const count = await userService.countDocuments();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('increments after creating a user', async () => {
      const before = await userService.countDocuments();
      await userService.createUser({
        email: `${randomUUID()}@test.com`,
        password: 'pw',
        firstName: 'Count',
        lastName: 'Test',
      });
      const after = await userService.countDocuments();
      expect(after).toBe(before + 1);
    });
  });

  describe('setDebugMode', () => {
    it('throws NotFoundException for unknown userId', async () => {
      await expect(
        userService.setDebugMode({
          userId: '000000000000000000000000',
          enabled: true,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
