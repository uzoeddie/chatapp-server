import { Request, Response } from 'express';
import mongoose from 'mongoose';
import HTTP_STATUS from 'http-status-codes';
import { reactionCache } from '@service/redis/reaction.cache';
import { IReactionDocument } from '@reaction/interfaces/reaction.interface';
import { reactionService } from '@service/db/reaction.service';

const PAGE_SIZE = 2;

export class Get {
    public async reactions(req: Request, res: Response): Promise<void> {
        const { postId, page } = req.params;
        const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
        const limit: number = PAGE_SIZE * parseInt(page);
        const newSkip: number = skip === 0 ? skip : skip + 1;
        const cachedReactions: [IReactionDocument[], number] = await reactionCache.getReactionsFromCache(postId, newSkip, limit);
        const reactions: [IReactionDocument[], number] = cachedReactions[0].length
            ? cachedReactions
            : await reactionService.getPostReactions({ postId: mongoose.Types.ObjectId(postId) }, 0, 100, { createdAt: -1 });
        res.status(HTTP_STATUS.OK).json({ message: 'Post reactions', reactions: reactions[0], count: reactions[1], notification: false });
    }

    public async singleReaction(req: Request, res: Response): Promise<void> {
        const { postId, reactionId } = req.params;
        const cachedReaction: [IReactionDocument[], number] = await reactionCache.getSingleReactionFromCache(postId, reactionId);
        const reactions: [IReactionDocument[], number] = cachedReaction[0].length
            ? cachedReaction
            : await reactionService.getPostReactions({ _id: mongoose.Types.ObjectId(reactionId) }, 0, 1);
        res.status(HTTP_STATUS.OK).json({
            message: 'Single post reaction',
            reactions: reactions[0],
            count: reactions[1],
            notification: false
        });
    }
}
