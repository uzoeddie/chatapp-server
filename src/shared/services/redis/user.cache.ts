import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { BaseCache } from '@service/redis/base.cache';
import { INotificationSettings, IUserDocument } from '@user/interfaces/user.interface';
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
            await this.client.ZADD('user', {score: userId, value: `${key}`});
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

            const response = await this.client.HGETALL(`users:${key}`);
            response.createdAt = new Date(Helpers.parseJson(response.createdAt) as Date);
            response.postsCount = Helpers.parseJson(response.postsCount);
            response.blocked = Helpers.parseJson(response.blocked);
            response.blockedBy = Helpers.parseJson(response.blockedBy);
            response.work = Helpers.parseJson(response.work);
            response.school = Helpers.parseJson(response.school);
            response.location = Helpers.parseJson(response.location);
            response.quote = Helpers.parseJson(response.quote);
            response.notifications = Helpers.parseJson(response.notifications);
            response.social = Helpers.parseJson(response.social);
            response.followersCount = Helpers.parseJson(response.followersCount);
            response.followingCount = Helpers.parseJson(response.followingCount);

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
            const response = await this.client.ZRANGE('user', start, end);
            const multi = this.client.multi();
            for (const key of response) {
                if (key !== excludedKey) {
                    multi.HGETALL(`users:${key}`);
                }
            }
            const replies = await multi.exec();
            for (const reply of replies) {
                reply.createdAt = new Date(Helpers.parseJson(reply.createdAt) as Date);
                reply.postsCount = Helpers.parseJson(reply.postsCount);
                reply.blocked = Helpers.parseJson(reply.blocked);
                reply.blockedBy = Helpers.parseJson(reply.blockedBy);
                reply.work = Helpers.parseJson(reply.work);
                reply.school = Helpers.parseJson(reply.school);
                reply.location = Helpers.parseJson(reply.location);
                reply.quote = Helpers.parseJson(reply.quote);
                reply.notifications = Helpers.parseJson(reply.notifications);
                reply.social = Helpers.parseJson(reply.social);
                reply.followersCount = Helpers.parseJson(reply.followersCount);
                reply.followingCount = Helpers.parseJson(reply.followingCount);
            }
            return replies;
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
            const followers = await this.client.LRANGE(`followers:${excludedKey}`, 0, -1);
            const users = await this.client.ZRANGE('user', 0, -1);
            const excludedKeyIndex = _.indexOf(users, excludedKey);
            users.splice(excludedKeyIndex, 1);
            const randomUsers = Helpers.shuffle(users).slice(0, 10);
            for (const key of randomUsers) {
                const followerIndex = _.indexOf(followers, key);
                if (followerIndex < 0) {
                    const userHash = await this.client.HGETALL(`users:${key}`);
                    replies.push(userHash);
                }
            }
            for (const reply of replies) {
                reply.createdAt = new Date(Helpers.parseJson(reply.createdAt) as Date);
                reply.postsCount = Helpers.parseJson(reply.postsCount);
                reply.blocked = Helpers.parseJson(reply.blocked);
                reply.blockedBy = Helpers.parseJson(reply.blockedBy);
                reply.work = Helpers.parseJson(reply.work);
                reply.school = Helpers.parseJson(reply.school);
                reply.location = Helpers.parseJson(reply.location);
                reply.quote = Helpers.parseJson(reply.quote);
                reply.notifications = Helpers.parseJson(reply.notifications);
                reply.social = Helpers.parseJson(reply.social);
                reply.followersCount = Helpers.parseJson(reply.followersCount);
                reply.followingCount = Helpers.parseJson(reply.followingCount);
            }
            return replies;
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
