import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { commentMockRequest, commentMockResponse } from '@root/mocks/comment.mock';
import { ReactionCache } from '@service/redis/reaction.cache';
import { reactionQueue } from '@service/queues/reaction.queue';
import { Add } from '@reaction/controllers/add-reaction';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/reaction.cache');

const reactionCache: ReactionCache = new ReactionCache();

describe('AddReaction', () => {
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
                previousReaction: 'love',
                profilePicture: '',
                userTo: '60263f14648fed5246e322d9',
                type: 'like'
            },
            authUserPayload
        ) as Request;
        const res: Response = commentMockResponse();
        jest.spyOn(reactionCache, 'savePostReactionToCache');
        jest.spyOn(reactionQueue, 'addReactionJob');

        await Add.prototype.reaction(req, res);
        expect(reactionCache.savePostReactionToCache).toHaveBeenCalled();
        expect(reactionQueue.addReactionJob).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Reaction added successfully',
            notification: false
        });
    });
});
