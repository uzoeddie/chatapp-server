/* eslint-disable @typescript-eslint/no-explicit-any */
import { Multi } from 'redis';
import { BaseCache } from '@service/redis/base.cache';
import { IPostDocument, ISavePostToCache } from '@post/interfaces/post.interface';
import { Helpers } from '@global/helpers/helpers';
import { IReactions } from '@reaction/interfaces/reaction.interface';

class PostCache extends BaseCache {
    constructor() {
        super('postCache');
    }

    public async savePostToCache(data: ISavePostToCache): Promise<void> {
        const { key, currentUserId, uId, createdPost } = data;
        const {
            _id,
            userId,
            username,
            email,
            avatarColor,
            profilePicture,
            post,
            bgColor,
            feelings,
            privacy,
            gifUrl,
            commentsCount,
            imgVersion,
            imgId,
            reactions,
            createdAt
        } = createdPost;

        const firstList: string[] = [
            '_id',
            `${_id}`,
            'userId',
            `${userId}`,
            'username',
            `${username}`,
            'email',
            `${email}`,
            'avatarColor',
            `${avatarColor}`,
            'profilePicture',
            `${profilePicture}`,
            'post',
            `${post}`,
            'bgColor',
            `${bgColor}`,
            'feelings',
            JSON.stringify(feelings),
            'privacy',
            JSON.stringify(privacy),
            'gifUrl',
            `${gifUrl}`
        ];

        const secondList: string[] = [
            'commentsCount',
            `${commentsCount}`,
            'reactions',
            JSON.stringify(reactions),
            'imgVersion',
            `${imgVersion}`,
            'imgId',
            `${imgId}`,
            'createdAt',
            `${createdAt}`
        ];
        const dataToSave: string[] = [...firstList, ...secondList];

        return new Promise((resolve, reject) => {
            this.client.hmget(`users:${currentUserId}`, 'postsCount', (error: Error | null, postCount: string[]) => {
                if (error) {
                    reject(error);
                }
                const multi: Multi = this.client.multi();
                multi.hmset(`posts:${key}`, dataToSave);
                multi.zadd('post', uId, `${key}`);
                const count = parseInt(postCount[0], 10) + 1;
                multi.hmset(`users:${currentUserId}`, ['postsCount', `${count}`]);
                multi.exec((err: Error | null) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            });
        });
    }

    public getPostsFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
        return new Promise((resolve, reject) => {
            this.client.zrevrange(key, start, end, (error: Error | null, reply: string[]) => {
                if (error) {
                    reject(error);
                }
                const multi: Multi = this.client.multi();
                for (const value of reply) {
                    multi.hgetall(`posts:${value}`);
                }
                multi.exec((err, replies) => {
                    if (err) {
                        reject(err);
                    }
                    for (const post of replies) {
                        post.feelings = Helpers.parseJson(post.feelings);
                        post.privacy = Helpers.parseJson(post.privacy);
                        post.reactions = Object.keys(Helpers.parseJson(post.reactions) as IReactions).length
                            ? Helpers.formattedReactions(Helpers.parseJson(post.reactions) as IReactions)
                            : [];
                        post.createdAt = new Date(post.createdAt);
                    }
                    resolve(replies);
                });
            });
        });
    }

    public getSinglePostFromCache(key: string): Promise<IPostDocument[]> {
        return new Promise((resolve, reject) => {
            this.client.hgetall(`posts:${key}`, (error: Error | null, reply: any) => {
                if (error) {
                    reject(error);
                }

                reply.feelings = Helpers.parseJson(reply.feelings);
                reply.privacy = Helpers.parseJson(reply.privacy);
                reply.commentsCount = Helpers.parseJson(reply.commentsCount);
                reply.userId = Helpers.parseJson(reply.userId);
                reply.reactions = Object.keys(Helpers.parseJson(reply.reactions) as IReactions).length
                    ? Helpers.formattedReactions(Helpers.parseJson(reply.reactions) as IReactions)
                    : [];
                reply.createdAt = new Date(reply.createdAt);

                resolve([reply]);
            });
        });
    }

