import _ from 'lodash';
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface';
import { BaseCache } from '@service/redis/base.cache';
import { Helpers } from '@global/helpers/helpers';
import { ServerError } from '@global/helpers/error-handler';

export class CommentCache extends BaseCache {
  constructor() {
    super('commentsCache');
  }

  public async savePostCommentToCache(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LPUSH(`comments:${key}`, value);
      const commentsCount = await this.client.HMGET(`posts:${key}`, 'commentsCount');
      let count = Helpers.parseJson(commentsCount) as number;
      count += 1;
      const dataToSave: string[] = ['commentsCount', `${count}`];
      await this.client.HSET(`posts:${key}`, dataToSave);
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getCommentsFromCache(key: string): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply = await this.client.LRANGE(`comments:${key}`, 0, -1);
      const list: ICommentDocument[] = [];
      for (const item of reply) {
        list.push(Helpers.parseJson(item) as ICommentDocument);
      }
      return list;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getCommentNamesFromCache(key: string): Promise<ICommentNameList[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply: number = await this.client.LLEN(`comments:${key}`);
      const comments = await this.client.LRANGE(`comments:${key}`, 0, -1);
      const list: string[] = [];
      for (const item of comments) {
        const commentDocument: ICommentDocument = Helpers.parseJson(item) as ICommentDocument;
        list.push(commentDocument.username);
      }
      const response: ICommentNameList = {
        count: reply,
        names: list
      };
      return [response];
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getSingleCommentFromCache(key: string, commentId: string): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply = await this.client.LRANGE(`comments:${key}`, 0, -1);
      const list: ICommentDocument[] = [];
      for (const item of reply) {
        list.push(Helpers.parseJson(item) as ICommentDocument);
      }
      const result: ICommentDocument = _.find(list, (listItem: ICommentDocument) => {
        return listItem._id === commentId;
      }) as ICommentDocument;
      return [result];
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }
}
