import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { LeanDocument } from 'mongoose';
import { NotificationModel } from '@notification/models/notification.schema';
import { INotificationDocument } from '@notification/interfaces/notification.interface';

export class Get {
    public async notification(req: Request, res: Response): Promise<void> {
        const notifications: LeanDocument<INotificationDocument>[] = await NotificationModel.find({ userTo: req.currentUser?.userId })
            .lean()
            .populate({
                path: 'userFrom',
                select: 'username avatarColor uId profilePicture'
            })
            .sort({ date: -1 })
            .exec();
        res.status(HTTP_STATUS.OK).json({ message: 'User notifications', notifications, notification: false });
    }
}
