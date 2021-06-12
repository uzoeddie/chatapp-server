import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { userInfoQueue } from '@service/queues/user-info.queue';
import { userInfoCache } from '@service/redis/user-info.cache';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { aboutSchema, quotesSchema } from '@user/schemes/user/info';
import { socketIOUserObject } from '@socket/user';
import { IUserDocument } from '@user/interfaces/user.interface';

export class AddDetails {
    @joiValidation(aboutSchema)
    public async about(req: Request, res: Response): Promise<void> {
        const { about } = req.body;
        const cachedUser: IUserDocument = await userInfoCache.updateSingleUserItemInCache(`${req.currentUser?.userId}`, 'about', about);
        socketIOUserObject.emit('update user', cachedUser);
        userInfoQueue.addUserInfoJob('updateAboutInfoInCache', { key: `${req.currentUser?.username}`, value: about });
        res.status(HTTP_STATUS.OK).json({ message: 'About you updated successfully', notification: false });
    }

    @joiValidation(quotesSchema)
    public async quotes(req: Request, res: Response): Promise<void> {
        const { quotes } = req.body;
        const cachedUser: IUserDocument = await userInfoCache.updateSingleUserItemInCache(`${req.currentUser?.userId}`, 'quotes', quotes);
        socketIOUserObject.emit('update user', cachedUser);
        userInfoQueue.addUserInfoJob('updateQuotesInCache', { key: `${req.currentUser?.username}`, value: quotes });
        res.status(HTTP_STATUS.OK).json({ message: 'Quotes updated successfully', notification: false });
    }
}
