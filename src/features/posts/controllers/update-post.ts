import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';
import { postCache } from '@service/redis/post.cache';
import { postQueue } from '@service/queues/post.queue';
import { IPostDocument } from '@post/interfaces/post.interface';
import { uploads } from '@global/helpers/cloudinary-upload';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { postWithImageSchema } from '@post/schemes/post.schemes';
import { socketIOPostObject } from '@socket/post';

export class Update {
    @joiValidation(postWithImageSchema)
    public async post(req: Request, res: Response): Promise<void> {
        const { post, bgColor, privacy, gifUrl, profilePicture, imgId, imgVersion, feelings } = req.body;
        const { postId } = req.params;
        const updatedPost: IPostDocument = {
            post,
            bgColor,
            privacy,
            gifUrl,
            profilePicture,
            imgId,
            imgVersion,
            feelings,
            createdAt: new Date()
        } as IPostDocument;
        const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
        socketIOPostObject.emit('update post', postUpdated, 'posts');
        postQueue.addPostJob('updatePostInCache', { key: postId, value: updatedPost });
        res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully', notification: true, postUpdated });
    }

    @joiValidation(postWithImageSchema)
    public async postWithImage(req: Request, res: Response): Promise<void> {
        const { imgId, imgVersion } = req.body;
        if (imgId && imgVersion) {
            Update.prototype.updatePostWithImage(req);
        } else {
            Update.prototype.updatePostWithoutImage(req);
        }
        res.status(HTTP_STATUS.OK).json({ message: 'Post with image updated successfully', notification: true });
    }

    private async updatePostWithImage(req: Request): Promise<void> {
        const { post, bgColor, privacy, gifUrl, profilePicture, imgId, imgVersion, feelings } = req.body;
        const updatedPost: IPostDocument = {
            post,
            bgColor,
            privacy,
            gifUrl,
            profilePicture,
            imgId,
            imgVersion,
            feelings,
            createdAt: new Date()
        } as IPostDocument;
        const postUpdated: IPostDocument = await postCache.updatePostInCache(req.params.postId, updatedPost);
        socketIOPostObject.emit('update post', postUpdated, 'posts');
        postQueue.addPostJob('updatePostInCache', { key: req.params.postId, value: updatedPost });
    }

    private async updatePostWithoutImage(req: Request): Promise<void> {
        const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } = req.body;
        const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
        const updatedPost: IPostDocument = {
            post,
            bgColor,
            privacy,
            gifUrl,
            profilePicture,
            imgId: result.public_id,
            imgVersion: result.version.toString(),
            feelings,
            createdAt: new Date()
        } as IPostDocument;
        const postUpdated: IPostDocument = await postCache.updatePostInCache(req.params.postId, updatedPost);
        socketIOPostObject.emit('update post', postUpdated, 'posts');
        postQueue.addPostJob('updatePostInCache', { key: req.params.postId, value: updatedPost });
    }
}
