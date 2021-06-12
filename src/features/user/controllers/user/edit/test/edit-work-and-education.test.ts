import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { authUserPayload, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { EditWorkAndEducation } from '@user/controllers/user/edit/edit-work-and-education';
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

describe('EditWorkAndEducation', () => {
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
                _id: '12345',
                company: 'KickChat',
                position: 'CEO/Co-Founder',
                city: 'Berlin',
                description: 'I am the CEO',
                from: '2021',
                to: 'Present'
            };
            const req: Request = authMockRequest({}, work, authUserPayload, { workId: '12345' }) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userInfoCache, 'updateUserInfoListInCache');
            jest.spyOn(userServer.socketIOUserObject, 'emit');
            jest.spyOn(userInfoQueue, 'addUserInfoJob');

            await EditWorkAndEducation.prototype.work(req, res);
            expect(userInfoCache.updateUserInfoListInCache).toHaveBeenCalledWith({
                key: existingUser._id,
                prop: 'work',
                value: work,
                type: 'edit'
            });
            expect(userServer.socketIOUserObject.emit).toHaveBeenCalled();
            expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateUserWorkInCache', {
                key: 'Manny',
                value: work,
                type: 'edit',
                paramsId: '12345'
            });
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
                _id: '12345',
                name: 'Tallinn Tech',
                course: 'Computer Engineering',
                degree: 'M.Sc',
                from: '2014',
                to: '2016'
            };
            const req: Request = authMockRequest({}, school, authUserPayload, { schoolId: '12345' }) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userInfoCache, 'updateUserInfoListInCache');
            jest.spyOn(userServer.socketIOUserObject, 'emit');
            jest.spyOn(userInfoQueue, 'addUserInfoJob');

            await EditWorkAndEducation.prototype.education(req, res);
            expect(userInfoCache.updateUserInfoListInCache).toHaveBeenCalledWith({
                key: existingUser._id,
                prop: 'school',
                value: school,
                type: 'edit'
            });
            expect(userServer.socketIOUserObject.emit).toHaveBeenCalled();
            expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateUserSchoolInCache', {
                key: 'Manny',
                value: school,
                type: 'edit',
                paramsId: '12345'
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'School updated successfully',
                notification: false
            });
        });
    });
});
