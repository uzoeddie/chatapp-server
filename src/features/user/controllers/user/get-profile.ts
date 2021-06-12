import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from '@user/interfaces/user.interface';
import { LeanDocument } from 'mongoose';
import { userCache } from '@service/redis/user.cache';
import { UserModel } from '@user/models/user.schema';
import { IFollower, IFollowerDocument } from '@follower/interface/follower.interface';
import { followerCache } from '@service/redis/follower.cache';
import { FollowerModel } from '@follower/models/follower.schema';
import { Helpers } from '@global/helpers/helpers';
import { postCache } from '@service/redis/post.cache';
import { postService } from '@service/db/post.service';
import { IPostDocument } from '@post/interfaces/post.interface';

const PAGE_SIZE = 10;

interface IUserAll {
    newSkip: number;
    limit: number;
    skip: number;
    userId: string;
}

export class Get {
    public async all(req: Request, res: Response): Promise<void> {
        const { page } = req.params;
        const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
        const limit: number = PAGE_SIZE * parseInt(page);
        const newSkip: number = skip === 0 ? skip : skip + 1;
        const allUsers: Promise<IUserDocument[] | LeanDocument<IUserDocument[]>> = Get.prototype.allUsers({
            newSkip,
            limit,
            skip,
            userId: `${req.currentUser?.userId}`
        });
        const followers: Promise<IFollowerDocument[] | IFollower[]> = Get.prototype.followers(`${req.currentUser?.userId}`, limit, skip);
        const response: [IUserDocument[] | LeanDocument<IUserDocument[]>, IFollowerDocument[] | IFollower[]] = await Promise.all([
            allUsers,
            followers
        ]);
        res.status(HTTP_STATUS.OK).json({ message: 'Get users', users: response[0], followers: response[1], notification: false });
    }

    public async profile(req: Request, res: Response): Promise<void> {
        const cachedUser: IUserDocument = await userCache.getUserFromCache(`${req.currentUser?.userId}`);
        const existingUser: LeanDocument<IUserDocument> | null = cachedUser
            ? cachedUser
            : await UserModel.findOne({ _id: req.currentUser?.userId }).lean().exec();
        res.status(HTTP_STATUS.OK).json({ message: 'Get user profile', user: existingUser, notification: false });
    }

    public async username(req: Request, res: Response): Promise<void> {
        const { username, userId, uId } = req.params;
        const userName: string = Helpers.firstLetterUppercase(username);
        const cachedUser: Promise<IUserDocument> = userCache.getUserFromCache(userId);
        const cachedUserPosts: Promise<IPostDocument[]> = postCache.getUserPostsFromCache('post', parseInt(uId, 10));
        const cachedResponse: [IUserDocument, IPostDocument[]] = await Promise.all([cachedUser, cachedUserPosts]);

        const existingUser: IUserDocument = (cachedResponse[0]
            ? cachedResponse[0]
            : UserModel.findOne({ username: userName }).lean()) as IUserDocument;
        const userPosts: IPostDocument[] | Promise<IPostDocument[]> = cachedResponse[1]
            ? cachedResponse[1]
            : postService.getPosts({ username: userName }, 0, 100, { createdAt: -1 });
        const response: [LeanDocument<IUserDocument> | null, IPostDocument[]] = await Promise.all([existingUser, userPosts]);
        res.status(HTTP_STATUS.OK).json({
            message: 'Get user profile by username',
            user: response[0],
            posts: response[1],
            notification: false
        });
    }

    private async allUsers({ newSkip, limit, skip, userId }: IUserAll): Promise<IUserDocument[] | LeanDocument<IUserDocument[]>> {
        let users;
        const cachedUser: IUserDocument[] = await userCache.getUsersFromCache(newSkip, limit, userId);
        if (cachedUser.length) {
            users = cachedUser;
        } else {
            users = await UserModel.find({ _id: { $ne: userId } })
                .lean()
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec();
        }
        return users;
    }

    private async followers(userId: string, limit: number, skip: number): Promise<IFollowerDocument[] | IFollower[]> {
        const cachedFollowers: IFollower[] = await followerCache.getFollowersFromCache(`followers:${userId}`);
        return cachedFollowers.length
            ? cachedFollowers
            : (((await FollowerModel.find({ followerId: userId })
                  .lean()
                  .populate({
                      path: 'followerId',
                      select: 'username avatarColor postsCount, followersCount followingCount profilePicture'
                  })
                  .populate({
                      path: 'followeeId',
                      select: 'username avatarColor postsCount, followersCount followingCount profilePicture'
                  })
                  .skip(skip)
                  .limit(limit)
                  .sort({ createdAt: -1 })
                  .exec()) as unknown) as IFollower[]);
    }
}
