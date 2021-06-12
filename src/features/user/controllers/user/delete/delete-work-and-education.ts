import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { userInfoQueue } from '@service/queues/user-info.queue';
import { userInfoCache } from '@service/redis/user-info.cache';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { workSchema, educationSchema } from '@user/schemes/user/info';
import { IUserWork, IUserSchool, IUserDocument } from '@user/interfaces/user.interface';
import { socketIOUserObject } from '@socket/user';

export class DeleteWorkAndEducation {
    @joiValidation(workSchema)
    public async work(req: Request, res: Response): Promise<void> {
        const work: IUserWork = {
            _id: '',
            city: '',
            company: '',
            position: '',
            description: '',
            from: '',
            to: ''
        };
        const cachedUser: IUserDocument = await userInfoCache.updateUserInfoListInCache({
            key: `${req.currentUser?.userId}`,
            prop: 'work',
            value: work,
            type: 'remove',
            deletedItemId: req.params.workId
        });
        socketIOUserObject.emit('update user', cachedUser);
        userInfoQueue.addUserInfoJob('updateUserWorkInCache', {
            key: `${req.currentUser?.username}`,
            value: null,
            type: 'remove',
            paramsId: req.params.workId
        });
        res.status(HTTP_STATUS.OK).json({ message: 'Work deleted successfully', notification: false });
    }

    @joiValidation(educationSchema)
    public async education(req: Request, res: Response): Promise<void> {
        const school: IUserSchool = {
            _id: '',
            name: '',
            course: '',
            degree: '',
            from: '',
            to: ''
        };
        const cachedUser: IUserDocument = await userInfoCache.updateUserInfoListInCache({
            key: `${req.currentUser?.userId}`,
            prop: 'school',
            value: school,
            type: 'remove',
            deletedItemId: req.params.schoolId
        });
        socketIOUserObject.emit('update user', cachedUser);
        userInfoQueue.addUserInfoJob('updateUserSchoolInCache', {
            key: `${req.currentUser?.username}`,
            value: null,
            type: 'remove',
            paramsId: req.params.schoolId
        });
        res.status(HTTP_STATUS.OK).json({ message: 'School deleted successfully', notification: false });
    }
}
