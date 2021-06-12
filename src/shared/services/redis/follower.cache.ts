import { Multi } from 'redis';
import _ from 'lodash';
import { BaseCache } from '@service/redis/base.cache';
import { Helpers } from '@global/helpers/helpers';
import { IFollower } from '@follower/interface/follower.interface';

class FollowerCache extends BaseCache {
    constructor() {
        super('followersCache');
    }

    public saveFollowerToCache(key: string, value: IFollower): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.lpush(key, JSON.stringify(value), (error: Error | null) => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
        });
    }

    public getFollowersFromCache(key: string): Promise<IFollower[]> {
        return new Promise((resolve, reject) => {
            this.client.lrange(key, 0, -1, (error: Error | null, response: string[]) => {
                if (error) {
                    reject(error);
                }
                const list: IFollower[] = [];
                for (const item of response) {
                    list.push(Helpers.parseJson(item) as IFollower);
                }
                resolve(list);
            });
        });
    }

    public removeFollowerFromCache(key: string, value: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const multi: Multi = this.client.multi();
            this.client.lrange(key, 0, -1, (error: Error | null, response: string[]) => {
                if (error) {
                    reject(error);
                }
                const follower: string = _.find(response, (listItem: string) => listItem.includes(value)) as string;
                multi.lrem(key, 1, follower);
                multi.exec((errObj: Error | null) => {
                    if (errObj) {
                        reject(errObj);
                    }
                    resolve();
                });
            });
        });
    }

    public updateFollowersCountInCache(key: string, prop: string, value: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const multi: Multi = this.client.multi();
            multi.hincrby(`users:${key}`, prop, value);
            multi.exec((err: Error | null) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    public updateBlockedUserPropInCache(key: string, prop: string, value: string, type: 'block' | 'unblock'): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.hget(`users:${key}`, prop, (error: Error | null, response: string) => {
                if (error) {
                    reject(error);
                }
                const multi: Multi = this.client.multi();
                let blocked: string[] = Helpers.parseJson(response) as string[];
                if (type === 'block') {
                    blocked = [...blocked, value];
                } else {
                    _.remove(blocked, (id: string) => id === value);
                    blocked = [...blocked];
                }
                const dataToSave: string[] = [`${prop}`, JSON.stringify(blocked)];
                multi.hmset(`users:${key}`, dataToSave);
                multi.exec((errorObj: Error | null) => {
                    if (errorObj) {
                        reject(errorObj);
                    }
                    resolve();
                });
            });
        });
    }
}

export const followerCache: FollowerCache = new FollowerCache();
