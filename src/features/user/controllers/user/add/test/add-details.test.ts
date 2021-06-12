import { Request, Response } from 'express';
import { authUserPayload, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { Server } from 'socket.io';
import { AddDetails } from '@user/controllers/user/add/add-details';
import * as userServer from '@socket/user';
import { CustomError } from '@global/helpers/error-handler';
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

describe('AddDetails', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('about', () => {
        it('should throw an error if about is invalid', () => {
            const req: Request = authMockRequest({}, { about: '' }) as Request;
            const res: Response = authMockResponse();
            AddDetails.prototype.about(req, res).catch((error: CustomError) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('"about" is not allowed to be empty');
            });
        });

        it('should call "emit" and "addUserInfoJob" methods', async () => {
            const req: Request = authMockRequest({}, { about: 'Testing' }, authUserPayload) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userServer.socketIOUserObject, 'emit');
            jest.spyOn(userInfoQueue, 'addUserInfoJob');

            await AddDetails.prototype.about(req, res);
            expect(userServer.socketIOUserObject.emit).toHaveBeenCalled();
            expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateAboutInfoInCache', { key: 'Manny', value: 'Testing' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'About you updated successfully',
                notification: false
            });
        });
    });

    describe('quotes', () => {
        it('should throw an error if quotes is invalid', () => {
            const req: Request = authMockRequest({}, { quotes: '' }) as Request;
            const res: Response = authMockResponse();
            AddDetails.prototype.quotes(req, res).catch((error: CustomError) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('"quotes" is not allowed to be empty');
            });
        });

        it('should call "emit" and "addUserInfoJob" methods', async () => {
            const req: Request = authMockRequest({}, { quotes: 'Today is my day' }, authUserPayload) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userServer.socketIOUserObject, 'emit');
            jest.spyOn(userInfoQueue, 'addUserInfoJob');

            await AddDetails.prototype.quotes(req, res);
            expect(userServer.socketIOUserObject.emit).toHaveBeenCalled();
            expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateQuotesInCache', { key: 'Manny', value: 'Today is my day' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Quotes updated successfully',
                notification: false
            });
        });
    });
});
