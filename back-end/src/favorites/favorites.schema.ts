import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Activity } from 'src/activity/activity.schema';

@ObjectType()
export class FavoriteList {
  @Field(() => ID)
  userId!: string;

  // Resolved via @ResolveField in FavoritesResolver
  @Field(() => [Activity])
  activities?: Activity[];

  // Not exposed in GraphQL — used internally to preserve order
  activityIds!: string[];
}
