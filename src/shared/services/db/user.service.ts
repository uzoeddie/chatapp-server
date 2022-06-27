import { IUserDocument, INotificationSettings } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';

class User {
  public async addUserDataToDB(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }

  public async updateNotificationSettings(username: string, settings: INotificationSettings): Promise<void> {
    await UserModel.updateOne({ username }, { $set: { notifications: settings } }, { upsert: true }).exec();
  }
}

export const userService: User = new User();
