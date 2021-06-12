/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/auth.mock';
import * as postServer from '@socket/post';
import { newPost, postMockData, postMockRequest, postMockResponse } from '@root/mocks/post.mock';
import { postCache } from '@service/redis/post.cache';
import { postQueue } from '@service/queues/post.queue';
import { Update } from '@post/controllers/update-post';
import * as cloudinaryUploads from '@global/helpers/cloudinary-upload';

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

describe('Update', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('posts', () => {
        it('should send correct json response', async () => {
            const req: Request = postMockRequest(newPost, authUserPayload, { postId: '12345' }) as Request;
            const res: Response = postMockResponse();
            jest.spyOn(postCache, 'updatePostInCache').mockImplementation((): any => postMockData);
            jest.spyOn(postServer.socketIOPostObject, 'emit');
            jest.spyOn(postQueue, 'addPostJob');

            await Update.prototype.post(req, res);
            expect(postCache.updatePostInCache).toHaveBeenCalled();
            expect(postServer.socketIOPostObject.emit).toHaveBeenCalled();
            expect(postQueue.addPostJob).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post updated successfully',
                postUpdated: postMockData,
                notification: true
            });
        });
    });

    describe('postWithImage', () => {
        it('should send correct json response if imgId and imgVersion exists', async () => {
            newPost.imgId = '1234';
            newPost.imgVersion = '1234';
            const req: Request = postMockRequest(newPost, authUserPayload, { postId: '12345' }) as Request;
            const res: Response = postMockResponse();
            jest.spyOn(postCache, 'updatePostInCache').mockImplementation((): any => postMockData);
            jest.spyOn(postServer.socketIOPostObject, 'emit');
            jest.spyOn(postQueue, 'addPostJob');

            await Update.prototype.postWithImage(req, res);
            expect(postCache.updatePostInCache).toHaveBeenCalled();
            expect(postServer.socketIOPostObject.emit).toHaveBeenCalled();
            expect(postQueue.addPostJob).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post with image updated successfully',
                notification: true
            });
        });

        it('should send correct json response if no imgId and imgVersion', async () => {
            newPost.imgId = undefined;
            newPost.imgVersion = undefined;
            const req: Request = postMockRequest(newPost, authUserPayload, { postId: '12345' }) as Request;
            const res: Response = postMockResponse();
            jest.spyOn(postCache, 'updatePostInCache').mockImplementation((): any => postMockData);
            jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any =>
                Promise.resolve({ version: '1234', public_id: '123456' })
            );
            jest.spyOn(postServer.socketIOPostObject, 'emit');
            jest.spyOn(postQueue, 'addPostJob');

            await Update.prototype.postWithImage(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post with image updated successfully',
                notification: true
            });
        });
    });
});
