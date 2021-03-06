import { IFileImageDocument } from '@image/interface/image.interface';
import { imageQueue } from '@service/queues/image.queue';
import { UserInfoCache } from '@service/redis/user-info.cache';
import { socketIOImageObject } from '@socket/image';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { imageService } from '@service/db/image.service';

const userInfoCache: UserInfoCache = new UserInfoCache();

export class Delete {
  public async image(req: Request, res: Response): Promise<void> {
    socketIOImageObject.emit('delete image', req.params.imageId);
    imageQueue.addImageJob('removeImageFromDB', {
      imageId: req.params.imageId
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully' });
  }

  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const image: IFileImageDocument = await imageService.getImageByBackgroundId(req.params.bgImageId);
    socketIOImageObject.emit('delete image', image?._id);
    const bgImgId: Promise<IUserDocument | null> = userInfoCache.updateSingleUserItemInCache(`${req.currentUser?.userId}`, 'bgImageId', '');
    const bgImgVersion: Promise<IUserDocument | null> = userInfoCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      'bgImageVersion',
      ''
    );
    await Promise.all([bgImgId, bgImgVersion]);
    imageQueue.addImageJob('removeImageFromDB', {
      imageId: image?._id
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully' });
  }
}
