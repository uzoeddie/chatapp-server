import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { userInfoQueue } from '@service/queues/user-info.queue';
import { userInfoCache } from '@service/redis/user-info.cache';
import { IUserPlacesLived, IUserDocument } from '@user/interfaces/user.interface';
import { socketIOUserObject } from '@socket/user';

export class DeletePlacesLived {
    public async places(req: Request, res: Response): Promise<void> {
        const placesLived: IUserPlacesLived = {
            _id: '',
            city: '',
            country: '',
            year: '',
            month: ''
        };
        const cachedUser: IUserDocument = await userInfoCache.updateUserInfoListInCache({
            key: `${req.currentUser?.userId}`,
            prop: 'placesLived',
            value: placesLived,
            type: 'remove',
            deletedItemId: req.params.placeId
        });
        socketIOUserObject.emit('update user', cachedUser);
        userInfoQueue.addUserInfoJob('updateUserPlaceInCache', {
            key: `${req.currentUser?.username}`,
            value: null,
            type: 'remove',
            paramsId: req.params.placeId
        });
        res.status(HTTP_STATUS.OK).json({ message: 'Places deleted successfully', notification: false });
    }
}
