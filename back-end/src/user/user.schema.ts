import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true })
export class User extends Document {
  @Field(() => ID)
  id!: string;

  @Prop({ required: true, enum: ['user', 'admin'], default: 'user' })
  role!: 'user' | 'admin';

  @Field()
  @Prop({ required: true, trim: true })
  firstName!: string;

  @Field()
  @Prop({ required: true, trim: true })
  lastName!: string;

  @Field()
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    default: [],
  })
  favoriteActivityIds!: mongoose.Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
