import { BaseCache } from '@service/redis/base.cache';
import { ISocialLinks, IUserDocument } from '@user/interfaces/user.interface';
import { ServerError } from '@global/helpers/error-handler';
import { UserCache } from '@service/redis/user.cache';

type UserItem = string | number | null;

const userCache: UserCache = new UserCache();

export class UserInfoCache extends BaseCache {
  constructor() {
    super('userInfoCache');
  }

  public async updateSingleUserItemInCache(key: string, prop: string, value: UserItem): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      let dataToSave: string[] = [];
      if (prop === 'birthDay') {
        dataToSave = ['birthDay', JSON.stringify(value)];
      } else {
        dataToSave = [`${prop}`, `${value}`];
      }
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.HSET(`users:${key}`, dataToSave);
      await multi.exec();
      const response = await userCache.getUserFromCache(key);
      return response;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async updateUserInfoListInCache(key: string, prop: string, value: string | ISocialLinks): Promise<IUserDocument | null> {
    const dataToSave: string[] = [`${prop}`, JSON.stringify(value)];
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.HSET(`users:${key}`, dataToSave);
      const response = await userCache.getUserFromCache(key);
      return response;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }
}
