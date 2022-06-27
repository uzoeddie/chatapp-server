import { Request, Response } from 'express';
import { Server } from 'socket.io';
import * as postServer from '@socket/post';
import { commentMockRequest, commentMockResponse } from '@root/mocks/comment.mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import { ReactionCache } from '@service/redis/reaction.cache';
import { reactionQueue } from '@service/queues/reaction.queue';
import { Remove } from '@reaction/controllers/remove-reaction';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/reaction.cache');

const reactionCache: ReactionCache = new ReactionCache();

Object.defineProperties(postServer, {
    socketIOPostObject: {
        value: new Server(),
        writable: true
    }
});

describe('Remove', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('should send correct json response', async () => {
        const req: Request = commentMockRequest({}, {}, authUserPayload, {
            postId: '6027f77087c9d9ccb1555268',
            previousReaction: 'like'
        }) as Request;
        const res: Response = commentMockResponse();
        jest.spyOn(reactionCache, 'removePostReactionFromCache');
        jest.spyOn(reactionQueue, 'addReactionJob');
        jest.spyOn(postServer.socketIOPostObject, 'emit');

        await Remove.prototype.reaction(req, res);
        expect(postServer.socketIOPostObject.emit).toHaveBeenCalled();
        expect(reactionCache.removePostReactionFromCache).toHaveBeenCalled();
        expect(reactionQueue.addReactionJob).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Reaction removed from post',
            notification: false
        });
    });
});
