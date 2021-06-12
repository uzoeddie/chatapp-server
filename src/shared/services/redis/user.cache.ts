/* eslint-disable @typescript-eslint/no-explicit-any */
import { Helpers } from '@global/helpers/helpers';
import { BaseCache } from '@service/redis/base.cache';
import { INotificationSettings, IUserDocument } from '@user/interfaces/user.interface';
import { Multi } from 'redis';

class UserCache extends BaseCache {
    constructor() {
        super('userCache');
    }

    public saveUserToCache(key: string, userId: string, createdUser: IUserDocument): Promise<void> {
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
            birthDay,
            notifications,
            work,
            placesLived,
            school,
            gender,
            quotes,
            about,
            relationship,
            bgImageVersion,
            bgImageId
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
            'birthDay',
            JSON.stringify(birthDay),
            'notifications',
            JSON.stringify(notifications)
        ];
        const thirdList: string[] = [
            'work',
            JSON.stringify(work),
            'placesLived',
            JSON.stringify(placesLived),
            'school',
            JSON.stringify(school),
            'gender',
            `${gender}`,
            'about',
            `${about}`,
            'quotes',
            `${quotes}`,
            'relationship',
            `${relationship}`,
            'bgImageVersion',
            `${bgImageVersion}`,
            'bgImageId',
            `${bgImageId}`
        ];
        const dataToSave: string[] = [...firstList, ...secondList, ...thirdList];
        return new Promise((resolve, reject) => {
            this.client.hmset(`users:${key}`, dataToSave, (error: Error | null) => {
                if (error) {
                    reject(error);
                }
                this.client.zadd('user', userId, `${key}`);
                resolve();
            });
        });
    }

    public getUserFromCache(key: string): Promise<IUserDocument> {
        return new Promise((resolve, reject) => {
            this.client.hgetall(`users:${key}`, (error: Error | null, response: any) => {
                if (error) {
                    reject(error);
                }
                response.createdAt = new Date(Helpers.parseJson(response.createdAt) as Date);
                response.postsCount = Helpers.parseJson(response.postsCount);
                response.birthDay = Helpers.parseJson(response.birthDay);
                response.blocked = Helpers.parseJson(response.blocked);
                response.blockedBy = Helpers.parseJson(response.blockedBy);
                response.work = Helpers.parseJson(response.work);
                response.school = Helpers.parseJson(response.school);
                response.placesLived = Helpers.parseJson(response.placesLived);
                response.notifications = Helpers.parseJson(response.notifications);
                response.followersCount = Helpers.parseJson(response.followersCount);
                response.followingCount = Helpers.parseJson(response.followingCount);
                resolve(response);
            });
        });
    }

    public getUsersFromCache(start: number, end: number, excludedKey: string): Promise<IUserDocument[]> {
        return new Promise((resolve, reject) => {
            this.client.zrange('user', start, end, (error: Error | null, response: string[]) => {
                if (error) {
                    reject(error);
                }
                const multi: Multi = this.client.multi();
                for (const key of response) {
                    if (key !== excludedKey) {
                        multi.hgetall(`users:${key}`);
                    }
                }
                multi.exec((err: Error | null, replies: any[]) => {
                    if (err) {
                        reject(err);
                    }
                    for (const reply of replies) {
                        reply.createdAt = new Date(Helpers.parseJson(reply.createdAt) as Date);
                        reply.postsCount = Helpers.parseJson(reply.postsCount);
                        reply.birthDay = Helpers.parseJson(reply.birthDay);
                        reply.blocked = Helpers.parseJson(reply.blocked);
                        reply.blockedBy = Helpers.parseJson(reply.blockedBy);
                        reply.work = Helpers.parseJson(reply.work);
                        reply.school = Helpers.parseJson(reply.school);
                        reply.placesLived = Helpers.parseJson(reply.placesLived);
                        reply.notifications = Helpers.parseJson(reply.notifications);
                        reply.followersCount = Helpers.parseJson(reply.followersCount);
                        reply.followingCount = Helpers.parseJson(reply.followingCount);
                    }
                    resolve(replies);
                });
            });
        });
    }

    public updateNotificationSettingsInCache(key: string, prop: string, value: INotificationSettings): Promise<void> {
        const dataToSave: string[] = [`${prop}`, JSON.stringify(value)];
        return new Promise((resolve, reject) => {
            this.client.hmset(`users:${key}`, dataToSave, (error: Error | null) => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
        });
    }
}

export const userCache: UserCache = new UserCache();
