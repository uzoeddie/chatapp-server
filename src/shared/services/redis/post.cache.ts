import { BaseCache } from '@service/redis/base.cache';
import { IPostDocument, ISavePostToCache } from '@post/interfaces/post.interface';
import { Helpers } from '@global/helpers/helpers';
import { ServerError } from '@global/helpers/error-handler';
import { IReactions } from '@reaction/interfaces/reaction.interface';

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
      const postCount: string = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
      const multi = this.client.multi();
      multi.HSET(`posts:${key}`, dataToSave);
      multi.ZADD('post', { score: uId, value: `${key}` });
      const count: number = parseInt(postCount[0], 10) + 1;
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
      const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });
      const multi = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }
      const replies: IPostDocument[] = await multi.exec();
      for (const post of replies) {
        post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
        post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`) as Date);
      }
      return replies;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getTotalPostsCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCARD('post');
      return count;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getPostsWithImagesFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });
      const multi = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }
      const replies: IPostDocument[] = await multi.exec();
      const postWithImages: IPostDocument[] = [];
      for (const post of replies) {
        if ((post.imgId && post.imgVersion) || post.gifUrl) {
          post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
          post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
          post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`) as Date);
          postWithImages.push(post);
        }
      }
      return postWithImages;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getSinglePostFromCache(key: string): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply: IPostDocument = await this.client.HGETALL(`posts:${key}`);
      reply.commentsCount = Helpers.parseJson(`${reply.commentsCount}`) as number;
      reply.userId = Helpers.parseJson(`${reply.userId}`) as string;
      reply.reactions = Helpers.parseJson(`${reply.reactions}`) as IReactions;
      reply.createdAt = new Date(`${reply.createdAt}`) as Date;

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
      const reply: string[] = await this.client.ZRANGE(key, uId, uId, { BY: 'SCORE', REV: true });
      const multi = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }
      const replies: IPostDocument[] = await multi.exec();
      for (const post of replies) {
        post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
        post.userId = Helpers.parseJson(`${post.userId}`) as string;
        post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(`${post.createdAt}`) as Date;
      }
      return replies;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getTotalUserPostsCache(uId: number): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCOUNT('post', uId, uId);
      return count;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async deletePostFromCache(key: string, currentUserId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postCount: string = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
      const multi = this.client.multi();
      multi.ZREM('post', `${key}`);
      multi.DEL(`posts:${key}`);
      multi.DEL(`comments:${key}`);
      multi.DEL(`reactions:${key}`);
      const count: number = parseInt(postCount[0], 10) - 1;
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

    const secondList: string[] = ['profilePicture', `${profilePicture}`, 'imgVersion', `${imgVersion}`, 'imgId', `${imgId}`];
    const dataToSave: string[] = [...firstList, ...secondList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.HSET(`posts:${key}`, dataToSave);
      const multi = this.client.multi();
      multi.HGETALL(`posts:${key}`);
      const reply: IPostDocument[] = await multi.exec();
      reply[0].commentsCount = Helpers.parseJson(`${reply[0].commentsCount}`) as number;
      reply[0].reactions = Helpers.parseJson(`${reply[0].reactions}`) as IReactions;
      reply[0].createdAt = new Date(`${reply[0].createdAt}`) as Date;
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
