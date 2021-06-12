import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { userInfoQueue } from '@service/queues/user-info.queue';
import { userInfoCache } from '@service/redis/user-info.cache';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { placesSchema } from '@user/schemes/user/info';
import { IUserPlacesLived, IUserDocument } from '@user/interfaces/user.interface';
import { socketIOUserObject } from '@socket/user';

export class EditPlaces {
    @joiValidation(placesSchema)
    public async places(req: Request, res: Response): Promise<void> {
        const { city, country, year, month } = req.body;
        const placesLived: IUserPlacesLived = {
            _id: req.params.placeId,
            city,
            country,
            year,
            month
        };
        const cachedUser: IUserDocument = await userInfoCache.updateUserInfoListInCache({
            key: `${req.currentUser?.userId}`,
            prop: 'placesLived',
            value: placesLived,
            type: 'edit'
        });
        socketIOUserObject.emit('update user', cachedUser);
        userInfoQueue.addUserInfoJob('updateUserPlaceInCache', {
            key: `${req.currentUser?.username}`,
            value: placesLived,
            type: 'edit',
            paramsId: req.params.placeId
        });
        res.status(HTTP_STATUS.OK).json({ message: 'Places updated successfully', notification: false });
    }
}
