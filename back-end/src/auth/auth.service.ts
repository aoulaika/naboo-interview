import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { MongoServerError } from 'mongodb';

import { User } from 'src/user/user.schema';
import { UserService } from '../user/user.service';
import { SignInDto, SignInInput, SignUpInput, JwtPayload } from './types';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn({ email, password }: SignInInput): Promise<SignInDto> {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Wrong credentials provided');

    const isSamePassword = await bcrypt.compare(password, user.password);

    if (!isSamePassword)
      throw new UnauthorizedException('Wrong credentials provided');

    const token = await this.generateToken({ user });

    return { access_token: token };
  }

  async generateToken({ user }: { user: User }): Promise<string> {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return this.jwtService.signAsync(payload);
  }

  async signUp({
    email,
    password,
    firstName,
    lastName,
  }: SignUpInput): Promise<User> {
    try {
      return this.userService.createUser({
        email,
        password,
        firstName,
        lastName,
      });
    } catch (error: MongoServerError | any) {
      if (error.code === 11000) {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }
}
