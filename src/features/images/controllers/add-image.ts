import { Request, Response } from 'express';
import { UploadApiResponse } from 'cloudinary';
import HTTP_STATUS from 'http-status-codes';
import { uploads } from '@global/helpers/cloudinary-upload';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { addImageSchema } from '@image/schemes/images';
import { userInfoCache } from '@service/redis/user-info.cache';
import { imageQueue } from '@service/queues/image.queue';
import { IUserDocument } from '@user/interfaces/user.interface';
import { socketIOImageObject } from '@socket/image';

export class Add {
    @joiValidation(addImageSchema)
    public async image(req: Request, res: Response): Promise<void> {
        const result: UploadApiResponse = (await uploads(req.body.image, req.currentUser?.userId, true, true)) as UploadApiResponse;
        const url = `https://res.cloudinary.com/ratingapp/image/upload/${result.public_id}`;
        const cachedUser: IUserDocument = await userInfoCache.updateSingleUserItemInCache(
            `${req.currentUser?.userId}`,
            'profilePicture',
            url
        );
        socketIOImageObject.emit('update user', cachedUser);
        imageQueue.addImageJob('updateImageInDB', {
            key: `${req.currentUser?.userId}`,
            value: url
        });
        res.status(HTTP_STATUS.CREATED).json({ message: 'Image added successfully', notification: true });
    }

    @joiValidation(addImageSchema)
    public async backgroundImage(req: Request, res: Response): Promise<void> {
        const result: UploadApiResponse = (await uploads(req.body.image)) as UploadApiResponse;
        const bgImageId: Promise<IUserDocument> = userInfoCache.updateSingleUserItemInCache(
            `${req.currentUser?.userId}`,
            'bgImageId',
            result.public_id
        );
        const bgImageVersion: Promise<IUserDocument> = userInfoCache.updateSingleUserItemInCache(
            `${req.currentUser?.userId}`,
            'bgImageVersion',
            result.version
        );
        const response: [IUserDocument, IUserDocument] = await Promise.all([bgImageId, bgImageVersion]);
        socketIOImageObject.emit('update user', {
            bgImageId: result.public_id,
            bgImageVersion: result.version,
            userId: response[0]
        });
        imageQueue.addImageJob('updateBGImageInDB', {
            key: `${req.currentUser?.userId}`,
            imgId: result.public_id,
            imgVersion: result.version.toString()
        });
        res.status(HTTP_STATUS.CREATED).json({ message: 'Image added successfully', notification: true });
    }
}