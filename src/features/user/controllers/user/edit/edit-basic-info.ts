import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { userInfoQueue } from '@service/queues/user-info.queue';
import { UserInfoCache } from '@service/redis/user-info.cache';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { basicInfoSchema, socialLinksSchema } from '@user/schemes/user/info';

const userInfoCache: UserInfoCache = new UserInfoCache();

export class EditBasicInfo {
  @joiValidation(basicInfoSchema)
  public async info(req: Request, res: Response): Promise<void> {
    for (const [key, value] of Object.entries(req.body)) {
      await userInfoCache.updateUserInfoListInCache(`${req.currentUser?.userId}`, key, `${value}`);
    }
    userInfoQueue.addUserInfoJob('updateUserInfoInCache', {
      key: `${req.currentUser?.userId}`,
      value: req.body
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Updated successfully' });
  }

  @joiValidation(socialLinksSchema)
  public async social(req: Request, res: Response): Promise<void> {
    await userInfoCache.updateUserInfoListInCache(`${req.currentUser?.userId}`, 'social', req.body);
    userInfoQueue.addUserInfoJob('updateSocialLinksInCache', {
      key: `${req.currentUser?.userId}`,
      value: req.body
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Updated successfully' });
  }
}
