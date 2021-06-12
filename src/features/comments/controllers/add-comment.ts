import { Request, Response } from 'express';
import { ObjectID } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { ICommentDocument, ICommentJob } from '@comment/interfaces/comment.interface';
import { commentCache } from '@service/redis/comment.cache';
import { commentQueue } from '@service/queues/comment.queue';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { addCommentSchema } from '@comment/schemes/comment';

export class Add {
    @joiValidation(addCommentSchema)
    public async comment(req: Request, res: Response): Promise<void> {
        const { postId, comment, profilePicture, userTo } = req.body;
        const commentObjectId: ObjectID = new ObjectID();
        const commentData: ICommentDocument = ({
            _id: commentObjectId,
            postId,
            username: `${req.currentUser?.username}`,
            avataColor: `${req.currentUser?.avatarColor}`,
            comment,
            profilePicture,
            createdAt: new Date()
        } as unknown) as ICommentDocument;
        await commentCache.savePostCommentToCache(postId, JSON.stringify(commentData));

        const dbCommentData: ICommentJob = {
            postId,
            userTo,
            userFrom: req.currentUser!.userId,
            username: req.currentUser!.username,
            comment: commentData
        };
        commentQueue.addCommentJob('addCommentToDB', dbCommentData);
        res.status(HTTP_STATUS.OK).json({ message: 'Comment created successfully', notification: false });
    }
}
