import { Request, Response } from 'express';
import { authUserPayload, IAuthMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { Server } from 'socket.io';
import { EditPlaces } from '@user/controllers/user/edit/edit-places';
import * as userServer from '@socket/user';
import { userInfoQueue } from '@service/queues/user-info.queue';
import { userInfoCache } from '@service/redis/user-info.cache';
import { existingUser } from '@root/mocks/user.mock';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@socket/user');
jest.mock('@service/redis/user-info.cache');

Object.defineProperties(userServer, {
    socketIOUserObject: {
        value: new Server(),
        writable: true
    }
});

describe('EditPlaces', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('places', () => {
        it('should call "emit" and "addUserInfoJob" methods', async () => {
            const placesLived: IAuthMock = {
                _id: '12345',
                city: 'Dusseldorf',
                country: 'Germany',
                year: '2021',
                month: 'March'
            };
            const req: Request = authMockRequest({}, placesLived, authUserPayload, { placeId: '12345' }) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userInfoCache, 'updateUserInfoListInCache');
            jest.spyOn(userServer.socketIOUserObject, 'emit');
            jest.spyOn(userInfoQueue, 'addUserInfoJob');

            await EditPlaces.prototype.places(req, res);
            expect(userInfoCache.updateUserInfoListInCache).toHaveBeenCalledWith({
                key: existingUser._id,
                prop: 'placesLived',
                value: placesLived,
                type: 'edit'
            });
            expect(userServer.socketIOUserObject.emit).toHaveBeenCalled();
            expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateUserPlaceInCache', {
                key: 'Manny',
                value: placesLived,
                type: 'edit',
                paramsId: '12345'
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Places updated successfully',
                notification: false
            });
        });
    });
});
