import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectID } from 'mongodb';
import { userInfoQueue } from '@service/queues/user-info.queue';
import { userInfoCache } from '@service/redis/user-info.cache';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { workSchema, educationSchema } from '@user/schemes/user/info';
import { IUserWork, IUserSchool, IUserDocument } from '@user/interfaces/user.interface';
import { socketIOUserObject } from '@socket/user';

export class AddWorkAndEducation {
    @joiValidation(workSchema)
    public async work(req: Request, res: Response): Promise<void> {
        const { company, position, city, description, from, to } = req.body;
        const work: IUserWork = {
            _id: new ObjectID(),
            city,
            company,
            position,
            description,
            from,
            to
        };
        const cachedUser: IUserDocument = await userInfoCache.updateUserInfoListInCache({
            key: `${req.currentUser?.userId}`,
            prop: 'work',
            value: work,
            type: 'add'
        });
        socketIOUserObject.emit('update user', cachedUser);
        userInfoQueue.addUserInfoJob('updateUserWorkInCache', { key: `${req.currentUser?.username}`, value: work, type: 'add' });
        res.status(HTTP_STATUS.OK).json({ message: 'Work updated successfully', notification: false });
    }

    @joiValidation(educationSchema)
    public async education(req: Request, res: Response): Promise<void> {
        const { name, course, degree, from, to } = req.body;
        const school: IUserSchool = {
            _id: new ObjectID(),
            name,
            course,
            degree,
            from,
            to
        };
        const cachedUser: IUserDocument = await userInfoCache.updateUserInfoListInCache({
            key: `${req.currentUser?.userId}`,
            prop: 'school',
            value: school,
            type: 'add'
        });
        socketIOUserObject.emit('update user', cachedUser);
        userInfoQueue.addUserInfoJob('updateUserSchoolInCache', { key: `${req.currentUser?.username}`, value: school, type: 'add' });
        res.status(HTTP_STATUS.OK).json({ message: 'School updated successfully', notification: false });
    }
}
