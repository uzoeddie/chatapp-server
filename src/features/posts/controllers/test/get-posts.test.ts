/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { newPost, postMockData, postMockRequest, postMockResponse } from '@root/mocks/post.mock';
import { PostCache } from '@service/redis/post.cache';
import { Get } from '@post/controllers/get-post';
import { postService } from '@service/db/post.service';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/post.cache');

const postCache: PostCache = new PostCache();

describe('Get', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('posts', () => {
        it('should send correct json response if posts exist in cache', async () => {
            const req: Request = postMockRequest(newPost, authUserPayload, { page: '1' }) as Request;
            const res: Response = postMockResponse();
            jest.spyOn(postCache, 'getPostsFromCache').mockImplementation((): any => [postMockData]);

            await Get.prototype.posts(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'All posts',
                posts: [postMockData],
                type: 'posts'
            });
        });

        it('should send correct json response if posts exist in database', async () => {
            const req: Request = postMockRequest(newPost, authUserPayload, { page: '1' }) as Request;
            const res: Response = postMockResponse();
            jest.spyOn(postCache, 'getPostsFromCache').mockImplementation((): any => []);
            jest.spyOn(postService, 'getPosts').mockImplementation((): any => Promise.resolve([postMockData]));

            await Get.prototype.posts(req, res);
            expect(postService.getPosts).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'All posts',
                posts: [postMockData],
                type: 'posts'
            });
        });
    });

    describe('postById', () => {
        it('should send correct json response if posts exist in cache', async () => {
            const req: Request = postMockRequest(newPost, authUserPayload, { postId: '12345' }) as Request;
            const res: Response = postMockResponse();
            jest.spyOn(postCache, 'getSinglePostFromCache').mockImplementation((): any => [postMockData]);

            await Get.prototype.postById(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Single post',
                post: postMockData
            });
        });

        it('should send correct json response if posts exist in database', async () => {
            const req: Request = postMockRequest(newPost, authUserPayload, { postId: '12345' }) as Request;
            const res: Response = postMockResponse();
            jest.spyOn(postCache, 'getSinglePostFromCache').mockImplementation((): any => []);
            jest.spyOn(postService, 'getPosts').mockImplementation((): any => Promise.resolve([postMockData]));

            await Get.prototype.postById(req, res);
            expect(postService.getPosts).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Single post',
                post: postMockData
            });
        });
    });
});
