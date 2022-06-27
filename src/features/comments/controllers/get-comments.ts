import { Request, Response } from 'express';
import mongoose from 'mongoose';
import HTTP_STATUS from 'http-status-codes';

import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface';
import { CommentCache } from '@service/redis/comment.cache';
import { commentService } from '@service/db/comment.service';

// const PAGE_SIZE = 2;
const SKIP_SIZE = 0;
const LIMIT_SIZE = 100;
const commentCache: CommentCache = new CommentCache();

export class Get {
  public async comments(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedComments: ICommentDocument[] = await commentCache.getCommentsFromCache(postId);
    const comments: ICommentDocument[] = cachedComments.length
      ? cachedComments
      : await commentService.getPostComments({ postId: mongoose.Types.ObjectId(postId) }, { createdAt: -1 });
    res.status(HTTP_STATUS.OK).json({ message: 'Post comments', comments });
  }

  public async commentNamesFromCache(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedComments: ICommentNameList[] = await commentCache.getCommentNamesFromCache(postId);
    const comments = cachedComments.length
      ? cachedComments
      : await commentService.getPostCommentNames({ postId: mongoose.Types.ObjectId(postId) }, SKIP_SIZE, LIMIT_SIZE, {
          createdAt: -1
        });
    res.status(HTTP_STATUS.OK).json({ message: 'Post comments names', comments: comments[0] });
  }

  public async singleComment(req: Request, res: Response): Promise<void> {
    const { postId, commentId } = req.params;
    const cachedComment: ICommentDocument[] = await commentCache.getSingleCommentFromCache(postId, commentId);
    const comments: ICommentDocument[] = cachedComment.length
      ? cachedComment
      : await commentService.getPostComments(
          { _id: mongoose.Types.ObjectId(commentId) },
          {
            createdAt: -1
          }
        );
    res.status(HTTP_STATUS.OK).json({ message: 'Single comment', comments: comments[0], notification: false });
  }
}
