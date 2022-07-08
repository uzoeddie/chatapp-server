import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { commentMockRequest, commentMockResponse, reactionData } from '@root/mocks/comment.mock';
import { reactionService } from '@service/db/reaction.service';
import { ReactionCache } from '@service/redis/reaction.cache';
import { Get } from '@reaction/controllers/get-reactions';
import { postMockData } from '@root/mocks/post.mock';
import mongoose from 'mongoose';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/reaction.cache');

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
        postId: `${postMockData._id}`
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(ReactionCache.prototype, 'getReactionsFromCache').mockResolvedValue([[reactionData], 1]);

      await Get.prototype.reactions(req, res);
      expect(ReactionCache.prototype.getReactionsFromCache).toHaveBeenCalledWith(`${postMockData._id}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post reactions',
        reactions: [reactionData],
        count: 1
      });
    });

    it('should send correct json response if reactions exist in database', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(ReactionCache.prototype, 'getReactionsFromCache').mockResolvedValue([[], 0]);
      jest.spyOn(reactionService, 'getPostReactions').mockResolvedValue([[reactionData], 1]);

      await Get.prototype.reactions(req, res);
      expect(reactionService.getPostReactions).toHaveBeenCalledWith(
        { postId: new mongoose.Types.ObjectId(`${postMockData._id}`) },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post reactions',
        reactions: [reactionData],
        count: 1
      });
    });

    it('should send correct json response if reactions list is empty', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(ReactionCache.prototype, 'getReactionsFromCache').mockResolvedValue([[], 0]);
      jest.spyOn(reactionService, 'getPostReactions').mockResolvedValue([[], 0]);

      await Get.prototype.reactions(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post reactions',
        reactions: [],
        count: 0
      });
    });
  });

  describe('singleReaction', () => {
    it('should send correct json response if reactions exist in cache', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
        reactionId: `${postMockData._id}`
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(ReactionCache.prototype, 'getSingleReactionFromCache').mockResolvedValue([[reactionData], 1]);

      await Get.prototype.singleReaction(req, res);
      expect(ReactionCache.prototype.getSingleReactionFromCache).toHaveBeenCalledWith(`${postMockData._id}`, `${postMockData._id}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post reaction',
        reactions: [reactionData],
        count: 1
      });
    });

    it('should send correct json response if reactions exist in database', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
        reactionId: `${postMockData._id}`
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(ReactionCache.prototype, 'getSingleReactionFromCache').mockResolvedValue([[], 0]);
      jest.spyOn(reactionService, 'getPostReactions').mockResolvedValue([[reactionData], 1]);

      await Get.prototype.singleReaction(req, res);
      expect(reactionService.getPostReactions).toHaveBeenCalledWith(
        { _id: new mongoose.Types.ObjectId(`${postMockData._id}`) },
        { createdAt: 1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post reaction',
        reactions: [reactionData],
        count: 1
      });
    });

    it('should send correct json response if reactions list is empty', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
        reactionId: `${postMockData._id}`
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(ReactionCache.prototype, 'getSingleReactionFromCache').mockResolvedValue([[], 0]);
      jest.spyOn(reactionService, 'getPostReactions').mockResolvedValue([[], 0]);

      await Get.prototype.singleReaction(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post reaction',
        reactions: [],
        count: 0
      });
    });
  });

  describe('singleReactionByUsername', () => {
    it('should send correct json response if reactions exist in cache', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
        username: postMockData.username
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(ReactionCache.prototype, 'getSingleReactionByUsernameFromCache').mockResolvedValue([reactionData, 1]);

      await Get.prototype.singleReactionByUsername(req, res);
      expect(ReactionCache.prototype.getSingleReactionByUsernameFromCache).toHaveBeenCalledWith(
        `${postMockData._id}`,
        postMockData.username
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post reaction by username',
        reactions: reactionData,
        count: 1
      });
    });

    it('should send correct json response if reactions exist in database', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
        username: postMockData.username
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(ReactionCache.prototype, 'getSingleReactionByUsernameFromCache').mockResolvedValue([]);
      jest.spyOn(reactionService, 'getSinglePostReactionByUsername').mockResolvedValue([reactionData, 1]);

      await Get.prototype.singleReactionByUsername(req, res);
      expect(reactionService.getSinglePostReactionByUsername).toHaveBeenCalledWith(`${postMockData._id}`, postMockData.username);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post reaction by username',
        reactions: reactionData,
        count: 1
      });
    });

    it('should send correct json response if reactions list is empty', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
        username: postMockData.username
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(ReactionCache.prototype, 'getSingleReactionByUsernameFromCache').mockResolvedValue([]);
      jest.spyOn(reactionService, 'getSinglePostReactionByUsername').mockResolvedValue([]);

      await Get.prototype.singleReactionByUsername(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post reaction by username',
        reactions: {},
        count: 0
      });
    });
  });

  describe('reactionsByUsername', () => {
    it('should send correct json response if reactions exist in database', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        username: postMockData.username
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(reactionService, 'getReactionsByUsername').mockResolvedValue([reactionData]);

      await Get.prototype.reactionsByUsername(req, res);
      expect(reactionService.getReactionsByUsername).toHaveBeenCalledWith(postMockData.username);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post reaction by username',
        reactions: [reactionData]
      });
    });

    it('should send correct json response if reactions list is empty', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        username: postMockData.username
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(reactionService, 'getReactionsByUsername').mockResolvedValue([]);

      await Get.prototype.reactionsByUsername(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post reaction by username',
        reactions: []
      });
    });
  });
});
