import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { followerCache } from '@service/redis/follower.cache';
import { FollowerModel } from '@follower/models/follower.schema';
import { IFollower } from '@follower/interface/follower.interface';

export class Get {
    public async userFollowing(req: Request, res: Response): Promise<void> {
        const userObjectId: ObjectId = mongoose.Types.ObjectId(req.currentUser!.userId);
        const cachedFollowers: IFollower[] = await followerCache.getFollowersFromCache(`followers:${req.currentUser?.userId}`);
        const following: IFollower[] = cachedFollowers.length
            ? cachedFollowers
            : (((await FollowerModel.find({ followerId: userObjectId })
                  .lean()
                  .populate({
                      path: 'followerId'
                  })
                  .populate({
                      path: 'followeeId'
                  })
                  .exec()) as unknown) as IFollower[]);

        res.status(HTTP_STATUS.OK).json({ message: 'User following', following });
    }

    public async userFollowers(req: Request, res: Response): Promise<void> {
        const userObjectId: ObjectId = mongoose.Types.ObjectId(req.params.userId);
        const cachedFollowers: IFollower[] = await followerCache.getFollowersFromCache(`following:${req.params.userId}`);
        const followers: IFollower[] = cachedFollowers.length
            ? cachedFollowers
            : (((await FollowerModel.find({ followeeId: userObjectId })
                  .lean()
                  .populate({
                      path: 'followerId'
                  })
                  .populate({
                      path: 'followeeId'
                  })
                  .exec()) as unknown) as IFollower[]);

        res.status(HTTP_STATUS.OK).json({ message: 'User followers', followers });
    }
}
