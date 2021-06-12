import { Request, Response } from 'express';
import { authUserPayload, IAuthMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { Server } from 'socket.io';
import * as userServer from '@socket/user';
import { userInfoQueue } from '@service/queues/user-info.queue';
import { AddPlaces } from '@user/controllers/user/add/add-places';

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

describe('AddPlacesLived', () => {
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
                city: 'Dusseldorf',
                country: 'Germany',
                year: '2021',
                month: 'March'
            };
            const req: Request = authMockRequest({}, placesLived, authUserPayload) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userServer.socketIOUserObject, 'emit');
            jest.spyOn(userInfoQueue, 'addUserInfoJob');

            await AddPlaces.prototype.places(req, res);
            expect(userServer.socketIOUserObject.emit).toHaveBeenCalled();
            expect(userInfoQueue.addUserInfoJob).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Place updated successfully',
                notification: false
            });
        });
    });
});
