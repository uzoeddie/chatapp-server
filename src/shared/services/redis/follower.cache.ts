import _ from 'lodash';
import mongoose from 'mongoose';
import { BaseCache } from '@service/redis/base.cache';
import { Helpers } from '@global/helpers/helpers';
import { IFollowerData } from '@follower/interface/follower.interface';
import { ServerError } from '@global/helpers/error-handler';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import Logger from 'bunyan';
import { config } from '@root/config';

const log: Logger = config.createLogger('followersCache');
const userCache: UserCache = new UserCache();

export class FollowerCache extends BaseCache {
  constructor() {
    super('followersCache');
  }

  public async saveFollowerToCache(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LPUSH(key, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getFollowersFromCache(key: string): Promise<IFollowerData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response = await this.client.LRANGE(key, 0, -1);
      const list: IFollowerData[] = [];
      for (const item of response) {
        const user: IUserDocument = (await userCache.getUserFromCache(item)) as IUserDocument;
        const data: IFollowerData = {
          _id: new mongoose.Types.ObjectId(user._id),
          username: user.username!,
          avatarColor: user.avatarColor!,
          postCount: user.postsCount,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          profilePicture: user.profilePicture,
          uId: user.uId!,
          userProfile: user
        };
        list.push(data);
      }
      return list;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async removeFollowerFromCache(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LREM(key, 0, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async updateFollowersCountInCache(key: string, prop: string, value: number): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.HINCRBY(`users:${key}`, prop, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async updateBlockedUserPropInCache(key: string, prop: string, value: string, type: 'block' | 'unblock'): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string = (await this.client.HGET(`users:${key}`, prop)) as string;
      const multi = this.client.multi();
      let blocked: string[] = Helpers.parseJson(response) as string[];
      if (type === 'block') {
        blocked = [...blocked, value];
      } else {
        _.remove(blocked, (id: string) => id === value);
        blocked = [...blocked];
      }
      const dataToSave: string[] = [`${prop}`, JSON.stringify(blocked)];
      multi.HSET(`users:${key}`, dataToSave);
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
