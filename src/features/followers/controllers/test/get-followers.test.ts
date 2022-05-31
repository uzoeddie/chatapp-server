/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { authUserPayload } from '@root/mocks/auth.mock';
import { followerData, followersMockRequest, followersMockResponse } from '@root/mocks/followers.mock';
import { FollowerCache } from '@service/redis/follower.cache';
import { Get } from '@follower/controllers/get-followers';
import { FollowerModel } from '@follower/models/follower.schema';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/follower.cache');

const followerCache: FollowerCache = new FollowerCache();

describe('Get', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('userFollowing', () => {
        it('should send correct json response if user following exist in cache', async () => {
            const req: Request = followersMockRequest({}, authUserPayload) as Request;
            const res: Response = followersMockResponse();
            jest.spyOn(followerCache, 'getFollowersFromCache').mockImplementation((): any => [followerData]);

            await Get.prototype.userFollowing(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User following',
                following: [followerData]
            });
        });

        it('should send correct json response if user following exist in database', async () => {
            const req: Request = followersMockRequest({}, authUserPayload) as Request;
            const res: Response = followersMockResponse();
            jest.spyOn(followerCache, 'getFollowersFromCache').mockImplementation((): any => []);
            jest.spyOn(FollowerModel, 'find');
            jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce([followerData]);

            await Get.prototype.userFollowing(req, res);
            expect(FollowerModel.find).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User following',
                following: [followerData]
            });
        });
    });

    describe('userFollowers', () => {
        it('should send correct json response if follower exist in cache', async () => {
            const req: Request = followersMockRequest({}, authUserPayload, { userId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
            const res: Response = followersMockResponse();
            jest.spyOn(followerCache, 'getFollowersFromCache').mockImplementation((): any => [followerData]);

            await Get.prototype.userFollowers(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User followers',
                followers: [followerData]
            });
        });

        it('should send correct json response if follower exist in database', async () => {
            const req: Request = followersMockRequest({}, authUserPayload, { userId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
            const res: Response = followersMockResponse();
            jest.spyOn(followerCache, 'getFollowersFromCache').mockImplementation((): any => []);
            jest.spyOn(FollowerModel, 'find');
            jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce([followerData]);

            await Get.prototype.userFollowers(req, res);
            expect(FollowerModel.find).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User followers',
                followers: [followerData]
            });
        });
    });
});
