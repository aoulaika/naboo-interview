import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity } from './activity.schema';
import { CreateActivityInput } from './activity.inputs.dto';

const escapeRegex = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name)
    private activityModel: Model<Activity>,
  ) {}

  async findAll(): Promise<Activity[]> {
    return this.activityModel
      .find()
      .populate('owner')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findLatest(): Promise<Activity[]> {
    return this.activityModel
      .find()
      .populate('owner')
      .sort({ createdAt: -1 })
      .limit(3)
      .exec();
  }

  async findByUser(userId: string): Promise<Activity[]> {
    return this.activityModel
      .find({ owner: userId })
      .populate('owner')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityModel
      .findById(id)
      .populate('owner')
      .exec();
    if (!activity) throw new NotFoundException();
    return activity;
  }

  async findByIds(ids: string[]): Promise<Activity[]> {
    return this.activityModel
      .find({ _id: { $in: ids } })
      .populate('owner')
      .exec();
  }

  async create(userId: string, data: CreateActivityInput): Promise<Activity> {
    const activity = await this.activityModel.create({
      ...data,
      owner: userId,
    });
    return activity.populate('owner');
  }

  async findCities(): Promise<string[]> {
    return this.activityModel.distinct('city').exec();
  }

  async findByCity(
    city: string,
    name?: string,
    maxPrice?: number,
  ): Promise<Activity[]> {
    const filter: Record<string, unknown> = { city };
    if (maxPrice) filter['price'] = { $lte: maxPrice };
    if (name) filter['name'] = { $regex: escapeRegex(name), $options: 'i' };

    return this.activityModel.find(filter).populate('owner').exec();
  }

  async countDocuments(): Promise<number> {
    return this.activityModel.estimatedDocumentCount().exec();
  }
}
