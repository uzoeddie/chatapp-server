import { postCache } from '@service/redis/post.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { postQueue } from '@service/queues/post.queue';
import { socketIOPostObject } from '@socket/post';

export class Delete {
    public async post(req: Request, res: Response): Promise<void> {
        socketIOPostObject.emit('delete post', req.params.postId);
        await postCache.deletePostFromCache(req.params.postId, `${req.currentUser?.userId}`);
        postQueue.addPostJob('deletePostFromDB', { keyOne: req.params.postId, keyTwo: req.currentUser?.userId });
        res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully', notification: true });
    }
}