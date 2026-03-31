import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

@InputType()
export class CreateActivityInput {
  @Field()
  @IsNotEmpty()
  name!: string;

  @Field()
  @IsNotEmpty()
  city!: string;

  @Field()
  @IsNotEmpty()
  description!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  price!: number;
}
