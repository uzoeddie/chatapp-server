import mongoose from 'mongoose';
import { ISearchUser } from '@chat/interfaces/chat.interface';
import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { BaseCache } from '@service/redis/base.cache';
import { INotificationSettings, ISocialLinks, IUserDocument } from '@user/interfaces/user.interface';
import _ from 'lodash';

export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }

  public async saveUserToCache(key: string, userId: string, createdUser: IUserDocument): Promise<void> {
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      createdAt,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageVersion,
      bgImageId,
      social
    } = createdUser;
    const firstList: string[] = [
      '_id',
      `${_id}`,
      'uId',
      `${uId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'createdAt',
      `${createdAt}`,
      'postsCount',
      `${postsCount}`
    ];
    const secondList: string[] = [
      'blocked',
      JSON.stringify(blocked),
      'blockedBy',
      JSON.stringify(blockedBy),
      'profilePicture',
      `${profilePicture}`,
      'followersCount',
      `${followersCount}`,
      'followingCount',
      `${followingCount}`,
      'notifications',
      JSON.stringify(notifications),
      'social',
      JSON.stringify(social)
    ];
    const thirdList: string[] = [
      'work',
      `${work}`,
      'location',
      `${location}`,
      'school',
      `${school}`,
      'quote',
      `${quote}`,
      'bgImageVersion',
      `${bgImageVersion}`,
      'bgImageId',
      `${bgImageId}`
    ];
    const dataToSave: string[] = [...firstList, ...secondList, ...thirdList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.ZADD('user', { score: userId, value: `${key}` });
      await this.client.HSET(`users:${key}`, dataToSave);
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUserFromCache(key: string): Promise<IUserDocument> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response: IUserDocument = await this.client.HGETALL(`users:${key}`);
      response.createdAt = new Date(Helpers.parseJson(`${response.createdAt}`) as Date);
      response.postsCount = Helpers.parseJson(`${response.postsCount}`) as number;
      response.blocked = Helpers.parseJson(`${response.blocked}`) as mongoose.Types.ObjectId[];
      response.blockedBy = Helpers.parseJson(`${response.blockedBy}`) as mongoose.Types.ObjectId[];
      response.work = Helpers.parseJson(response.work) as string;
      response.school = Helpers.parseJson(response.school) as string;
      response.location = Helpers.parseJson(response.location) as string;
      response.quote = Helpers.parseJson(response.quote) as string;
      response.notifications = Helpers.parseJson(`${response.notifications}`) as INotificationSettings;
      response.social = Helpers.parseJson(`${response.social}`) as ISocialLinks;
      response.followersCount = Helpers.parseJson(`${response.followersCount}`) as number;
      response.followingCount = Helpers.parseJson(`${response.followingCount}`) as number;

      return response;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUsersFromCache(start: number, end: number, excludedKey: string): Promise<IUserDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[]  = await this.client.ZRANGE('user', start, end, { BY: 'SCORE', REV: true });
      const multi = this.client.multi();
      for (const key of response) {
        if (key !== excludedKey) {
          multi.HGETALL(`users:${key}`);
        }
      }
      const replies: IUserDocument[] = await multi.exec();
      for (const reply of replies) {
        reply.createdAt = new Date(Helpers.parseJson(`${reply.createdAt}`) as Date);
        reply.postsCount = Helpers.parseJson(`${reply.postsCount}`) as number;
        reply.blocked = Helpers.parseJson(`${reply.blocked}`) as mongoose.Types.ObjectId[];
        reply.blockedBy = Helpers.parseJson(`${reply.blockedBy}`) as mongoose.Types.ObjectId[];
        reply.work = Helpers.parseJson(reply.work) as string;
        reply.school = Helpers.parseJson(reply.school) as string;
        reply.location = Helpers.parseJson(reply.location) as string;
        reply.quote = Helpers.parseJson(reply.quote) as string;
        reply.notifications = Helpers.parseJson(`${reply.notifications}`) as INotificationSettings;
        reply.social = Helpers.parseJson(`${reply.social}`) as ISocialLinks;
        reply.followersCount = Helpers.parseJson(`${reply.followersCount}`) as number;
        reply.followingCount = Helpers.parseJson(`${reply.followingCount}`) as number;
      }
      return replies;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getTotalUsersCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCARD('user');
      return count;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getRandomUsersFromCache(excludedKey: string): Promise<IUserDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const replies = [];
      const followers: string[] = await this.client.LRANGE(`followers:${excludedKey}`, 0, -1);
      const users: string[] = await this.client.ZRANGE('user', 0, -1);
      const excludedKeyIndex = _.indexOf(users, excludedKey);
      users.splice(excludedKeyIndex, 1);
      const randomUsers: string[] = Helpers.shuffle(users).slice(0, 10);
      for (const key of randomUsers) {
        const followerIndex = _.indexOf(followers, key);
        if (followerIndex < 0) {
          const userHash: IUserDocument = await this.client.HGETALL(`users:${key}`);
          replies.push(userHash);
        }
      }
      for (const reply of replies) {
        reply.createdAt = new Date(Helpers.parseJson(`${reply.createdAt}`) as Date);
        reply.postsCount = Helpers.parseJson(`${reply.postsCount}`) as number;
        reply.blocked = Helpers.parseJson(`${reply.blocked}`) as mongoose.Types.ObjectId[];
        reply.blockedBy = Helpers.parseJson(`${reply.blockedBy}`) as mongoose.Types.ObjectId[];
        reply.work = Helpers.parseJson(reply.work) as string;
        reply.school = Helpers.parseJson(reply.school) as string;
        reply.location = Helpers.parseJson(reply.location) as string;
        reply.quote = Helpers.parseJson(reply.quote) as string;
        reply.notifications = Helpers.parseJson(`${reply.notifications}`) as INotificationSettings;
        reply.social = Helpers.parseJson(`${reply.social}`) as ISocialLinks;
        reply.followersCount = Helpers.parseJson(`${reply.followersCount}`) as number;
        reply.followingCount = Helpers.parseJson(`${reply.followingCount}`) as number;
      }
      return replies;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async searchForUserInCache(query: string, excludedKey: string): Promise<ISearchUser[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const results = await this.client.ft.search('idx:users', `@username:${query}*`);
      const searchedUsers: ISearchUser[] = [] as ISearchUser[];
      for (const result of results.documents) {
        if (result.value._id !== excludedKey) {
          const user = {
            _id: result.value._id,
            email: result.value.email,
            username: result.value.username,
            avatarColor: result.value.avatarColor,
            profilePicture: result.value.profilePicture
          };
          searchedUsers.push(user);
        }
      }

      return searchedUsers;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async updateNotificationSettingsInCache(key: string, prop: string, value: INotificationSettings): Promise<void> {
    const dataToSave: string[] = [`${prop}`, JSON.stringify(value)];
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.HSET(`users:${key}`, dataToSave);
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }
}
