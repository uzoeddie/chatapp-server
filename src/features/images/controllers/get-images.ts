import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { LeanDocument } from 'mongoose';
import { ImageModel } from '@image/models/image.schema';
import { IFileImageDocument } from '@image/interface/image.interface';

export class Get {
    public async images(req: Request, res: Response): Promise<void> {
        const images: (LeanDocument<IFileImageDocument> | null)[] = await Promise.all([
            ImageModel.findOne({ userId: req.params.userId }).lean()
        ]);
        res.status(HTTP_STATUS.OK).json({ message: 'User images', images: images[0], notification: false });
    }
}
