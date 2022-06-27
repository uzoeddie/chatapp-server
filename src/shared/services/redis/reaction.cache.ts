import _ from 'lodash';
import { Helpers } from '@global/helpers/helpers';
import { IReactionDocument, IReactions } from '@reaction/interfaces/reaction.interface';
import { BaseCache } from '@service/redis/base.cache';
import { ServerError } from '@global/helpers/error-handler';

export class ReactionCache extends BaseCache {
  constructor() {
    super('reactionsCache');
  }

  public async savePostReactionToCache(
    key: string,
    value: string,
    postReactions: IReactions,
    type: string,
    previousReaction: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reaction: IReactionDocument = Helpers.parseJson(value) as IReactionDocument;
      if (previousReaction) {
        this.removePostReactionFromCache(key, reaction.username, postReactions);
      }
      if (type) {
        await this.client.LPUSH(`reactions:${key}`, JSON.stringify(reaction));
        const dataToSave: string[] = ['reactions', JSON.stringify(postReactions)];
        await this.client.HSET(`posts:${key}`, dataToSave);
      }
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async removePostReactionFromCache(
    key: string,
    username: string,
    postReactions: IReactions
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(`reactions:${key}`, 0, -1);
      const multi = this.client.multi();
      const userPreviousReaction: IReactionDocument = this.getPreviousReaction(response, username) as IReactionDocument;
      multi.LREM(`reactions:${key}`, 1, JSON.stringify(userPreviousReaction));
      await multi.exec();

      const dataToSave: string[] = ['reactions', JSON.stringify(postReactions)];
      await this.client.HSET(`posts:${key}`, dataToSave);
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getReactionsFromCache(key: string): Promise<[IReactionDocument[], number]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LLEN(`reactions:${key}`);
      const response: string[] = await this.client.LRANGE(`reactions:${key}`, 0, -1);
      const list: IReactionDocument[] = [];
      for (const item of response) {
        list.push(Helpers.parseJson(item) as IReactionDocument);
      }
      return response.length ? [list, response.length] : [[], 0];
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getSingleReactionFromCache(key: string, reactionId: string): Promise<[IReactionDocument[], number]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply: string[] = await this.client.LRANGE(`reactions:${key}`, 0, -1);
      const list: IReactionDocument[] = [];
      for (const item of reply) {
        list.push(Helpers.parseJson(item) as IReactionDocument);
      }
      const result: IReactionDocument = _.find(list, (listItem: IReactionDocument) => {
        return listItem._id === reactionId;
      }) as IReactionDocument;
      return [[result], 1];
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getSingleReactionByUsernameFromCache(key: string, username: string): Promise<[IReactionDocument, number] | []> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply: string[] = await this.client.LRANGE(`reactions:${key}`, 0, -1);
      const list: IReactionDocument[] = [];
      for (const item of reply) {
        list.push(Helpers.parseJson(item) as IReactionDocument);
      }
      const result: IReactionDocument = _.find(list, (listItem: IReactionDocument) => {
        return listItem?.postId === key && listItem?.username === username;
      }) as IReactionDocument;
      return result ? [result, 1] : [];
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  private getPreviousReaction(response: string[], username: string): IReactionDocument | undefined {
    const list: IReactionDocument[] = [];
    for (const item of response) {
      list.push(Helpers.parseJson(item) as IReactionDocument);
    }
    return _.find(list, (listItem: IReactionDocument) => {
      return listItem.username === username;
    });
  }
}
