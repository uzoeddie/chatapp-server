import _ from 'lodash';
import { BaseCache } from '@service/redis/base.cache';
import { IChatListItemIndex, IChatMessage, IChatRedisData } from '@chat/interfaces/chat.interface';
import { Helpers } from '@global/helpers/helpers';
import { ServerError } from '@global/helpers/error-handler';
import { UserCache } from '@service/redis/user.cache';

const userCache = new UserCache();

class MessageCache extends BaseCache {
  constructor() {
    super('messageCache');
  }

  public async addChatListToCache(senderId: string, receiverId: string, conversationId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
      if (userChatList.length === 0) {
        await this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
      } else {
        const receiverIdIndex: number = _.findIndex(userChatList, (listItem: string) => listItem.includes(receiverId));
        if (receiverIdIndex < 0) {
          await this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
        }
      }
    } catch (error) {
      console.log(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async addChatMessageToCache(key: string, value: any): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.RPUSH(`messages:${key}`, JSON.stringify(value));
    } catch (error) {
      console.log(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUserConversationList(key: string) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList = await this.client.LRANGE(`chatList:${key}`, 0, -1);
      const conversationChatList = [];
      for (const item of userChatList) {
        const chatItem = Helpers.parseJson(item) as any;
        const lastMessage = await this.client.LINDEX(`messages:${chatItem.conversationId}`, -1);
        conversationChatList.push(Helpers.parseJson(lastMessage));
      }
      return conversationChatList;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getChatMessagesFromCache(senderId: string, receiverId: string): Promise<any[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
      const receiver = _.find(userChatList, (listItem: string) => listItem.includes(receiverId));
      const parsedReceiver = Helpers.parseJson(receiver) as any;
      if (parsedReceiver) {
        const userMessages = await this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
        const chatMessages = [];
        for (const item of userMessages) {
          const chatItem = Helpers.parseJson(item) as any;
          chatMessages.push(chatItem);
        }
        return chatMessages;
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public updateIsReadPropInCache(keyOne: string, keyTwo: string, conversationId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const multi = this.client.multi();
      multi.LRANGE(`chatList:${keyOne}`, 0, -1);
      multi.LRANGE(`chatList:${keyTwo}`, 0, -1);
      multi.LRANGE(`messages:${conversationId}`, 0, -1);
      multi.exec((error: Error | null, response: any) => {
        if (error) {
          reject(error);
        }

        const sender: IChatListItemIndex = this.getChatItemAndIndex(response[0], keyOne);
        this.updateIsRead(sender.item, sender.index, `chatList:${keyOne}`, multi);

        const receiver: IChatListItemIndex = this.getChatItemAndIndex(response[1], keyTwo);
        this.updateIsRead(receiver.item, receiver.index, `chatList:${keyTwo}`, multi);

        for (const [index, value] of response[2].entries()) {
          const parsedMessage: IChatMessage = Helpers.parseJson(value) as IChatMessage;
          this.updateIsRead(parsedMessage, index, `messages:${conversationId}`, multi);
        }

        resolve(response[response.length - 1]);
      });
    });
  }

  private getChatItemAndIndex(list: string[], key: string): IChatListItemIndex {
    const item: string = _.find(list, (listItem: string) => listItem.includes(key)) as string;
    const index: number = _.findIndex(list, (listItem: string) => listItem.includes(key));
    return {
      item: Helpers.parseJson(item) as IChatMessage,
      index
    };
  }

  // private getChatReceiverAndIndex(list: string[], key: string) {
  //   const item: string = _.find(list, (listItem: string) => listItem.includes(key)) as string;
  //   const index: number = _.findIndex(list, (listItem: string) => listItem.includes(key));
  //   return {
  //     item,
  //     index
  //   };
  // }

  private updateIsRead(listItem: IChatMessage, index: number, key: string, multi: any): void {
    listItem.isRead = true;
    multi.LSET(key, index, JSON.stringify(listItem)).exec();
  }
}

export const messageCache: MessageCache = new MessageCache();
