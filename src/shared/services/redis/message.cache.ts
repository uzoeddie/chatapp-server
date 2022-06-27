import _ from 'lodash';
import { BaseCache } from '@service/redis/base.cache';
import { Helpers } from '@global/helpers/helpers';
import { ServerError } from '@global/helpers/error-handler';
import { IChatList, IChatUsers, IMessageData } from '@chat/interfaces/chat.interface';
import { IReaction } from '@reaction/interfaces/reaction.interface';

export class MessageCache extends BaseCache {
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
      throw new ServerError('Server error. Try again.');
    }
  }

  public async addChatMessageToCache(key: string, value: IMessageData): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.RPUSH(`messages:${key}`, JSON.stringify(value));
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async addChatUsersToCache(value: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const users: IChatUsers[] = await this.getChatUsersList();
      const usersIndex: number = _.findIndex(users, (listItem: IChatUsers) => JSON.stringify(listItem) === JSON.stringify(value));
      let chatUsers: IChatUsers[] = [];
      if (usersIndex === -1) {
        await this.client.RPUSH('chatUsers', JSON.stringify(value));
        chatUsers = await this.getChatUsersList();
      } else {
        chatUsers = users;
      }
      return chatUsers;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async updateMessageReaction(key: string, messageId: string, reaction: string, senderName: string, type: string): Promise<IMessageData> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const messages: string[] = await this.client.LRANGE(`messages:${key}`, 0, -1);
      const messageIndex: number = _.findIndex(messages, (listItem: string) => listItem.includes(messageId));
      const message: string = await this.client.LINDEX(`messages:${key}`, messageIndex);
      const parsedMessage: IMessageData = Helpers.parseJson(message) as IMessageData;
      const reactions: IReaction[] = [];
      if (parsedMessage) {
        _.remove(parsedMessage.reaction, (reaction: IReaction) => reaction.senderName === senderName);
        if (type === 'add') {
          reactions.push({ senderName, type: reaction });
          parsedMessage.reaction = [...parsedMessage.reaction, ...reactions];
          await this.client.LSET(`messages:${key}`, messageIndex, JSON.stringify(parsedMessage));
        } else {
          await this.client.LSET(`messages:${key}`, messageIndex, JSON.stringify(parsedMessage));
        }
      }
      const updatedMessage = await this.client.LINDEX(`messages:${key}`, messageIndex);
      return Helpers.parseJson(updatedMessage) as IMessageData;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async removeChatUsersFromCache(value: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const users: IChatUsers[] = await this.getChatUsersList();
      const usersIndex: number = _.findIndex(users, (listItem: IChatUsers) => JSON.stringify(listItem) === JSON.stringify(value));
      let chatUsers: IChatUsers[] = [];
      if (usersIndex > -1) {
        await this.client.LREM('chatUsers', usersIndex, JSON.stringify(value));
        chatUsers = await this.getChatUsersList();
      } else {
        chatUsers = users;
      }
      return chatUsers;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUserConversationList(key: string): Promise<IChatList[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList: string[] = await this.client.LRANGE(`chatList:${key}`, 0, -1);
      const conversationChatList: IChatList[] = [];
      for (const item of userChatList) {
        const chatItem = Helpers.parseJson(item) as IChatList;
        const lastMessage = await this.client.LINDEX(`messages:${chatItem.conversationId}`, -1);
        conversationChatList.push(Helpers.parseJson(lastMessage) as IChatList);
      }
      return conversationChatList;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getChatMessagesFromCache(senderId: string, receiverId: string): Promise<IMessageData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList: string[] = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
      const receiver: string = _.find(userChatList, (listItem: string) => listItem.includes(receiverId)) as string;
      const parsedReceiver: IChatList = Helpers.parseJson(receiver) as IChatList;
      if (parsedReceiver) {
        const userMessages: string[] = await this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
        const chatMessages: IMessageData[] = [];
        for (const item of userMessages) {
          const chatItem = Helpers.parseJson(item) as IMessageData;
          chatMessages.push(chatItem);
        }
        return chatMessages;
      } else {
        return [];
      }
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  public async updateChatMessages(senderId: string, receiverId: string): Promise<IMessageData> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList: string[] = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
      const receiver: string = _.find(userChatList, (listItem: string) => listItem.includes(receiverId)) as string;
      const parsedReceiver: IChatList = Helpers.parseJson(receiver) as IChatList;
      const messages = await this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
      for (const [index, item] of messages.entries()) {
        const chatItem = Helpers.parseJson(item) as IMessageData;
        if (!chatItem.isRead) {
          chatItem.isRead = true;
          await this.client.LSET(`messages:${parsedReceiver.conversationId}`, index, JSON.stringify(chatItem));
        }
      }
      const lastMessage: string = await this.client.LINDEX(`messages:${parsedReceiver.conversationId}`, -1);
      return Helpers.parseJson(lastMessage) as IMessageData;
    } catch (error) {
      throw new ServerError('Server error. Try again.');
    }
  }

  private async getChatUsersList(): Promise<IChatUsers[]> {
    const chatUsersList: IChatUsers[] = [];
    const chatUsers = await this.client.LRANGE('chatUsers', 0, -1);
    for (const item of chatUsers) {
      const ChatUser: IChatUsers = Helpers.parseJson(item) as IChatUsers;
      chatUsersList.push(ChatUser);
    }
    return chatUsersList;
  }
}
