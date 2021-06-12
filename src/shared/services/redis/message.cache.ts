import { Multi } from 'redis';
import _ from 'lodash';
import { BaseCache } from '@service/redis/base.cache';
import { IChatListItemIndex, IChatMessage, IChatRedisData } from '@chat/interfaces/chat.interface';
import { Helpers } from '@global/helpers/helpers';

class MessageCache extends BaseCache {
    constructor() {
        super('messageCache');
    }

    public addChatListToCache(keys: string[], value: IChatRedisData): Promise<void> {
        return new Promise((resolve, reject) => {
            for (const key of keys) {
                const multi: Multi = this.client.multi();
                multi.lrange(`chatList:${key}`, 0, -1);
                multi.exec((error: Error | null, response) => {
                    if (error) {
                        reject(error);
                    }
                    if (response[0].length) {
                        const parsedResponse: IChatRedisData = Helpers.parseJson(response[0]) as IChatRedisData;
                        const listItem: IChatListItemIndex = this.getChatItemAndIndex(response[0], parsedResponse.conversationId);
                        if (listItem.item && listItem.index > -1) {
                            multi.lset(`chatList:${key}`, listItem.index, JSON.stringify(value)).exec();
                        }
                    } else {
                        multi.rpush(`chatList:${key}`, JSON.stringify(value)).exec();
                    }
                    resolve();
                });
            }
        });
    }

    public addChatMessageToCache(key: string, value: IChatRedisData): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.lrange(`messages:${key}`, 0, -1, (error: Error | null, response: string[]) => {
                if (error) {
                    reject(error);
                }
                const multi: Multi = this.client.multi();
                if (response.length <= 20) {
                    multi.rpush(`messages:${key}`, JSON.stringify(value));
                } else {
                    multi.lpop(`messages:${key}`);
                    multi.rpush(`messages:${key}`, JSON.stringify(value));
                }
                multi.exec((errorObj: Error | null) => {
                    if (errorObj) {
                        reject(errorObj);
                    }
                    resolve();
                });
            });
        });
    }

    public getChatFromCache(key: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.client.lrange(key, 0, -1, (error: Error | null, response: string[]) => {
                if (error) {
                    reject(error);
                }
                resolve(response);
            });
        });
    }

    public updateIsReadPropInCache(keyOne: string, keyTwo: string, conversationId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const multi: Multi = this.client.multi();
            multi.lrange(`chatList:${keyOne}`, 0, -1);
            multi.lrange(`chatList:${keyTwo}`, 0, -1);
            multi.lrange(`messages:${conversationId}`, 0, -1);
            multi.exec((error: Error | null, response) => {
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

    private updateIsRead(listItem: IChatMessage, index: number, key: string, multi: Multi): void {
        listItem.isRead = true;
        multi.lset(key, index, JSON.stringify(listItem)).exec();
    }
}

export const messageCache: MessageCache = new MessageCache();
