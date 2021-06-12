/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { commentMockRequest, commentMockResponse, commentsData, redisCommentList } from '@root/mocks/comment.mock';
import { commentCache } from '@service/redis/comment.cache';
import { Get } from '@comment/controllers/get-comments';
import { commentService } from '@service/db/comment.service';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/comment.cache');

describe('Get', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('comments', () => {
        it('should send correct json response if comments exist in cache', async () => {
            const req: Request = commentMockRequest({}, {}, authUserPayload, {
                postId: '6027f77087c9d9ccb1555268',
                page: '1'
            }) as Request;
            const res: Response = commentMockResponse();
            jest.spyOn(commentCache, 'getCommentsFromCache').mockImplementation((): any => [commentsData]);

            await Get.prototype.comments(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post comments',
                comments: [commentsData],
                notification: false
            });
        });

        it('should send correct json response if comments exist in database', async () => {
            const req: Request = commentMockRequest({}, {}, authUserPayload, {
                postId: '6027f77087c9d9ccb1555268',
                page: '1'
            }) as Request;
            const res: Response = commentMockResponse();
            jest.spyOn(commentCache, 'getCommentsFromCache').mockImplementation((): any => []);
            jest.spyOn(commentService, 'getPostComments').mockImplementation(() => Promise.resolve([commentsData]));

            await Get.prototype.comments(req, res);
            expect(commentService.getPostComments).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post comments',
                comments: [commentsData],
                notification: false
            });
        });
    });

    describe('commentNamesFromCache', () => {
        it('should send correct json response', async () => {
            const req: Request = commentMockRequest({}, {}, authUserPayload, {
                postId: '6027f77087c9d9ccb1555268'
            }) as Request;
            const res: Response = commentMockResponse();
            jest.spyOn(commentCache, 'getCommentNamesFromCache').mockImplementation((): any => redisCommentList);
            jest.spyOn(commentService, 'getPostCommentNames').mockImplementation(() => Promise.resolve([redisCommentList]));

            await Get.prototype.commentNamesFromCache(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post comments names',
                comments: redisCommentList,
                notification: false
            });
        });
    });

    describe('singleComment', () => {
        it('should send correct json response from cache', async () => {
            const req: Request = commentMockRequest({}, {}, authUserPayload, {
                commentId: '6064861bc25eaa5a5d2f9bf4'
            }) as Request;
            const res: Response = commentMockResponse();
            jest.spyOn(commentCache, 'getSingleCommentFromCache').mockImplementation((): any => [commentsData]);
            jest.spyOn(commentService, 'getPostComments').mockImplementation(() => Promise.resolve([]));

            await Get.prototype.singleComment(req, res);
            expect(commentService.getPostComments).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Single comment',
                comments: commentsData,
                notification: false
            });
        });

        it('should send correct json response from database', async () => {
            const req: Request = commentMockRequest({}, {}, authUserPayload, {
                commentId: '6064861bc25eaa5a5d2f9bf4'
            }) as Request;
            const res: Response = commentMockResponse();
            jest.spyOn(commentCache, 'getSingleCommentFromCache').mockImplementation((): any => []);
            jest.spyOn(commentService, 'getPostComments').mockImplementation(() => Promise.resolve([commentsData]));

            await Get.prototype.singleComment(req, res);
            expect(commentService.getPostComments).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Single comment',
                comments: commentsData,
                notification: false
            });
        });
    });
});
