import { Multi } from 'redis';
import _ from 'lodash';
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface';
import { BaseCache } from '@service/redis/base.cache';
import { Helpers } from '@global/helpers/helpers';

class CommentCache extends BaseCache {
    constructor() {
        super('commentsCache');
    }

    public savePostCommentToCache(key: string, value: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.lpush(`comments:${key}`, value, (error: Error | null) => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
        });
    }

    public getCommentsFromCache(key: string, start: number, end: number): Promise<ICommentDocument[]> {
        return new Promise((resolve, reject) => {
            this.client.lrange(`comments:${key}`, start, end, (error: Error | null, reply: string[]) => {
                if (error) {
                    reject(error);
                }
                const list: ICommentDocument[] = [];
                for (const item of reply) {
                    list.push(Helpers.parseJson(item) as ICommentDocument);
                }
                resolve(list);
            });
        });
    }

    public getCommentNamesFromCache(key: string): Promise<ICommentNameList[]> {
        return new Promise((resolve, reject) => {
            this.client.llen(`comments:${key}`, (error: Error | null, reply: number) => {
                if (error) {
                    reject(error);
                }
                const multi: Multi = this.client.multi();
                multi.lrange(`comments:${key}`, 0, -1);
                multi.exec((err: Error | null, comments: string[]) => {
                    if (err) {
                        reject(err);
                    }
                    const list: string[] = [];
                    for (const item of comments[0]) {
                        const commentDocument: ICommentDocument = Helpers.parseJson(item) as ICommentDocument;
                        list.push(commentDocument.username);
                    }
                    const response: ICommentNameList = {
                        count: reply,
                        names: list
                    };
                    resolve([response]);
                });
            });
        });
    }

    public getSingleCommentFromCache(key: string, commentId: string): Promise<ICommentDocument[]> {
        return new Promise((resolve, reject) => {
            this.client.lrange(`comments:${key}`, 0, -1, (error: Error | null, reply: string[]) => {
                if (error) {
                    reject(error);
                }
                const list: ICommentDocument[] = [];
                for (const item of reply) {
                    list.push(Helpers.parseJson(item) as ICommentDocument);
                }
                const result: ICommentDocument = _.find(list, (listItem: ICommentDocument) => {
                    return listItem._id === commentId;
                }) as ICommentDocument;
                resolve([result]);
            });
        });
    }
}

export const commentCache: CommentCache = new CommentCache();
