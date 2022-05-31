/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { followersMockRequest, followersMockResponse } from '@root/mocks/followers.mock';
import { existingUser } from '@root/mocks/user.mock';
import { followerQueue } from '@service/queues/follower.queue';
import { FollowerCache } from '@service/redis/follower.cache';
import { Remove } from '@follower/controllers/unfollow-user';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/follower.cache');

const followerCache: FollowerCache = new FollowerCache();

describe('Remove', () => {
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
        jest.spyOn(followerCache, 'removeFollowerFromCache');
        jest.spyOn(followerQueue, 'addFollowerJob');

        await Remove.prototype.follower(req, res);
        expect(followerQueue.addFollowerJob).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Unfollowed user now',
            notification: false
        });
    });
});
