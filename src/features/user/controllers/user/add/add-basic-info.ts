import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { userInfoQueue } from '@service/queues/user-info.queue';
import { userInfoCache } from '@service/redis/user-info.cache';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { genderSchema, relationshipSchema, birthdaySchema } from '@user/schemes/user/info';
import { socketIOUserObject } from '@socket/user';
import { IUserDocument } from '@user/interfaces/user.interface';

export class AddBasicInfo {
    @joiValidation(genderSchema)
    public async gender(req: Request, res: Response): Promise<void> {
        const { gender } = req.body;
        const cachedUser: IUserDocument = await userInfoCache.updateSingleUserItemInCache(`${req.currentUser?.userId}`, 'gender', gender);
        socketIOUserObject.emit('update user', cachedUser);
        userInfoQueue.addUserInfoJob('updateGenderInCache', { key: `${req.currentUser?.username}`, value: gender });
        res.status(HTTP_STATUS.OK).json({ message: 'Gender updated successfully', notification: false });
    }

    @joiValidation(birthdaySchema)
    public async birthday(req: Request, res: Response): Promise<void> {
        const { month, day } = req.body;
        const cachedUser: IUserDocument = await userInfoCache.updateSingleUserItemInCache(`${req.currentUser?.userId}`, 'birthDay', {
            month,
            day
        });
        socketIOUserObject.emit('update user', cachedUser);
        userInfoQueue.addUserInfoJob('updateBirthdayInCache', { key: `${req.currentUser?.username}`, value: { month, day } });
        res.status(HTTP_STATUS.OK).json({ message: 'Birthday updated successfully', notification: false });
    }

    @joiValidation(relationshipSchema)
    public async relationship(req: Request, res: Response): Promise<void> {
        const { relationship } = req.body;
        const cachedUser: IUserDocument = await userInfoCache.updateSingleUserItemInCache(
            `${req.currentUser?.userId}`,
            'relationship',
            relationship
        );
        socketIOUserObject.emit('update user', cachedUser);
        userInfoQueue.addUserInfoJob('updateRelationshipInCache', { key: `${req.currentUser?.username}`, value: relationship });
        res.status(HTTP_STATUS.OK).json({ message: 'Relationship updated successfully', notification: false });
    }
}
