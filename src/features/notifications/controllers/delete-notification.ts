import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { notificationQueue } from '@service/queues/notification.queue';
import { socketIONotificationObject } from '@socket/notification';

export class Delete {
    public async notification(req: Request, res: Response): Promise<void> {
        socketIONotificationObject.emit('delete notification', req.params.notificationId);
        notificationQueue.addNotificationJob('deleteNotification', { key: req.params.notificationId });
        res.status(HTTP_STATUS.OK).json({ message: 'Notification deleted successfully', notification: false });
    }
}
