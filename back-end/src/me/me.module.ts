import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { AdminGuard } from 'src/auth/admin.guard';
import { MeResolver } from './resolver/me.resolver';

@Module({
  imports: [UserModule, AuthModule],
  providers: [MeResolver, AdminGuard],
})
export class MeModule {}
