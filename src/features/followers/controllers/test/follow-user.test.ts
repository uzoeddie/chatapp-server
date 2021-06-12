/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/auth.mock';
import * as followerServer from '@socket/follower';
import { followersMockRequest, followersMockResponse } from '@root/mocks/followers.mock';
import { existingUser } from '@root/mocks/user.mock';
import { followerQueue } from '@service/queues/follower.queue';
import { Add } from '@follower/controllers/follower-user';
import { userCache } from '@service/redis/user.cache';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/redis/follower.cache');

Object.defineProperties(followerServer, {
    socketIOFollowerObject: {
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

    it('should send correct json response', async () => {
        const req: Request = followersMockRequest({}, authUserPayload, { followerId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
        const res: Response = followersMockResponse();
        jest.spyOn(Promise, 'all').mockImplementation((): any => [existingUser, existingUser]);
        jest.spyOn(followerServer.socketIOFollowerObject, 'emit');
        jest.spyOn(followerQueue, 'addFollowerJob');
        jest.spyOn(userCache, 'getUserFromCache');

        await Add.prototype.follower(req, res);
        expect(followerQueue.addFollowerJob).toHaveBeenCalled();
        expect(userCache.getUserFromCache).toHaveBeenCalled();
        expect(followerServer.socketIOFollowerObject.emit).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Following user now',
            notification: true
        });
    });
});
