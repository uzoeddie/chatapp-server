import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ImageModel } from '@image/models/image.schema';
import { IFileImageDocument } from '@image/interface/image.interface';

export class Get {
  public async images(req: Request, res: Response): Promise<void> {
    const images: IFileImageDocument[] = (await ImageModel.find({ userId: req.params.userId }).exec()) as IFileImageDocument[];
    res.status(HTTP_STATUS.OK).json({ message: 'User images', images });
  }
}
