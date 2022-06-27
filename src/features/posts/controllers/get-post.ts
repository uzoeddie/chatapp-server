import { Request, Response } from 'express';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostCache } from '@service/redis/post.cache';
import HTTP_STATUS from 'http-status-codes';
import { postService } from '@service/db/post.service';

const PAGE_SIZE = 10;
const postCache: PostCache = new PostCache();

export class Get {
  public async posts(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    let posts: IPostDocument[] = [];
    let totalPosts = 0;
    const cachedData: IPostDocument[] = await postCache.getPostsFromCache('post', newSkip, limit);
    if (cachedData.length) {
      posts = cachedData;
      totalPosts = await postCache.getTotalPostsCache();
    } else {
      posts = await postService.getPosts({}, skip, limit, { createdAt: -1 });
      totalPosts = await postService.postCount();
    }
    res.status(HTTP_STATUS.OK).json({ message: 'All posts', posts, totalPosts });
  }

  public async postWithImages(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    let posts: IPostDocument[] = [];
    const cachedData: IPostDocument[] = await postCache.getPostsWithImagesFromCache('post', newSkip, limit);
    posts = cachedData.length ? cachedData : await postService.getPosts({imgId: '$ne', gifUrl: '$ne'}, skip, limit, { createdAt: -1 });
    res.status(HTTP_STATUS.OK).json({ message: 'All posts with images', posts });
  }

  public async postById(req: Request, res: Response): Promise<void> {
    const cachedData: IPostDocument[] = await postCache.getSinglePostFromCache(req.params.postId);
    const post: IPostDocument[] = cachedData.length
      ? cachedData
      : await postService.getPosts({ _id: req.params.postId }, 0, 1, { createdAt: -1 });
    res.status(HTTP_STATUS.OK).json({ message: 'Single post', post: post[0] });
  }
}
