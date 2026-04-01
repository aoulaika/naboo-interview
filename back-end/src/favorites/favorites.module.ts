import { Module } from '@nestjs/common';
import { ActivityModule } from 'src/activity/activity.module';
import { UserModule } from 'src/user/user.module';
import { FavoritesResolver } from './favorites.resolver';

@Module({
  imports: [UserModule, ActivityModule],
  providers: [FavoritesResolver],
})
export class FavoritesModule {}
