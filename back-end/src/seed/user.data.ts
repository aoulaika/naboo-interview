import { User } from 'src/user/user.schema';

export const user = {
  email: process.env.USER_EMAIL || 'user1@test.fr',
  password: process.env.USER_PASSWORD || 'user1',
  firstName: 'John',
  lastName: 'Doe',
};

export const admin = {
  email: process.env.ADMIN_EMAIL || 'admin@test.fr',
  password: process.env.ADMIN_PASSWORD || 'admin',
  firstName: 'Admin',
  lastName: 'Boss',
  role: 'admin' as User['role'],
};
