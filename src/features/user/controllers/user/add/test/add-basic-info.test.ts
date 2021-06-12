import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { authUserPayload, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { AddBasicInfo } from '@user/controllers/user/add/add-basic-info';
import * as userServer from '@socket/user';
import { CustomError } from '@global/helpers/error-handler';
import { userInfoQueue } from '@service/queues/user-info.queue';

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

describe('AddBasicInfo', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('gender', () => {
        it('should throw an error if gender is invalid', () => {
            const req: Request = authMockRequest({}, { gender: '' }) as Request;
            const res: Response = authMockResponse();
            AddBasicInfo.prototype.gender(req, res).catch((error: CustomError) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('"gender" is not allowed to be empty');
            });
        });

        it('should call "emit" and "addUserInfoJob" methods', async () => {
            const req: Request = authMockRequest({}, { gender: 'Male' }, authUserPayload) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userServer.socketIOUserObject, 'emit');
            jest.spyOn(userInfoQueue, 'addUserInfoJob');

            await AddBasicInfo.prototype.gender(req, res);
            expect(userServer.socketIOUserObject.emit).toHaveBeenCalled();
            expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateGenderInCache', { key: 'Manny', value: 'Male' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Gender updated successfully',
                notification: false
            });
        });
    });

    describe('birthday', () => {
        it('should throw an error if month is invalid', () => {
            const req: Request = authMockRequest({}, { month: '', day: '' }) as Request;
            const res: Response = authMockResponse();
            AddBasicInfo.prototype.birthday(req, res).catch((error: CustomError) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('"month" is not allowed to be empty');
            });
        });

        it('should throw an error if day is invalid', () => {
            const req: Request = authMockRequest({}, { month: 'March', day: '' }) as Request;
            const res: Response = authMockResponse();
            AddBasicInfo.prototype.birthday(req, res).catch((error: CustomError) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('"day" is not allowed to be empty');
            });
        });

        it('should call "emit" and "addUserInfoJob" methods', async () => {
            const req: Request = authMockRequest({}, { month: 'March', day: '10' }, authUserPayload) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userServer.socketIOUserObject, 'emit');
            jest.spyOn(userInfoQueue, 'addUserInfoJob');

            await AddBasicInfo.prototype.birthday(req, res);
            expect(userServer.socketIOUserObject.emit).toHaveBeenCalled();
            expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateBirthdayInCache', {
                key: 'Manny',
                value: { month: 'March', day: '10' }
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Birthday updated successfully',
                notification: false
            });
        });
    });

    describe('relationship', () => {
        it('should throw an error if relationship is invalid', () => {
            const req: Request = authMockRequest({}, { relationship: '' }) as Request;
            const res: Response = authMockResponse();
            AddBasicInfo.prototype.relationship(req, res).catch((error: CustomError) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('"relationship" is not allowed to be empty');
            });
        });

        it('should call "emit" and "addUserInfoJob" methods', async () => {
            const req: Request = authMockRequest({}, { relationship: 'Single' }, authUserPayload) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userServer.socketIOUserObject, 'emit');
            jest.spyOn(userInfoQueue, 'addUserInfoJob');

            await AddBasicInfo.prototype.relationship(req, res);
            expect(userServer.socketIOUserObject.emit).toHaveBeenCalled();
            expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateRelationshipInCache', { key: 'Manny', value: 'Single' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Relationship updated successfully',
                notification: false
            });
        });
    });
});
