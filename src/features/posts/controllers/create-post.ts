import { IPostDocument } from '@post/interfaces/post.interface';
import { Request, Response } from 'express';
import { ObjectID } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';
import { postCache } from '@service/redis/post.cache';
import { postQueue } from '@service/queues/post.queue';
import { uploads } from '@global/helpers/cloudinary-upload';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { postSchema, postWithImageSchema } from '@post/schemes/post.schemes';
import { socketIOPostObject } from '@socket/post';

export class Create {
    @joiValidation(postSchema)
    public async post(req: Request, res: Response): Promise<void> {
        const { post, bgColor, privacy, gifUrl, profilePicture } = req.body;
        let { feelings } = req.body;
        if (!feelings) {
            feelings = {};
        }

        const postObjectId: ObjectID = new ObjectID();
        const createdPost: IPostDocument = ({
            _id: postObjectId,
            userId: req.currentUser?.userId,
            username: req.currentUser?.username,
            email: req.currentUser?.email,
            avatarColor: req.currentUser?.avatarColor,
            profilePicture,
            post,
            bgColor,
            feelings,
            privacy,
            gifUrl,
            commentsCount: 0,
            imgVersion: '',
            imgId: '',
            reactions: [],
            createdAt: new Date()
        } as unknown) as IPostDocument;

        await postCache.savePostToCache({
            key: postObjectId,
            currentUserId: `${req.currentUser?.userId}`,
            uId: `${req.currentUser?.uId}`,
            createdPost
        });
        socketIOPostObject.emit('add post', createdPost, 'posts');
        delete createdPost.reactions;
        postQueue.addPostJob('savePostToDB', { key: req.currentUser?.userId, value: createdPost });
        res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully', notification: true });
    }

    @joiValidation(postWithImageSchema)
    public async postWithImage(req: Request, res: Response): Promise<void> {
        const { post, bgColor, privacy, gifUrl, profilePicture, image } = req.body;
        let { feelings } = req.body;
        if (!feelings) {
            feelings = {};
        }
        const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
        const postObjectId: ObjectID = new ObjectID();
        const createdPost: IPostDocument = ({
            _id: postObjectId,
            userId: req.currentUser?.userId,
            username: req.currentUser?.username,
            email: req.currentUser?.email,
            avatarColor: req.currentUser?.avatarColor,
            profilePicture,
            post,
            bgColor,
            feelings,
            privacy,
            gifUrl,
            commentsCount: 0,
            imgVersion: result.version.toString(),
            imgId: result.public_id,
            reactions: [],
            createdAt: new Date()
        } as unknown) as IPostDocument;

        await postCache.savePostToCache({
            key: postObjectId,
            currentUserId: `${req.currentUser?.userId}`,
            uId: `${req.currentUser?.uId}`,
            createdPost
        });
        socketIOPostObject.emit('add post', createdPost, 'posts');
        delete createdPost.reactions;
        postQueue.addPostJob('savePostToDB', { key: req.currentUser?.userId, value: createdPost });
        res.status(HTTP_STATUS.CREATED).json({ message: 'Post created with image successfully', notification: true });
    }
}
