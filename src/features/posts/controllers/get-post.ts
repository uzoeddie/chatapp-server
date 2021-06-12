import { Request, Response } from 'express';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postCache } from '@service/redis/post.cache';
import HTTP_STATUS from 'http-status-codes';
import { postService } from '@service/db/post.service';

const PAGE_SIZE = 2;

export class Get {
    public async posts(req: Request, res: Response): Promise<void> {
        const { page } = req.params;
        const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
        const limit: number = PAGE_SIZE * parseInt(page);
        const newSkip: number = skip === 0 ? skip : skip + 1;
        let posts: IPostDocument[] = [];
        const cachedData: IPostDocument[] = await postCache.getPostsFromCache('post', newSkip, limit);
        posts = cachedData.length ? cachedData : await postService.getPosts({}, skip, limit, { createdAt: -1 });
        res.status(HTTP_STATUS.OK).json({ message: 'All posts', posts, type: 'posts' });
    }

    public async postById(req: Request, res: Response): Promise<void> {
        const cachedData: IPostDocument[] = await postCache.getSinglePostFromCache(req.params.postId);
        const post: IPostDocument[] = cachedData.length
            ? cachedData
            : await postService.getPosts({ _id: req.params.postId }, 0, 1, { createdAt: -1 });
        res.status(HTTP_STATUS.OK).json({ message: 'Single post', post: post[0] });
    }
}
