import { notificationQueue } from '@service/queues/notification.queue';
import { socketIONotificationObject } from '@socket/notification';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class Update {
  public async notification(req: Request, res: Response): Promise<void> {
    socketIONotificationObject.emit('update notification', req.params.notificationId);
    notificationQueue.addNotificationJob('updateNotification', { key: req.params.notificationId });
    res.status(HTTP_STATUS.OK).json({ message: 'Notification marked as read' });
  }
}
