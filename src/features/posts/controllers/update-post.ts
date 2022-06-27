import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';
import { PostCache } from '@service/redis/post.cache';
import { postQueue } from '@service/queues/post.queue';
import { IPostDocument } from '@post/interfaces/post.interface';
import { uploads } from '@global/helpers/cloudinary-upload';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { postSchema, postWithImageSchema } from '@post/schemes/post.schemes';
import { socketIOPostObject } from '@socket/post';
import { BadRequestError } from '@global/helpers/error-handler';
import { imageQueue } from '@service/queues/image.queue';

const postCache: PostCache = new PostCache();

export class Update {
  @joiValidation(postSchema)
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
      feelings
    } as IPostDocument;
    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInCache', { key: postId, value: updatedPost });
    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully', postUpdated });
  }

  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body;
    if (imgId && imgVersion) {
      Update.prototype.updatePostWithImage(req);
    } else {
      const result = await Update.prototype.addImageToExistingPost(req);
      if (!result?.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Post with image updated successfully' });
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
      feelings
    } as IPostDocument;
    const postUpdated: IPostDocument = await postCache.updatePostInCache(req.params.postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInCache', { key: req.params.postId, value: updatedPost });
  }

  private async addImageToExistingPost(req: Request): Promise<UploadApiResponse> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } = req.body;
    const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
    if (!result?.public_id) {
      return result;
    }
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      gifUrl,
      profilePicture,
      imgId: result.public_id,
      imgVersion: result.version.toString(),
      feelings
    } as IPostDocument;
    const postUpdated: IPostDocument = await postCache.updatePostInCache(req.params.postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInCache', { key: req.params.postId, value: updatedPost });
    imageQueue.addImageJob('addImageToDB', {
      key: `${req.currentUser?.userId}`,
      imgId: result.public_id,
      imgVersion: result.version.toString()
    });
    return result;
  }
}
