import { Request, Response } from 'express';
import { authUserPayload, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { Server } from 'socket.io';
import { AddWorkAndEducation } from '@user/controllers/user/add/add-work-and-education';
import * as userServer from '@socket/user';
import { userInfoQueue } from '@service/queues/user-info.queue';

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

describe('AddWorkAndEducation', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('work', () => {
        it('should call "emit" and "addUserInfoJob" methods', async () => {
            const work = {
                company: 'KickChat',
                position: 'CEO',
                city: 'Berlin',
                description: '',
                from: '2021',
                to: 'Present'
            };
            const req: Request = authMockRequest({}, work, authUserPayload) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userServer.socketIOUserObject, 'emit');
            jest.spyOn(userInfoQueue, 'addUserInfoJob');

            await AddWorkAndEducation.prototype.work(req, res);
            expect(userServer.socketIOUserObject.emit).toHaveBeenCalled();
            expect(userInfoQueue.addUserInfoJob).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Work updated successfully',
                notification: false
            });
        });
    });

    describe('education', () => {
        it('should call "emit" and "addUserInfoJob" methods', async () => {
            const school = {
                name: 'Tallinn Tech',
                course: 'Computer Engineering',
                degree: 'M.Sc',
                from: '2014',
                to: '2016'
            };
            const req: Request = authMockRequest({}, school, authUserPayload) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userServer.socketIOUserObject, 'emit');
            jest.spyOn(userInfoQueue, 'addUserInfoJob');

            await AddWorkAndEducation.prototype.education(req, res);
            expect(userServer.socketIOUserObject.emit).toHaveBeenCalled();
            expect(userInfoQueue.addUserInfoJob).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'School updated successfully',
                notification: false
            });
        });
    });
});
