/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Server } from 'socket.io';
import * as imageServer from '@socket/image';
import { imagesMockRequest, imagesMockResponse } from '@root/mocks/image.mock';
import { Add } from '@image/controllers/add-image';
import { CustomError } from '@global/helpers/error-handler';
import { authUserPayload } from '@root/mocks/auth.mock';
import { UserInfoCache } from '@service/redis/user-info.cache';
import { existingUser } from '@root/mocks/user.mock';
import { imageQueue } from '@service/queues/image.queue';
import * as cloudinaryUploads from '@global/helpers/cloudinary-upload';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@socket/user');
jest.mock('@socket/chat');
jest.mock('@global/helpers/cloudinary-upload');

const userInfoCache: UserInfoCache = new UserInfoCache();

Object.defineProperties(imageServer, {
    socketIOImageObject: {
        value: new Server(),
        writable: true
    }
});

describe('Add', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('image', () => {
        it('should throw an error if image is not available', () => {
            const req: Request = imagesMockRequest({}, { image: '' }) as Request;
            const res: Response = imagesMockResponse();
            Add.prototype.image(req, res).catch((error: CustomError) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('"image" is not allowed to be empty');
            });
        });

        it('should send correct json response', async () => {
            const req: Request = imagesMockRequest({}, { image: 'testing' }, authUserPayload) as Request;
            const res: Response = imagesMockResponse();
            jest.spyOn(userInfoCache, 'updateSingleUserItemInCache').mockImplementation((): any => Promise.resolve(existingUser));
            jest.spyOn(imageServer.socketIOImageObject, 'emit');
            jest.spyOn(imageQueue, 'addImageJob');
            jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any =>
                Promise.resolve({ version: '1234', public_id: '123456' })
            );

            await Add.prototype.image(req, res);
            expect(imageServer.socketIOImageObject.emit).toHaveBeenCalled();
            expect(imageQueue.addImageJob).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Image added successfully',
                notification: true
            });
        });
    });

    describe('backgroundImage', () => {
        it('should throw an error if image is not available', () => {
            const req: Request = imagesMockRequest({}, { image: '' }) as Request;
            const res: Response = imagesMockResponse();
            Add.prototype.backgroundImage(req, res).catch((error: CustomError) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('"image" is not allowed to be empty');
            });
        });

        it('should send correct json response', async () => {
            const req: Request = imagesMockRequest({}, { image: 'testing' }, authUserPayload) as Request;
            const res: Response = imagesMockResponse();
            jest.spyOn(userInfoCache, 'updateSingleUserItemInCache').mockImplementation((): any => Promise.resolve(existingUser));
            jest.spyOn(imageServer.socketIOImageObject, 'emit');
            jest.spyOn(Promise, 'all').mockImplementation((): any => [existingUser, existingUser]);
            jest.spyOn(imageQueue, 'addImageJob');
            jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any =>
                Promise.resolve({ version: '1234', public_id: '123456' })
            );

            await Add.prototype.backgroundImage(req, res);
            expect(imageServer.socketIOImageObject.emit).toHaveBeenCalled();
            expect(imageQueue.addImageJob).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Image added successfully',
                notification: true
            });
        });
    });
});
