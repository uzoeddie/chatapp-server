import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { followersMockRequest, followersMockResponse } from '@root/mocks/followers.mock';
import { AddUser } from '@follower/controllers/block-user';
import { FollowerCache } from '@service/redis/follower.cache';
import { blockedUserQueue } from '@service/queues/blocked.queue';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/follower.cache');

const followerCache: FollowerCache = new FollowerCache();

describe('AddUser', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('block', () => {
        it('should send correct json response', async () => {
            const req: Request = followersMockRequest({}, authUserPayload, { followerId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
            const res: Response = followersMockResponse();
            jest.spyOn(followerCache, 'updateBlockedUserPropInCache');
            jest.spyOn(blockedUserQueue, 'addBlockedUserJob');

            await AddUser.prototype.block(req, res);
            expect(blockedUserQueue.addBlockedUserJob).toHaveBeenCalledWith('addBlockedUserToDB', {
                keyOne: `${req.currentUser?.userId}`,
                keyTwo: `${req.params.followerId}`,
                type: 'block'
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User blocked',
                notification: false
            });
        });
    });

    describe('unblock', () => {
        it('should send correct json response', async () => {
            const req: Request = followersMockRequest({}, authUserPayload, { followerId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
            const res: Response = followersMockResponse();
            jest.spyOn(followerCache, 'updateBlockedUserPropInCache');
            jest.spyOn(blockedUserQueue, 'addBlockedUserJob');

            await AddUser.prototype.unblock(req, res);
            expect(blockedUserQueue.addBlockedUserJob).toHaveBeenCalledWith('removeBlockedUserFromDB', {
                keyOne: `${req.currentUser?.userId}`,
                keyTwo: `${req.params.followerId}`,
                type: 'unblock'
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User unblocked',
                notification: false
            });
        });
    });
});
