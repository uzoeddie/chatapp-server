import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import _ from 'lodash';
import { IAllUsers, IUserDocument } from '@user/interfaces/user.interface';
import { LeanDocument } from 'mongoose';
import { UserCache } from '@service/redis/user.cache';
import { UserModel } from '@user/models/user.schema';
import { IFollower, IFollowerData, IFollowerDocument } from '@follower/interface/follower.interface';
import { FollowerCache } from '@service/redis/follower.cache';
import { Helpers } from '@global/helpers/helpers';
import { PostCache } from '@service/redis/post.cache';
import { postService } from '@service/db/post.service';
import { IPostDocument } from '@post/interfaces/post.interface';
import { followerService } from '@service/db/follower.service';

const PAGE_SIZE = 12;

interface IUserAll {
  newSkip: number;
  limit: number;
  skip: number;
  userId: string;
}
const postCache: PostCache = new PostCache();
const userCache: UserCache = new UserCache();
const followerCache: FollowerCache = new FollowerCache();

export class Get {
  public async all(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    const allUsers = await Get.prototype.allUsers({
      newSkip,
      limit,
      skip,
      userId: `${req.currentUser?.userId}`
    });
    const followers: IFollowerDocument[] | IFollower[] | IFollowerData[] = await Get.prototype.followers(`${req.currentUser?.userId}`);
    res.status(HTTP_STATUS.OK).json({ message: 'Get users', users: allUsers.users, followers, totalUsers: allUsers.totalUsers });
  }

  public async profile(req: Request, res: Response): Promise<void> {
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(`${req.currentUser?.userId}`)) as IUserDocument;
    const existingUser: IUserDocument | null = cachedUser
      ? cachedUser
      : await UserModel.findOne({ _id: req.currentUser?.userId }).exec();
    res.status(HTTP_STATUS.OK).json({ message: 'Get user profile', user: existingUser });
  }

  public async profileAndPosts(req: Request, res: Response): Promise<void> {
    const { username, userId, uId } = req.params;
    const userName: string = Helpers.firstLetterUppercase(username);
    const cachedUser: Promise<IUserDocument> = userCache.getUserFromCache(userId) as Promise<IUserDocument>;
    const cachedUserPosts: Promise<IPostDocument[]> = postCache.getUserPostsFromCache('post', parseInt(uId, 10));
    const cachedResponse: [IUserDocument, IPostDocument[]] = await Promise.all([cachedUser, cachedUserPosts]);

    const existingUser: IUserDocument = (cachedResponse[0]
      ? cachedResponse[0]
      : UserModel.findOne({ username: userName }).exec()) as IUserDocument;
    const userPosts: IPostDocument[] | Promise<IPostDocument[]> = cachedResponse[1]
      ? cachedResponse[1]
      : postService.getPosts({ username: userName }, 0, 100, { createdAt: -1 });
    const response: [LeanDocument<IUserDocument> | null, IPostDocument[]] = await Promise.all([existingUser, userPosts]);
    res.status(HTTP_STATUS.OK).json({
      message: 'Get user profile and posts',
      user: response[0],
      posts: response[1]
    });
  }

  public async profileByUserId(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const cachedUser: IUserDocument = await userCache.getUserFromCache(userId);
    const existingUser: IUserDocument = (cachedUser ? cachedUser : UserModel.findOne({ _id: userId }).exec()) as IUserDocument;
    res.status(HTTP_STATUS.OK).json({
      message: 'Get user profile',
      user: existingUser
    });
  }

  public async randomUserSuggestions(req: Request, res: Response): Promise<void> {
    let randomUsers: IUserDocument[] = [];
    const cachedUser: IUserDocument[] = await userCache.getRandomUsersFromCache(`${req.currentUser?.userId}`);
    if (cachedUser.length) {
      randomUsers = [...cachedUser];
    } else {
      const users = await UserModel.aggregate([
        { $match: { username: { $not: { $eq: req.currentUser!.username } } } },
        { $sample: { size: 10 } }
      ]);
      const followers: string[] = await followerService.getFolloweeIds(`${req.currentUser?.userId}`);
      for (const user of users) {
        const followerIndex = _.indexOf(followers, user._id.toString());
        if (followerIndex < 0) {
          randomUsers.push(user);
        }
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'User suggestions', users: randomUsers });
  }

  private async allUsers({ newSkip, limit, skip, userId }: IUserAll): Promise<IAllUsers> {
    let users;
    let type = '';
    const cachedUser: IUserDocument[] = (await userCache.getUsersFromCache(newSkip, limit, userId)) as IUserDocument[];
    if (cachedUser.length) {
      type = 'redis';
      users = cachedUser;
    } else {
      type = 'mongo';
      users = await UserModel.find({ _id: { $ne: userId } })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();
    }
    const totalUsers = await Get.prototype.usersCount(type);
    return { users, totalUsers };
  }

  private async usersCount(type: string): Promise<number> {
    const totalUsers: number = type === 'redis' ? await userCache.getTotalUsersCache() : await UserModel.find({}).countDocuments();
    return totalUsers;
  }

  private async followers(userId: string): Promise<IFollowerDocument[] | IFollower[] | IFollowerData[]> {
    const cachedFollowers: IFollower[] | IFollowerData[] = await followerCache.getFollowersFromCache(`followers:${userId}`);
    const result = cachedFollowers.length ? cachedFollowers : await followerService.getFollowers(userId);
    return result;
  }
}
