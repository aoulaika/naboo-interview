import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityModule } from './activity.module';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { TestModule, closeInMongodConnection } from 'src/test/test.module';

describe('ActivityService', () => {
  let service: ActivityService;
  let userService: UserService;
  let ownerId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, ActivityModule, UserModule],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    userService = module.get<UserService>(UserService);

    const user = await userService.createUser({
      email: 'activity-test@test.com',
      password: 'password',
      firstName: 'Test',
      lastName: 'User',
    });
    ownerId = user.id;
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates an activity with correct fields and populates owner', async () => {
      const activity = await service.create(ownerId, {
        name: 'Pottery',
        city: 'Nantes',
        description: 'Hand-made pottery',
        price: 45,
      });

      expect(activity.name).toBe('Pottery');
      expect(activity.city).toBe('Nantes');
      expect(activity.description).toBe('Hand-made pottery');
      expect(activity.price).toBe(45);
      // owner should be populated (object), not a raw ObjectId string
      expect((activity.owner as any).id).toBe(ownerId);
    });
  });

  describe('findOne', () => {
    it('retrieves an activity by id', async () => {
      const created = await service.create(ownerId, {
        name: 'Test Activity',
        city: 'Paris',
        description: 'A test activity',
        price: 50,
      });

      const fetched = await service.findOne(created.id);
      expect(fetched.id).toBe(created.id);
      expect(fetched.name).toBe('Test Activity');
    });

    it('throws NotFoundException for unknown id', async () => {
      await expect(service.findOne('000000000000000000000000')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('returns all activities sorted by createdAt descending', async () => {
      const before = await service.findAll();
      await service.create(ownerId, {
        name: 'New Activity',
        city: 'Rennes',
        description: 'Latest',
        price: 20,
      });
      const after = await service.findAll();

      expect(after.length).toBe(before.length + 1);
      // most recent first
      for (let i = 0; i < after.length - 1; i++) {
        expect(after[i].createdAt.getTime()).toBeGreaterThanOrEqual(
          after[i + 1].createdAt.getTime(),
        );
      }
    });
  });

  describe('findLatest', () => {
    it('returns at most 3 activities', async () => {
      const results = await service.findLatest();
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('returns the most recently created activities', async () => {
      const all = await service.findAll();
      const latest = await service.findLatest();
      // latest should match the first 3 of findAll (which is sorted desc)
      const topThreeIds = all.slice(0, 3).map((a) => a.id);
      expect(latest.map((a) => a.id)).toEqual(topThreeIds);
    });
  });

  describe('findByUser', () => {
    it('returns only activities owned by the given user', async () => {
      const otherUser = await userService.createUser({
        email: 'other@test.com',
        password: 'password',
        firstName: 'Other',
        lastName: 'User',
      });

      await service.create(otherUser.id, {
        name: 'Other Activity',
        city: 'Lyon',
        description: 'Belongs to other user',
        price: 10,
      });

      const results = await service.findByUser(ownerId);
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((a) => (a.owner as any).id === ownerId)).toBe(true);
    });

    it('returns empty array for user with no activities', async () => {
      const newUser = await userService.createUser({
        email: 'noactivities@test.com',
        password: 'pw',
        firstName: 'Empty',
        lastName: 'User',
      });
      const results = await service.findByUser(newUser.id);
      expect(results).toHaveLength(0);
    });
  });

  describe('findByIds', () => {
    it('returns activities matching the given ids', async () => {
      const a1 = await service.create(ownerId, {
        name: 'ByIds One',
        city: 'Lille',
        description: 'First',
        price: 15,
      });
      const a2 = await service.create(ownerId, {
        name: 'ByIds Two',
        city: 'Lille',
        description: 'Second',
        price: 25,
      });

      const results = await service.findByIds([a1.id, a2.id]);
      expect(results).toHaveLength(2);
      expect(results.map((a) => a.id)).toEqual(
        expect.arrayContaining([a1.id, a2.id]),
      );
    });

    it('returns empty array for empty id list', async () => {
      const results = await service.findByIds([]);
      expect(results).toHaveLength(0);
    });
  });

  describe('findCities', () => {
    it('returns distinct city names that include seeded cities', async () => {
      await service.create(ownerId, {
        name: 'City Test',
        city: 'Strasbourg',
        description: 'desc',
        price: 10,
      });

      const cities = await service.findCities();
      expect(cities).toContain('Strasbourg');
      // values are unique
      expect(new Set(cities).size).toBe(cities.length);
    });
  });

  describe('findByCity', () => {
    beforeAll(async () => {
      await service.create(ownerId, {
        name: 'Yoga',
        city: 'Bordeaux',
        description: 'Relaxing yoga',
        price: 30,
      });
      await service.create(ownerId, {
        name: 'Surf',
        city: 'Bordeaux',
        description: 'Surfing lesson',
        price: 80,
      });
    });

    it('returns all activities for a given city', async () => {
      const results = await service.findByCity('Bordeaux');
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.every((a) => a.city === 'Bordeaux')).toBe(true);
    });

    it('returns empty array for a city with no activities', async () => {
      const results = await service.findByCity('UnknownCity');
      expect(results).toHaveLength(0);
    });

    it('filters by name (case-insensitive)', async () => {
      const results = await service.findByCity('Bordeaux', 'yoga');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.every((a) => a.name.toLowerCase().includes('yoga'))).toBe(
        true,
      );
    });

    it('name filter does not match activities from another city', async () => {
      const results = await service.findByCity('Lyon', 'Yoga');
      expect(results.every((a) => a.city === 'Lyon')).toBe(true);
    });

    it('filters by maxPrice', async () => {
      const results = await service.findByCity('Bordeaux', undefined, 50);
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((a) => a.price <= 50)).toBe(true);
    });

    it('combines name and maxPrice filters', async () => {
      const results = await service.findByCity('Bordeaux', 'surf', 50);
      // Surf costs 80 so it should be excluded by maxPrice
      expect(results).toHaveLength(0);
    });
  });

  describe('countDocuments', () => {
    it('returns a non-negative number', async () => {
      const count = await service.countDocuments();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('increments after creating an activity', async () => {
      const before = await service.countDocuments();
      await service.create(ownerId, {
        name: 'Count Test',
        city: 'Grenoble',
        description: 'desc',
        price: 5,
      });
      const after = await service.countDocuments();
      expect(after).toBeGreaterThanOrEqual(before + 1);
    });
  });
});
