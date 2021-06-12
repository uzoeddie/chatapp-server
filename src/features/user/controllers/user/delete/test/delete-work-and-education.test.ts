import { Request, Response } from 'express';
import { authUserPayload, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { Server } from 'socket.io';
import { DeleteWorkAndEducation } from '@user/controllers/user/delete/delete-work-and-education';
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

describe('DeleteWorkAndEducation', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('work', () => {
        it('should call "emit" and "addUserInfoJob" methods', async () => {
            const req: Request = authMockRequest({}, {}, authUserPayload, { workId: '12345' }) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userInfoCache, 'updateUserInfoListInCache');
            jest.spyOn(userServer.socketIOUserObject, 'emit');
            jest.spyOn(userInfoQueue, 'addUserInfoJob');

            await DeleteWorkAndEducation.prototype.work(req, res);
            expect(userInfoCache.updateUserInfoListInCache).toHaveBeenCalled();
            expect(userServer.socketIOUserObject.emit).toHaveBeenCalled();
            expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateUserWorkInCache', {
                key: 'Manny',
                value: null,
                type: 'remove',
                paramsId: '12345'
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Work deleted successfully',
                notification: false
            });
        });
    });

    describe('education', () => {
        it('should call "emit" and "addUserInfoJob" methods', async () => {
            const req: Request = authMockRequest({}, {}, authUserPayload, { schoolId: '12345' }) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userInfoCache, 'updateUserInfoListInCache');
            jest.spyOn(userServer.socketIOUserObject, 'emit');
            jest.spyOn(userInfoQueue, 'addUserInfoJob');

            await DeleteWorkAndEducation.prototype.education(req, res);
            expect(userInfoCache.updateUserInfoListInCache).toHaveBeenCalled();
            expect(userServer.socketIOUserObject.emit).toHaveBeenCalled();
            expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateUserSchoolInCache', {
                key: 'Manny',
                value: null,
                type: 'remove',
                paramsId: '12345'
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'School deleted successfully',
                notification: false
            });
        });
    });
});
