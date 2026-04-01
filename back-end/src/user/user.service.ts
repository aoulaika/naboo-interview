import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { SignUpInput } from 'src/auth/types';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async getById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(
    data: SignUpInput & {
      role?: User['role'];
    },
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new this.userModel({ ...data, password: hashedPassword });
    return user.save();
  }

  async countDocuments(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async getFavoriteActivityIds(userId: string): Promise<string[]> {
    const user = await this.userModel
      .findById(userId)
      .select('favoriteActivityIds')
      .lean()
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return (user.favoriteActivityIds ?? []).map((id) => id.toString());
  }

  async addFavorite(userId: string, activityId: string): Promise<string[]> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { favoriteActivityIds: new mongoose.Types.ObjectId(activityId) } },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user.favoriteActivityIds.map((id) => id.toString());
  }

  async removeFavorite(userId: string, activityId: string): Promise<string[]> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { favoriteActivityIds: new mongoose.Types.ObjectId(activityId) } },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user.favoriteActivityIds.map((id) => id.toString());
  }

  async reorderFavorites(userId: string, orderedIds: string[]): Promise<string[]> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { favoriteActivityIds: orderedIds.map((id) => new mongoose.Types.ObjectId(id)) },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user.favoriteActivityIds.map((id) => id.toString());
  }

  async setDebugMode({
    userId,
    enabled,
  }: {
    userId: string;
    enabled: boolean;
  }): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        debugModeEnabled: enabled,
      },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
