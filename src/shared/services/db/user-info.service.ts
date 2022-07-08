import mongoose from 'mongoose';
import { UserModel } from '@user/models/user.schema';
import { IBasicInfo, ISocialLinks } from '@user/interfaces/user.interface';

class UserInfo {
  public async updateUserInfo(userId: string, info: IBasicInfo): Promise<void> {
    await UserModel.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
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

  public async updateSocialLinks(userId: string, links: ISocialLinks): Promise<void> {
    await UserModel.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      {
        $set: { social: links }
      }
    ).exec();
  }
}

export const userInfoService: UserInfo = new UserInfo();
