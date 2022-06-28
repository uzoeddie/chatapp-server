import { BaseCache } from '@service/redis/base.cache';
import { SchemaFieldTypes } from 'redis';

class RedisConnection extends BaseCache {
  constructor() {
    super('redisConnection');
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
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
