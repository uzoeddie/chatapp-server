import mongoose from 'mongoose';
import { UserModel } from '@user/models/user.schema';

class UserInfo {
  public async updateUserInfo(userId: string, info: any): Promise<void> {
    await UserModel.updateOne(
      { _id: mongoose.Types.ObjectId(userId) },
      {
        $set: {
          work: info['work'],
          school: info['school'],
          location: info['location'],
          quote: info['quote']
        }
      }
    ).exec();
  }

  public async updateSocialLinks(userId: string, links: any): Promise<void> {
    await UserModel.updateOne(
      { _id: mongoose.Types.ObjectId(userId) },
      {
        $set: { social: links }
      }
    ).exec();
  }
}

export const userInfoService: UserInfo = new UserInfo();
