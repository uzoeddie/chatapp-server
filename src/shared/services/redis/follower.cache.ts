import _ from 'lodash';
import { BaseCache } from '@service/redis/base.cache';
import { Helpers } from '@global/helpers/helpers';
import { IFollowerData } from '@follower/interface/follower.interface';
import { ServerError } from '@global/helpers/error-handler';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';

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
                const user: IUserDocument = await userCache.getUserFromCache(item);
                const data: IFollowerData = {
                    _id: user._id,
                    username: user.username,
                    avatarColor: user.avatarColor,
                    postCount: user.postsCount,
                    followersCount: user.followersCount,
                    followingCount: user.followingCount,
                    profilePicture: user.profilePicture,
                    uId: user.uId,
                    userProfile: user
                };
                list.push(data);
            }
            return list;
        } catch (error) {
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
            throw new ServerError('Server error. Try again.');
        }
    }

    public async updateBlockedUserPropInCache(key: string, prop: string, value: string, type: 'block' | 'unblock'): Promise<void> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            const response = await this.client.HGET(`users:${key}`, prop);
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
            throw new ServerError('Server error. Try again.');
        }
    }
}
