import { Request, Response } from 'express';
import { authUserPayload, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { Server } from 'socket.io';
import { DeletePlacesLived } from '@user/controllers/user/delete/delete-places';
import * as userServer from '@socket/user';
import { userInfoQueue } from '@service/queues/user-info.queue';
import { userInfoCache } from '@service/redis/user-info.cache';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@socket/user');
jest.mock('@service/redis/user-info.cache');
jest.mock('@service/queues/user-info.queue');

Object.defineProperties(userServer, {
    socketIOUserObject: {
        value: new Server(),
        writable: true
    }
});

describe('DeletePlacesLived', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('places', () => {
        it('should call "emit" and "addUserInfoJob" methods', async () => {
            const req: Request = authMockRequest({}, {}, authUserPayload, { placeId: '12345' }) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userServer.socketIOUserObject, 'emit');
            jest.spyOn(userInfoCache, 'updateUserInfoListInCache');
            jest.spyOn(userInfoQueue, 'addUserInfoJob');

            await DeletePlacesLived.prototype.places(req, res);
            expect(userInfoCache.updateUserInfoListInCache).toHaveBeenCalled();
            expect(userServer.socketIOUserObject.emit).toHaveBeenCalled();
            expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateUserPlaceInCache', {
                key: 'Manny',
                value: null,
                type: 'remove',
                paramsId: '12345'
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Places deleted successfully',
                notification: false
            });
        });
    });
});
