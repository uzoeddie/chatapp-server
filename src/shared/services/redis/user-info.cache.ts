/* eslint-disable @typescript-eslint/no-explicit-any */
import { Multi } from 'redis';
import _ from 'lodash';
import { BaseCache } from '@service/redis/base.cache';
import { IUserBirthDay, IUserDocument, IUserInfoListProp, IUserPlacesLived, IUserSchool, IUserWork } from '@user/interfaces/user.interface';
import { Helpers } from '@global/helpers/helpers';

export type ListType = IUserPlacesLived | IUserWork | IUserSchool;
type UserItem = string | number | IUserBirthDay | ListType | null;

class UserInfoCache extends BaseCache {
    constructor() {
        super('userInfoCache');
    }

    public updateSingleUserItemInCache(key: string, prop: string, value: UserItem): Promise<IUserDocument> {
        return new Promise((resolve, reject) => {
            let dataToSave: string[] = [];
            if (prop === 'birthDay') {
                dataToSave = ['birthDay', JSON.stringify(value)];
            } else {
                dataToSave = [`${prop}`, `${value}`];
            }
            const multi: Multi = this.client.multi();
            multi.hmset(`users:${key}`, dataToSave);
            multi.hgetall(`users:${key}`);
            multi.exec((error: Error | null, response: any) => {
                if (error) {
                    reject(error);
                }
                response[0].createdAt = new Date(Helpers.parseJson(response[0].createdAt) as Date);
                response[0].postsCount = Helpers.parseJson(response[0].postsCount);
                response[0].birthDay = Helpers.parseJson(response[0].birthDay);
                response[0].blocked = Helpers.parseJson(response[0].blocked);
                response[0].blockedBy = Helpers.parseJson(response[0].blockedBy);
                response[0].work = Helpers.parseJson(response[0].work);
                response[0].school = Helpers.parseJson(response[0].school);
                response[0].placesLived = Helpers.parseJson(response[0].placesLived);
                response[0].notifications = Helpers.parseJson(response[0].notifications);
                response[0].followersCount = Helpers.parseJson(response[0].followersCount);
                response[0].followingCount = Helpers.parseJson(response[0].followingCount);

                resolve(response[0]);
            });
        });
    }

    public updateUserInfoListInCache(userData: IUserInfoListProp): Promise<IUserDocument> {
        const { key, prop, value, type, deletedItemId } = userData;
        return new Promise((resolve, reject) => {
            this.client.hget(`users:${key}`, prop, (err: Error | null, itemResponse: string) => {
                if (err) {
                    reject(err);
                }
                const multi: Multi = this.client.multi();
                let list: ListType[] = Helpers.parseJson(itemResponse) as ListType[];
                if (type === 'add') {
                    list = [...list, value];
                } else if (type === 'remove') {
                    _.remove(list, (item: ListType) => item._id === deletedItemId);
                    list = [...list];
                } else if (type === 'edit') {
                    _.remove(list, (item: ListType) => item._id === value._id);
                    list = [...list, value];
                }
                const dataToSave: string[] = [`${prop}`, JSON.stringify(list)];
                multi.hmset(`users:${key}`, dataToSave);
                multi.hgetall(`users:${key}`);
                multi.exec((error: Error | null, response: any) => {
                    if (error) {
                        reject(error);
                    }
                    response[1].createdAt = new Date(Helpers.parseJson(response[1].createdAt) as Date);
                    response[1].postsCount = Helpers.parseJson(response[1].postsCount);
                    response[1].birthDay = Helpers.parseJson(response[1].birthDay);
                    response[1].blocked = Helpers.parseJson(response[1].blocked);
                    response[1].blockedBy = Helpers.parseJson(response[1].blockedBy);
                    response[1].work = Helpers.parseJson(response[1].work);
                    response[1].school = Helpers.parseJson(response[1].school);
                    response[1].placesLived = Helpers.parseJson(response[1].placesLived);
                    response[1].notifications = Helpers.parseJson(response[1].notifications);
                    response[1].followersCount = Helpers.parseJson(response[1].followersCount);
                    response[1].followingCount = Helpers.parseJson(response[1].followingCount);

                    resolve(response[1]);
                });
            });
        });
    }
}

export const userInfoCache: UserInfoCache = new UserInfoCache();
