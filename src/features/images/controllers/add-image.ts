import { Request, Response } from 'express';
import { UploadApiResponse } from 'cloudinary';
import HTTP_STATUS from 'http-status-codes';
import { uploads } from '@global/helpers/cloudinary-upload';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { addImageSchema } from '@image/schemes/images';
import { imageQueue } from '@service/queues/image.queue';
import { IUserDocument } from '@user/interfaces/user.interface';
import { socketIOImageObject } from '@socket/image';
import { BadRequestError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { IBgUploadResponse } from '@image/interface/image.interface';
import { UserCache } from '@service/redis/user.cache';

const userCache: UserCache = new UserCache();

export class Add {
  @joiValidation(addImageSchema)
  public async image(req: Request, res: Response): Promise<void> {
    const result: UploadApiResponse = (await uploads(req.body.image, req.currentUser?.userId, true, true)) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError(result.message);
    }
    const url = `https://res.cloudinary.com/dyamr9ym3/image/upload/v${result.version}/${result.public_id}`;
    const cachedUser: IUserDocument | null = await userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      'profilePicture',
      url
    );
    socketIOImageObject.emit('update user', cachedUser);
    imageQueue.addImageJob('addUserProfileImageToDB', {
      key: `${req.currentUser?.userId}`,
      value: url,
      imgId: result.public_id,
      imgVersion: result.version.toString()
    });
    res.status(HTTP_STATUS.CREATED).json({ message: 'Image added successfully' });
  }

  @joiValidation(addImageSchema)
  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const { version, publicId }: IBgUploadResponse = await Add.prototype.backgroundUpload(req.body.image);
    const bgImageId: Promise<IUserDocument | null> = userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      'bgImageId',
      publicId
    );
    const bgImageVersion: Promise<IUserDocument | null> = userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      'bgImageVersion',
      version
    );
    const response: [IUserDocument | null, IUserDocument | null] = await Promise.all([bgImageId, bgImageVersion]);
    socketIOImageObject.emit('update user', {
      bgImageId: publicId,
      bgImageVersion: version,
      userId: response[0]
    });
    imageQueue.addImageJob('updateBGImageInDB', {
      key: `${req.currentUser?.userId}`,
      imgId: publicId,
      imgVersion: version.toString()
    });
    res.status(HTTP_STATUS.CREATED).json({ message: 'Image added successfully' });
  }

  private async backgroundUpload(image: string): Promise<IBgUploadResponse> {
    const isDataURL = Helpers.isDataURL(image);
    let version = '';
    let publicId = '';
    if (isDataURL) {
      const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
      if (!result?.public_id) {
        throw new BadRequestError(result.message);
      } else {
        version = result.version.toString();
        publicId = result.public_id;
      }
    } else {
      const value = image.split('/');
      const imageVersion = value[value.length - 2];
      const imagePublicId = value[value.length - 1];
      version = imageVersion;
      publicId = imagePublicId;
    }
    return { version: version.replace(/v/g, ''), publicId };
  }
}
