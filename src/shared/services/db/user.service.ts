import { IUserDocument, INotificationSettings } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import { followerService } from '@service/db/follower.service';
import {indexOf} from 'lodash';
import { ISearchUser } from '@chat/interfaces/chat.interface';
import { Helpers } from '@global/helpers/helpers';

class User {
  public async addUserDataToDB(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }

  public async updateNotificationSettings(username: string, settings: INotificationSettings): Promise<void> {
    await UserModel.updateOne({ username }, { $set: { notifications: settings } }, { upsert: true }).exec();
  }

  public async getUserById(userId: string): Promise<IUserDocument> {
    const user: IUserDocument = (await UserModel.findById({ _id: userId }).exec()) as IUserDocument;
    return user;
  }

  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IUserDocument> {
    const query = {
      $or: [{ username: Helpers.firstLetterUppercase(username) }, { email: Helpers.lowerCase(email) }]
    };
    const user: IUserDocument = await UserModel.findOne(query).exec()as IUserDocument;
    return user;
  }

  public async getUserByUsername(username: string): Promise<IUserDocument> {
    const user: IUserDocument = await UserModel.findOne({ username }).exec() as IUserDocument;
    return user;
  }

  public async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { password: hashedPassword } }).exec();
  }

  public async usersCount(): Promise<number> {
    const totalCount = await UserModel.find({}).countDocuments();
    return totalCount;
  }

  public async getAllUsers(userId: string, skip: number, limit: number): Promise<IUserDocument[]> {
    const users = await UserModel.find({ _id: { $ne: userId } })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    return users;
  }

  public async getRandomUsers(userId: string, username: string): Promise<IUserDocument[]> {
    const randomUsers: IUserDocument[] = [];
    const users = await UserModel.aggregate([
      { $match: { username: { $not: { $eq: username } } } },
      { $sample: { size: 10 } }
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
    const users = await UserModel.aggregate([
      { $match: { username: regex } },
      {
        $project: {
          _id: 1,
          username: 1,
          email: 1,
          avatarColor: 1,
          profilePicture: 1
        }
      }
    ]);
    return users;
  }
}

export const userService: User = new User();
