import { config } from '@root/config';
import Logger from 'bunyan';
import { createClient } from 'redis';

export abstract class BaseCache {
    client: any;
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
