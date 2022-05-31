import { BaseCache } from '@service/redis/base.cache';
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

        } catch (error) {
            console.log(error);
        }
    }
}

export const redisConnection = new RedisConnection();
