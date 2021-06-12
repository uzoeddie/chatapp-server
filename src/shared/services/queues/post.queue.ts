import { IPostJobData } from '@post/interfaces/post.interface';
import { BaseQueue } from '@service/queues/base.queue';
import { postWorker } from '@worker/post.worker';

class PostQueue extends BaseQueue {
    constructor() {
        super('posts');
        this.processJob('savePostToDB', 5, postWorker.savePostWorker);
        this.processJob('updatePostInCache', 5, postWorker.updatePostWorker);
        this.processJob('deletePostFromDB', 5, postWorker.deletePostWorker);
    }

    public addPostJob(name: string, data: IPostJobData): void {
        this.addJob(name, data);
    }
}

export const postQueue: PostQueue = new PostQueue();
