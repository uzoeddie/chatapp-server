import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IReactionJob } from '@reaction/interfaces/reaction.interface';
import { reactionCache } from '@service/redis/reaction.cache';
import { reactionQueue } from '@service/queues/reaction.queue';
import { socketIOPostObject } from '@socket/post';

export class Remove {
    public async reaction(req: Request, res: Response): Promise<void> {
        const { postId, previousReaction } = req.params;
        await reactionCache.removePostReactionFromCache(postId, `${req.currentUser?.username}`);
        socketIOPostObject.emit('remove reaction', {
            postId,
            previousReaction,
            username: req.currentUser!.username
        });
        const dbReactionData: IReactionJob = {
            postId,
            username: req.currentUser!.username,
            previousReaction
        };
        reactionQueue.addReactionJob('removeReactionFromDB', dbReactionData);
        res.status(HTTP_STATUS.OK).json({ message: 'Reaction removed from post', notification: false });
    }
}
