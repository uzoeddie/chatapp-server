import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { commentMockRequest, commentMockResponse } from '@root/mocks/comment.mock';
import { CommentCache } from '@service/redis/comment.cache';
import { commentQueue } from '@service/queues/comment.queue';
import { Add } from '@comment/controllers/add-comment';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/comment.cache');

const commentCache: CommentCache = new CommentCache();

describe('Add', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('should send correct json response', async () => {
        const req: Request = commentMockRequest(
            {},
            {
                postId: '6027f77087c9d9ccb1555268',
                comment: 'This is a comment',
                profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/6064793b091bf02b6a71067a',
                userTo: '60263f14648fed5246e322d9'
            },
            authUserPayload
        ) as Request;
        const res: Response = commentMockResponse();
        jest.spyOn(commentCache, 'savePostCommentToCache');
        jest.spyOn(commentQueue, 'addCommentJob');

        await Add.prototype.comment(req, res);
        expect(commentCache.savePostCommentToCache).toHaveBeenCalled();
        expect(commentQueue.addCommentJob).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Comment created successfully',
            notification: false
        });
    });
});
