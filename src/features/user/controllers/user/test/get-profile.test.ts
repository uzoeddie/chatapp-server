/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { UserCache } from '@service/redis/user.cache';
import { FollowerCache } from '@service/redis/follower.cache';
import { existingUser } from '@root/mocks/user.mock';
import { followerData } from '@root/mocks/followers.mock';
import { Get } from '@user/controllers/user/get-profile';
import { PostCache } from '@service/redis/post.cache';
import { postMockData } from '@root/mocks/post.mock';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/post.cache');
jest.mock('@service/redis/follower.cache');
jest.mock('@service/redis/user.cache');

const userCache = new UserCache();
const followerCache: FollowerCache = new FollowerCache();
const postCache: PostCache = new PostCache();

describe('Get', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('all', () => {
        it('should send success json response', async () => {
            const req: Request = authMockRequest({}, {}, null, { page: '1' }) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userCache, 'getUsersFromCache').mockImplementation((): any => [existingUser]);
            jest.spyOn(followerCache, 'getFollowersFromCache').mockImplementation((): any => [followerData]);
            jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce([followerData]);
            await Get.prototype.all(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Get users',
                users: [existingUser],
                followers: [followerData],
                notification: false
            });
        });
    });

    describe('profile', () => {
        it('should send success json response', async () => {
            const req: Request = authMockRequest({}, {}, null) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userCache, 'getUserFromCache').mockImplementation((): any => existingUser);
            await Get.prototype.profile(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Get user profile',
                user: existingUser,
                notification: false
            });
        });
    });

    describe('username', () => {
        it('should send success json response', async () => {
            const req: Request = authMockRequest({}, {}, null, { username: 'manny' }) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userCache, 'getUserFromCache').mockImplementation((): any => existingUser);
            jest.spyOn(postCache, 'getUserPostsFromCache').mockImplementation((): any => [postMockData]);
            await Get.prototype.username(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Get user profile by username',
                user: existingUser,
                posts: [postMockData],
                notification: false
            });
        });
    });
});