    public getUserPostsFromCache(key: string, uId: number): Promise<IPostDocument[]> {
        return new Promise((resolve, reject) => {
            this.client.zrevrangebyscore(key, uId, uId, (error: Error | null, reply: string[]) => {
                if (error) {
                    reject(error);
                }
                const multi: Multi = this.client.multi();
                for (const value of reply) {
                    multi.hgetall(`posts:${value}`);
                }
                multi.exec((err, replies) => {
                    if (err) {
                        reject(err);
                    }
                    for (const post of replies) {
                        post.feelings = Helpers.parseJson(post.feelings);
                        post.privacy = Helpers.parseJson(post.privacy);
                        post.commentsCount = Helpers.parseJson(post.commentsCount);
                        post.userId = Helpers.parseJson(post.userId);
                        post.reactions = Object.keys(Helpers.parseJson(post.reactions) as IReactions).length
                            ? Helpers.formattedReactions(Helpers.parseJson(post.reactions) as IReactions)
                            : [];
                        post.createdAt = new Date(post.createdAt);
                    }
                    resolve(replies);
                });
            });
        });
    }

    public deletePostFromCache(key: string, currentUserId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.hmget(`users:${currentUserId}`, 'postsCount', (error: Error | null, postCount: string[]) => {
                if (error) {
                    reject(error);
                }
                const multi: Multi = this.client.multi();
                multi.zrem('post', `${key}`);
                multi.del(`posts:${key}`);
                multi.del(`comments:${key}`);
                const count = parseInt(postCount[0], 10) - 1;
                multi.hmset(`users:${currentUserId}`, ['postsCount', `${count}`]);
                multi.exec((errorObj: Error | null) => {
                    if (errorObj) {
                        reject(errorObj);
                    }
                    resolve();
                });
            });
        });
    }

    public async updatePostInCache(key: string, updatedPost: IPostDocument): Promise<IPostDocument> {
        const { post, bgColor, feelings, privacy, gifUrl, createdAt, imgVersion, imgId, profilePicture } = updatedPost;

        const firstList: string[] = [
            'post',
            `${post}`,
            'bgColor',
            `${bgColor}`,
            'feelings',
            JSON.stringify(feelings),
            'privacy',
            JSON.stringify(privacy),
            'gifUrl',
            `${gifUrl}`
        ];

        const secondList: string[] = [
            'profilePicture',
            `${profilePicture}`,
            'createdAt',
            `${createdAt}`,
            'imgVersion',
            `${imgVersion}`,
            'imgId',
            `${imgId}`
        ];
        const dataToSave: string[] = [...firstList, ...secondList];

        return new Promise((resolve, reject) => {
            this.client.hmset(`posts:${key}`, dataToSave, (error: Error | null) => {
                if (error) {
                    reject(error);
                }
                const multi: Multi = this.client.multi();
                multi.hgetall(`posts:${key}`);
                multi.exec((err: Error | null, reply: any[]) => {
                    if (err) {
                        reject(error);
                    }
                    reply[0].feelings = Helpers.parseJson(reply[0].feelings);
                    reply[0].privacy = Helpers.parseJson(reply[0].privacy);
                    reply[0].reactions = Object.keys(Helpers.parseJson(reply[0].reactions) as IReactions).length
                        ? Helpers.formattedReactions(Helpers.parseJson(reply[0].reactions) as IReactions)
                        : [];
                    reply[0].createdAt = new Date(reply[0].createdAt);
                    resolve(reply[0]);
                });
            });
        });
    }

    public updateSinglePostPropInCache(key: string, prop: string, value: string): Promise<void> {
        const dataToSave: string[] = [`${prop}`, JSON.stringify(value)];
        return new Promise((resolve, reject) => {
            this.client.hmset(`posts:${key}`, dataToSave, (error: Error | null) => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
        });
    }
}

export const postCache: PostCache = new PostCache();
