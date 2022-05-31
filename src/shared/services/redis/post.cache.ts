import { BaseCache } from '@service/redis/base.cache';
import { IPostDocument, ISavePostToCache } from '@post/interfaces/post.interface';
import { Helpers } from '@global/helpers/helpers';
import { ServerError } from '@global/helpers/error-handler';
import _ from 'lodash';

export class PostCache extends BaseCache {
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
            `${feelings}`,
            'privacy',
            `${privacy}`,
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

        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            const postCount = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
            const multi = this.client.multi();
            multi.HSET(`posts:${key}`, dataToSave);
            multi.ZADD('post', {score: uId, value: `${key}`});
            const count = parseInt(postCount[0], 10) + 1;
            multi.HSET(`users:${currentUserId}`, ['postsCount', `${count}`]);
            await multi.exec();
        } catch (error) {
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getPostsFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            const reply = await this.client.ZRANGE(key, start, end);
            const multi = this.client.multi();
            for (const value of reply) {
                multi.HGETALL(`posts:${value}`);
            }
            const replies = await multi.exec();
            for (const post of replies) {
                post.commentsCount = Helpers.parseJson(post.commentsCount);
                post.reactions = Helpers.parseJson(post.reactions);
                post.createdAt = new Date(post.createdAt);
            }
            return _.orderBy(replies, ['createdAt'], ['desc']);
        } catch (error) {
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getPostsWithImagesFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            const reply = await this.client.ZRANGE(key, start, end);
            const multi = this.client.multi();
            for (const value of reply) {
                multi.HGETALL(`posts:${value}`);
            }
            const replies = await multi.exec();
            const postWithImages = [];
            for (const post of replies) {
                if(post.imgId && post.imgVersion) {
                    post.commentsCount = Helpers.parseJson(post.commentsCount);
                    post.reactions = Helpers.parseJson(post.reactions);
                    post.createdAt = new Date(post.createdAt);
                    postWithImages.push(post);
                }
            }
            return _.orderBy(postWithImages, ['createdAt'], ['desc']);
        } catch (error) {
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getSinglePostFromCache(key: string): Promise<IPostDocument[]> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            const reply = await this.client.HGETALL(`posts:${key}`);
            reply.commentsCount = Helpers.parseJson(reply.commentsCount);
            reply.userId = Helpers.parseJson(reply.userId);
            reply.reactions = Helpers.parseJson(reply.reactions);
            reply.createdAt = new Date(reply.createdAt);

            return [reply];
        } catch (error) {
            throw new ServerError('Server error. Try again.');
        }
    }

    public async getUserPostsFromCache(key: string, uId: number): Promise<IPostDocument[]> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            const reply = await this.client.ZRANGE(key, uId, uId, { BY: 'SCORE' });
            const multi = this.client.multi();
            for (const value of reply) {
                multi.HGETALL(`posts:${value}`);
            }
            const replies = await multi.exec();
            for (const post of replies) {
                post.commentsCount = Helpers.parseJson(post.commentsCount);
                post.userId = Helpers.parseJson(post.userId);
                post.reactions = Helpers.parseJson(post.reactions);
                post.createdAt = new Date(post.createdAt);
            }
            return _.orderBy(replies, ['createdAt'], ['desc']);
        } catch (error) {
            throw new ServerError('Server error. Try again.');
        }
    }

    public async deletePostFromCache(key: string, currentUserId: string): Promise<void> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            const postCount = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
            const multi = this.client.multi();
            multi.ZREM('post', `${key}`);
            multi.DEL(`posts:${key}`);
            multi.DEL(`comments:${key}`);
            multi.DEL(`reactions:${key}`);
            const count = parseInt(postCount[0], 10) - 1;
            multi.HSET(`users:${currentUserId}`, ['postsCount', `${count}`]);
            await multi.exec();
        } catch (error) {
            throw new ServerError('Server error. Try again.');
        }
    }

    public async updatePostInCache(key: string, updatedPost: IPostDocument): Promise<IPostDocument> {
        const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture } = updatedPost;

        const firstList: string[] = [
            'post',
            `${post}`,
            'bgColor',
            `${bgColor}`,
            'feelings',
            `${feelings}`,
            'privacy',
            `${privacy}`,
            'gifUrl',
            `${gifUrl}`
        ];

        const secondList: string[] = [
            'profilePicture',
            `${profilePicture}`,
            'imgVersion',
            `${imgVersion}`,
            'imgId',
            `${imgId}`
        ];
        const dataToSave: string[] = [...firstList, ...secondList];

        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            await this.client.HSET(`posts:${key}`, dataToSave);
            const multi = this.client.multi();
            multi.HGETALL(`posts:${key}`);
            const reply = await multi.exec();
            reply[0].commentsCount = Helpers.parseJson(reply[0].commentsCount);
            reply[0].reactions = Helpers.parseJson(reply[0].reactions);
            reply[0].createdAt = new Date(reply[0].createdAt);
            return reply[0];
        } catch (error) {
            throw new ServerError('Server error. Try again.');
        }
    }

    public async updateSinglePostPropInCache(key: string, prop: string, value: string): Promise<void> {
        const dataToSave: string[] = [`${prop}`, JSON.stringify(value)];

        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            await this.client.HSET(`posts:${key}`, dataToSave);
        } catch (error) {
            throw new ServerError('Server error. Try again.');
        }
    }
}
