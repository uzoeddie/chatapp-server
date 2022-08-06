import { IUserDocument, INotificationSettings } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import { followerService } from '@service/db/follower.service';
import { indexOf } from 'lodash';
import { ISearchUser } from '@chat/interfaces/chat.interface';
import mongoose from 'mongoose';
import { AuthModel } from '@auth/models/auth.schema';

class User {
  public async addUserDataToDB(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }

  public async updateNotificationSettings(username: string, settings: INotificationSettings): Promise<void> {
    await UserModel.updateOne({ username }, { $set: { notifications: settings } }, { upsert: true }).exec();
  }

  public async getUserById(userId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      {
        $project: this.aggregateProject()
      }
    ]);
    return users[0];
  }

  public async getUserByUsername(username: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { username } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      {
        $project: this.aggregateProject()
      }
    ]);
    return users[0];
  }

  public async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { password: hashedPassword } }).exec();
  }

  public async usersCount(): Promise<number> {
    const totalCount = await UserModel.find({}).countDocuments();
    return totalCount;
  }

  public async getAllUsers(userId: string, skip: number, limit: number): Promise<IUserDocument[]> {
    const users = await UserModel.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
      { $skip: skip },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      {
        $project: this.aggregateProject()
      }
    ]);
    return users;
  }

  public async getRandomUsers(userId: string): Promise<IUserDocument[]> {
    const randomUsers: IUserDocument[] = [];
    const users = await UserModel.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      { $sample: { size: 10 } },
      {
        $addFields: {
          username: '$authId.username',
          email: '$authId.email',
          avatarColor: '$authId.avatarColor',
          uId: '$authId.uId',
          createdAt: '$authId.createdAt',
        }
      },
      {
        $project: {
          authId: 0,
          __v: 0
        }
      }
    ]);
    const followers: string[] = await followerService.getFolloweeIds(`${userId}`);
    for (const user of users) {
      const followerIndex = indexOf(followers, user._id.toString());
      if (followerIndex < 0) {
        randomUsers.push(user);
      }
    }
    return randomUsers;
  }

  public async searchUsers(regex: RegExp): Promise<ISearchUser[]> {
    const users = await AuthModel.aggregate([
      { $match: { username: regex } },
      { $lookup: { from: 'User', localField: '_id', foreignField: 'authId', as: 'id' } },
      { $unwind: '$id' },
      {
        $project: {
          _id: '$id._id',
          username: 1,
          email: 1,
          avatarColor: 1,
          profilePicture: 1
        }
      }
    ]);
    return users;
  }

  private aggregateProject() {
    return {
      _id: 1,
      username: '$authId.username',
      email: '$authId.email',
      uId: '$authId.uId',
      createdAt: '$authId.createdAt',
      avatarColor: '$authId.avatarColor',
      profilePicture: 1,
      postsCount: 1,
      followersCount: 1,
      followingCount: 1,
      blocked: 1,
      blockedBy: 1,
      notifications: 1,
      social: 1,
      work: 1,
      school: 1,
      location: 1,
      quote: 1,
      bgImageVersion: 1,
      bgImageId: 1
    };
  }
}

export const userService: User = new User();
