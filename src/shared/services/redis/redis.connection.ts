import { BaseCache } from '@service/redis/base.cache';
import { SchemaFieldTypes } from 'redis';
// import { UserCache } from './user.cache';

class RedisConnection extends BaseCache {
  constructor() {
    super('redisConnection');
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      // const userCache = new UserCache();
      // userCache.init();
      const ping = await this.client.ping();
      console.log(ping);
      this.createUserHashIndex();
    } catch (error) {
      console.log(error);
    }
  }

  private async createUserHashIndex() {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      // Documentation: https://oss.redis.com/redisearch/Commands/#ftcreate
      await this.client.ft.create(
        'idx:users',
        {
          username: SchemaFieldTypes.TEXT
        },
        {
          ON: 'HASH',
          PREFIX: 'users:'
        }
      );
    } catch (e) {
      // console.log(e);
    }
  }
}

export const redisConnection = new RedisConnection();
