import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { FollowerCache } from '@service/redis/follower.cache';
import { IFollower, IFollowerData } from '@follower/interface/follower.interface';
import { followerService } from '@service/db/follower.service';

const followerCache: FollowerCache = new FollowerCache();

export class Get {
  public async userFollowing(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.currentUser!.userId);
    const cachedFollowers: IFollowerData[] = await followerCache.getFollowersFromCache(`following:${req.currentUser?.userId}`);
    const following: IFollower[] | IFollowerData[] = cachedFollowers.length
      ? cachedFollowers
      : await followerService.getFolloweeData(userObjectId);

    res.status(HTTP_STATUS.OK).json({ message: 'User following', following });
  }

  public async userFollowers(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.params.userId);
    const cachedFollowers: IFollowerData[] = await followerCache.getFollowersFromCache(`followers:${req.params.userId}`);
    const followers: IFollower[] | IFollowerData[] = cachedFollowers.length
      ? cachedFollowers
      : await followerService.getFollowerData(userObjectId);

    res.status(HTTP_STATUS.OK).json({ message: 'User followers', followers });
  }
}
