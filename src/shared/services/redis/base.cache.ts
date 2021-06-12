import { config } from '@root/config';
import Logger from 'bunyan';
import redis, { RedisClient } from 'redis';

const REDIS_PORT = 6379;

export abstract class BaseCache {
    client: RedisClient;
    log: Logger;

    constructor(cacheName: string) {
        this.client = redis.createClient({ host: config.REDIS_HOST || 'localhost', port: REDIS_PORT });
        this.log = config.createLogger(cacheName);
        this.cacheError();
    }

    private cacheError(): void {
        this.client.on('error', (error) => {
            this.log.error(error);
        });
    }
}
