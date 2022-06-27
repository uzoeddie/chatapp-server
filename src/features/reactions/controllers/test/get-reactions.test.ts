/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { commentMockRequest, commentMockResponse, reactionData } from '@root/mocks/comment.mock';
import { reactionService } from '@service/db/reaction.service';
import { ReactionCache } from '@service/redis/reaction.cache';
import { Get } from '@reaction/controllers/get-reactions';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/reaction.cache');

const reactionCache: ReactionCache = new ReactionCache();

describe('Get', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('reactions', () => {
        it('should send correct json response if reactions exist in cache', async () => {
            const req: Request = commentMockRequest({}, {}, authUserPayload, {
                postId: '6027f77087c9d9ccb1555268',
                page: '1'
            }) as Request;
            const res: Response = commentMockResponse();
            jest.spyOn(reactionCache, 'getReactionsFromCache').mockImplementation((): any => [[reactionData], 1]);
            jest.spyOn(reactionService, 'getPostReactions').mockImplementation(() => Promise.resolve([[], 1]));

            await Get.prototype.reactions(req, res);
            expect(reactionCache.getReactionsFromCache).toHaveBeenCalled();
            expect(reactionService.getPostReactions).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post reactions',
                reactions: [reactionData],
                count: 1,
                notification: false
            });
        });

        it('should send correct json response if reactions exist in database', async () => {
            const req: Request = commentMockRequest({}, {}, authUserPayload, {
                postId: '6027f77087c9d9ccb1555268',
                page: '1'
            }) as Request;
            const res: Response = commentMockResponse();
            jest.spyOn(reactionCache, 'getReactionsFromCache').mockImplementation(() => Promise.resolve([[], 1]));
            jest.spyOn(reactionService, 'getPostReactions').mockImplementation(() => Promise.resolve([[reactionData], 1]));

            await Get.prototype.reactions(req, res);
            expect(reactionCache.getReactionsFromCache).toHaveBeenCalled();
            expect(reactionService.getPostReactions).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post reactions',
                reactions: [reactionData],
                count: 1,
                notification: false
            });
        });
    });

    describe('singleReaction', () => {
        it('should send correct json response', async () => {
            const req: Request = commentMockRequest({}, {}, authUserPayload, {
                reactionId: '6064861bc25eaa5a5d2f9bf4'
            }) as Request;
            const res: Response = commentMockResponse();
            jest.spyOn(reactionCache, 'getSingleReactionFromCache').mockImplementation((): any => [[reactionData], 1]);

            await Get.prototype.singleReaction(req, res);
            expect(reactionCache.getSingleReactionFromCache).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Single post reaction',
                reactions: [reactionData],
                count: 1,
                notification: false
            });
        });
    });
});
