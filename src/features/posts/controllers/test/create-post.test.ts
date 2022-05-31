/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/auth.mock';
import * as postServer from '@socket/post';
import { newPost, postMockRequest, postMockResponse } from '@root/mocks/post.mock';
import { postQueue } from '@service/queues/post.queue';
import { Create } from '@post/controllers/create-post';
import { PostCache } from '@service/redis/post.cache';
import { CustomError } from '@global/helpers/error-handler';
import * as cloudinaryUploads from '@global/helpers/cloudinary-upload';

const postCache: PostCache = new PostCache();

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/post.cache');
jest.mock('@global/helpers/cloudinary-upload');

Object.defineProperties(postServer, {
    socketIOPostObject: {
        value: new Server(),
        writable: true
    }
});

describe('Create', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('post', () => {
        it('should send correct json response', async () => {
            delete newPost.image;
            const req: Request = postMockRequest(newPost, authUserPayload) as Request;
            const res: Response = postMockResponse();
            jest.spyOn(postServer.socketIOPostObject, 'emit');
            jest.spyOn(postCache, 'savePostToCache');
            jest.spyOn(postQueue, 'addPostJob');

            await Create.prototype.post(req, res);
            expect(postServer.socketIOPostObject.emit).toHaveBeenCalled();
            expect(postCache.savePostToCache).toHaveBeenCalled();
            expect(postQueue.addPostJob).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post created successfully',
                notification: true
            });
        });
    });

    describe('postWithImage', () => {
        it('should throw an error if image is not available', () => {
            newPost.image = undefined;
            const req: Request = postMockRequest(newPost, authUserPayload) as Request;
            const res: Response = postMockResponse();
            Create.prototype.postWithImage(req, res).catch((error: CustomError) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Image is a required field');
            });
        });

        it('should send correct json response', async () => {
            newPost.image = 'testing image';
            const req: Request = postMockRequest(newPost, authUserPayload) as Request;
            const res: Response = postMockResponse();
            jest.spyOn(postServer.socketIOPostObject, 'emit');
            jest.spyOn(postQueue, 'addPostJob');
            jest.spyOn(postCache, 'savePostToCache');
            jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any =>
                Promise.resolve({ version: '1234', public_id: '123456' })
            );

            await Create.prototype.postWithImage(req, res);
            expect(postServer.socketIOPostObject.emit).toHaveBeenCalled();
            expect(postQueue.addPostJob).toHaveBeenCalled();
            expect(postCache.savePostToCache).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post created with image successfully',
                notification: true
            });
        });
    });
});
