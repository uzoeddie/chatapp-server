import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { followerCache } from '@service/redis/follower.cache';
import { followerQueue } from '@service/queues/follower.queue';

export class Remove {
    public async follower(req: Request, res: Response): Promise<void> {
        const { followerObjectId, followerId } = req.params;

        const removeFollowerFromCache = followerCache.removeFollowerFromCache(`followers:${req.currentUser!.userId}`, followerObjectId);
        const removeFolloweeFromCache = followerCache.removeFollowerFromCache(`following:${followerId}`, followerObjectId);
        const followersCount: Promise<void> = followerCache.updateFollowersCountInCache(`${followerId}`, 'followersCount', -1);
        const followeeCount: Promise<void> = followerCache.updateFollowersCountInCache(`${req.currentUser?.userId}`, 'followingCount', -1);
        await Promise.all([removeFollowerFromCache, removeFolloweeFromCache, followersCount, followeeCount]);
        followerQueue.addFollowerJob('removeFollowerFromDB', {
            keyOne: `${req.currentUser?.userId}`,
            keyTwo: `${followerId}`
        });
        res.status(HTTP_STATUS.OK).json({ message: 'Unfollowed user now', notification: false });
    }
}
