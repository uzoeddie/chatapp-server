import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { userInfoQueue } from '@service/queues/user-info.queue';
import { userInfoCache } from '@service/redis/user-info.cache';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { workSchema, educationSchema } from '@user/schemes/user/info';
import { IUserWork, IUserSchool, IUserDocument } from '@user/interfaces/user.interface';
import { socketIOUserObject } from '@socket/user';

export class EditWorkAndEducation {
    @joiValidation(workSchema)
    public async work(req: Request, res: Response): Promise<void> {
        const { company, position, city, description, from, to } = req.body;
        const { workId } = req.params;
        const work: IUserWork = {
            _id: workId,
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
            type: 'edit'
        });
        socketIOUserObject.emit('update user', cachedUser);
        userInfoQueue.addUserInfoJob('updateUserWorkInCache', {
            key: `${req.currentUser?.username}`,
            value: work,
            type: 'edit',
            paramsId: workId
        });
        res.status(HTTP_STATUS.OK).json({ message: 'Work updated successfully', notification: false });
    }

    @joiValidation(educationSchema)
    public async education(req: Request, res: Response): Promise<void> {
        const { name, course, degree, from, to } = req.body;
        const { schoolId } = req.params;
        const school: IUserSchool = {
            _id: schoolId,
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
            type: 'edit'
        });
        socketIOUserObject.emit('update user', cachedUser);
        userInfoQueue.addUserInfoJob('updateUserSchoolInCache', {
            key: `${req.currentUser?.username}`,
            value: school,
            type: 'edit',
            paramsId: schoolId
        });
        res.status(HTTP_STATUS.OK).json({ message: 'School updated successfully', notification: false });
    }
}
