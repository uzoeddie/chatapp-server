import { imageQueue } from '@service/queues/image.queue';
import { socketIOImageObject } from '@socket/image';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class Delete {
    public async image(req: Request, res: Response): Promise<void> {
        socketIOImageObject.emit('delete image', req.params.imageId);
        imageQueue.addImageJob('removeImageFromDB', {
            userId: req.currentUser?.userId,
            imageId: req.params.imageId
        });
        res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully', notification: true });
    }
}
