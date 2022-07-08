import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { commentMockRequest, commentMockResponse, commentNames, commentsData, redisCommentList } from '@root/mocks/comment.mock';
import { CommentCache } from '@service/redis/comment.cache';
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
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(CommentCache.prototype, 'getCommentsFromCache').mockResolvedValue([commentsData]);

      await Get.prototype.comments(req, res);
      expect(CommentCache.prototype.getCommentsFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments',
        comments: [commentsData]
      });
    });

    it('should send correct json response if comments exist in database', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(CommentCache.prototype, 'getCommentsFromCache').mockResolvedValue([]);
      jest.spyOn(commentService, 'getPostComments').mockResolvedValue([commentsData]);

      await Get.prototype.comments(req, res);
      expect(commentService.getPostComments).toHaveBeenCalledWith(
        { postId: new mongoose.Types.ObjectId('6027f77087c9d9ccb1555268') },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments',
        comments: [commentsData]
      });
    });
  });

  describe('commentNamesFromCache', () => {
    it('should send correct json response if data exist in redis', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(CommentCache.prototype, 'getCommentNamesFromCache').mockResolvedValue([commentNames]);

      await Get.prototype.commentNamesFromCache(req, res);
      expect(CommentCache.prototype.getCommentNamesFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments names',
        comments: redisCommentList
      });
    });

    it('should send correct json response if data exist in database', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(CommentCache.prototype, 'getCommentNamesFromCache').mockResolvedValue([]);
      jest.spyOn(commentService, 'getPostCommentNames').mockResolvedValue([commentNames]);

      await Get.prototype.commentNamesFromCache(req, res);
      expect(commentService.getPostCommentNames).toHaveBeenCalledWith(
        { postId: new mongoose.Types.ObjectId('6027f77087c9d9ccb1555268') },
        0,
        100,
        {
          createdAt: -1
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments names',
        comments: commentNames
      });
    });

    it('should return empty comments if data does not exist in redis and database', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(CommentCache.prototype, 'getCommentNamesFromCache').mockResolvedValue([]);
      jest.spyOn(commentService, 'getPostCommentNames').mockResolvedValue([]);

      await Get.prototype.commentNamesFromCache(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments names',
        comments: undefined
      });
    });
  });

  describe('singleComment', () => {
    it('should send correct json response from cache', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        commentId: '6064861bc25eaa5a5d2f9bf4',
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(CommentCache.prototype, 'getSingleCommentFromCache').mockResolvedValue([commentsData]);
      // jest.spyOn(commentService, 'getPostComments').mockImplementation(() => Promise.resolve([]));

      await Get.prototype.singleComment(req, res);
      expect(CommentCache.prototype.getSingleCommentFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268', '6064861bc25eaa5a5d2f9bf4');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single comment',
        comments: commentsData
      });
    });

    it('should send correct json response from database', async () => {
      const req: Request = commentMockRequest({}, {}, authUserPayload, {
        commentId: '6064861bc25eaa5a5d2f9bf4',
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = commentMockResponse();
      jest.spyOn(CommentCache.prototype, 'getSingleCommentFromCache').mockResolvedValue([]);
      jest.spyOn(commentService, 'getPostComments').mockResolvedValue([commentsData]);

      await Get.prototype.singleComment(req, res);
      expect(commentService.getPostComments).toHaveBeenCalledWith(
        { _id: new mongoose.Types.ObjectId('6064861bc25eaa5a5d2f9bf4') },
        {
          createdAt: -1
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single comment',
        comments: commentsData
      });
    });
  });
});
