import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserCache } from '@service/redis/user.cache';
import { UserModel } from '@user/models/user.schema';

const userCache = new UserCache();

export class CurrentUser {
    public async read(req: Request, res: Response): Promise<void> {
        let isUser = false;
        let token = null;
        let user = null;
        const cachedUser: IUserDocument = await userCache.getUserFromCache(`${req.currentUser?.userId}`) as IUserDocument;
        const existingUser: IUserDocument = cachedUser
            ? cachedUser
            : ((await UserModel.findById({ _id: `${req.currentUser?.userId}` }).exec()) as IUserDocument);
        if (existingUser) {
            isUser = true;
            token = req.session?.jwt;
            user = existingUser;
        }
        res.status(HTTP_STATUS.OK).json({ token, isUser, user });
    }
}
