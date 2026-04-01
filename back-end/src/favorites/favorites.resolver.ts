import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  ResolveField,
  Parent,
  ID,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { ContextWithJWTPayload } from 'src/auth/types/context';
import { UserService } from 'src/user/user.service';
import { ActivityService } from 'src/activity/activity.service';
import { Activity } from 'src/activity/activity.schema';
import { FavoriteList } from './favorites.schema';

@Resolver(() => FavoriteList)
export class FavoritesResolver {
  constructor(
    private readonly userService: UserService,
    private readonly activityService: ActivityService,
  ) {}

  @ResolveField(() => ID)
  id(@Parent() favoriteList: FavoriteList): string {
    return favoriteList.userId;
  }

  @Query(() => FavoriteList)
  @UseGuards(AuthGuard)
  async getFavorites(
    @Context() context: ContextWithJWTPayload,
  ): Promise<FavoriteList> {
    const userId = context.jwtPayload.id;
    const activityIds = await this.userService.getFavoriteActivityIds(userId);
    return { userId, activityIds };
  }

  @Mutation(() => FavoriteList)
  @UseGuards(AuthGuard)
  async addFavorite(
    @Context() context: ContextWithJWTPayload,
    @Args('activityId') activityId: string,
  ): Promise<FavoriteList> {
    const userId = context.jwtPayload.id;
    const activityIds = await this.userService.addFavorite(userId, activityId);
    return { userId, activityIds };
  }

  @Mutation(() => FavoriteList)
  @UseGuards(AuthGuard)
  async removeFavorite(
    @Context() context: ContextWithJWTPayload,
    @Args('activityId') activityId: string,
  ): Promise<FavoriteList> {
    const userId = context.jwtPayload.id;
    const activityIds = await this.userService.removeFavorite(userId, activityId);
    return { userId, activityIds };
  }

  @Mutation(() => FavoriteList)
  @UseGuards(AuthGuard)
  async reorderFavorites(
    @Context() context: ContextWithJWTPayload,
    @Args('orderedIds', { type: () => [String] }) orderedIds: string[],
  ): Promise<FavoriteList> {
    const userId = context.jwtPayload.id;
    const activityIds = await this.userService.reorderFavorites(userId, orderedIds);
    return { userId, activityIds };
  }

  @ResolveField(() => [Activity])
  async activities(@Parent() favoriteList: FavoriteList): Promise<Activity[]> {
    if (favoriteList.activityIds.length === 0) return [];
    const activities = await this.activityService.findByIds(favoriteList.activityIds);
    // Preserve user-defined order
    const map = new Map(activities.map((a) => [a._id.toString(), a]));
    return favoriteList.activityIds
      .map((id) => map.get(id))
      .filter((a): a is Activity => !!a);
  }
}
