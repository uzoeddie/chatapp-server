import { config } from '@root/config';
import Logger from 'bunyan';
import { createClient } from 'redis';

// to run redis, use the docker image that has redis search
// docker run -d -p 6379:6379 redislabs/redisearch:latest

export type RedisClient = ReturnType<typeof createClient>;

export abstract class BaseCache {
  client: RedisClient;
  log: Logger;

  constructor(cacheName: string) {
    this.client = createClient({ url: config.REDIS_HOST });
    this.log = config.createLogger(cacheName);
    this.cacheError();
  }

  private cacheError(): void {
    this.client.on('error', async (error: unknown) => {
      this.log.error(error);
    });
  }
}
