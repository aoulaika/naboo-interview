import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { SignInDto, SignInInput, SignUpInput } from './types';
import { AuthService } from './auth.service';
import { User } from 'src/user/user.schema';
import { ContextWithJWTPayload } from './types/context';

const cookieOptions = () => ({
  path: '/',
  httpOnly: true,
  sameSite: 'strict' as const,
  domain: process.env.FRONTEND_DOMAIN,
  secure: process.env.NODE_ENV === 'production',
});

@Resolver('Auth')
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => SignInDto)
  async login(
    @Args('signInInput') loginUserDto: SignInInput,
    @Context() ctx: ContextWithJWTPayload,
  ): Promise<SignInDto> {
    const data = await this.authService.signIn(loginUserDto);
    ctx.res.cookie('jwt', data.access_token, cookieOptions());

    return data;
  }

  @Mutation(() => User)
  async register(
    @Args('signUpInput') createUserDto: SignUpInput,
  ): Promise<User> {
    return this.authService.signUp(createUserDto);
  }

  @Mutation(() => Boolean)
  async logout(@Context() ctx: ContextWithJWTPayload): Promise<boolean> {
    ctx.res.clearCookie('jwt', cookieOptions());
    return true;
  }
}
