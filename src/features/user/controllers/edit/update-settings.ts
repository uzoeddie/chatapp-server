import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { notificationSettingsSchema } from '@user/schemes/info';
import { UserCache } from '@service/redis/user.cache';
import { userQueue } from '@service/queues/user.queue';

const userCache: UserCache = new UserCache();

export class Settings {
  @joiValidation(notificationSettingsSchema)
  public async update(req: Request, res: Response): Promise<void> {
    await userCache.updateSingleUserItemInCache(`${req.currentUser?.userId}`, 'notifications', req.body);
    userQueue.addUserJob('updateNotificationSettings', { key: `${req.currentUser?.userId}`, value: req.body });
    res.status(HTTP_STATUS.OK).json({ message: 'Notification settings updated successfully', settings: req.body });
  }
}
