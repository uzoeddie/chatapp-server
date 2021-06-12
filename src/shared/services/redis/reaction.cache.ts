import { Multi } from 'redis';
import _ from 'lodash';
import { Helpers } from '@global/helpers/helpers';
import { IReactionDocument } from '@reaction/interfaces/reaction.interface';
import { BaseCache } from '@service/redis/base.cache';

export class ReactionCache extends BaseCache {
    constructor() {
        super('reactionsCache');
    }

    public savePostReactionToCache(key: string, value: string, previousReaction: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const multi: Multi = this.client.multi();
            const reaction: IReactionDocument = Helpers.parseJson(value) as IReactionDocument;
            if (previousReaction) {
                this.removePostReactionFromCache(key, reaction.username);
            }
            multi.lpush(`reactions:${key}`, JSON.stringify(reaction));
            multi.exec((error: Error | null) => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
        });
    }

    public removePostReactionFromCache(key: string, username: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.lrange(`reactions:${key}`, 0, -1, (error: Error | null, response: string[]) => {
                if (error) {
                    reject(error);
                }
                const multi: Multi = this.client.multi();
                const userPreviousReaction: IReactionDocument = this.getPreviousReaction(response, username) as IReactionDocument;
                multi.lrem(`reactions:${key}`, 1, JSON.stringify(userPreviousReaction));
                multi.exec((errorObj: Error | null) => {
                    if (errorObj) {
                        reject(errorObj);
                    }
                    resolve();
                });
            });
        });
    }

    public getReactionsFromCache(key: string, start: number, end: number): Promise<[IReactionDocument[], number]> {
        return new Promise((resolve, reject) => {
            const multi: Multi = this.client.multi();
            multi.llen(`reactions:${key}`);
            multi.lrange(`reactions:${key}`, start, end);
            multi.exec((errorObj: Error | null, response) => {
                if (errorObj) {
                    reject(errorObj);
                }
                const list: IReactionDocument[] = [];
                for (const item of response[1]) {
                    list.push(Helpers.parseJson(item) as IReactionDocument);
                }
                if (response[1].length) {
                    resolve([list, response[0]]);
                } else {
                    resolve([[], 0]);
                }
            });
        });
    }

    public getSingleReactionFromCache(key: string, reactionId: string): Promise<[IReactionDocument[], number]> {
        return new Promise((resolve, reject) => {
            this.client.lrange(`reactions:${key}`, 0, -1, (error: Error | null, reply: string[]) => {
                if (error) {
                    reject(error);
                }
                const list: IReactionDocument[] = [];
                for (const item of reply) {
                    list.push(Helpers.parseJson(item) as IReactionDocument);
                }
                const result: IReactionDocument = _.find(list, (listItem: IReactionDocument) => {
                    return listItem._id === reactionId;
                }) as IReactionDocument;
                resolve([[result], 1]);
            });
        });
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

export const reactionCache: ReactionCache = new ReactionCache();
