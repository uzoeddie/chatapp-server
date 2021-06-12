import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { userCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { ObjectID } from 'mongodb';
import { IFollower } from '@follower/interface/follower.interface';
import { followerCache } from '@service/redis/follower.cache';
import { followerQueue } from '@service/queues/follower.queue';
import { socketIOFollowerObject } from '@socket/follower';

export class Add {
    public async follower(req: Request, res: Response): Promise<void> {
        const { followerId } = req.params;
        const cachedFollowee: Promise<IUserDocument> = userCache.getUserFromCache(followerId);
        const cachedFollower: Promise<IUserDocument> = userCache.getUserFromCache(`${req.currentUser?.userId}`);
        const response: [IUserDocument, IUserDocument] = await Promise.all([cachedFollowee, cachedFollower]);

        const followerObjectId: ObjectID = new ObjectID();
        const addFollowerData: IFollower = Add.prototype.followerData(response, followerObjectId);
        socketIOFollowerObject.emit('add follower', addFollowerData);
        const addFollowerToCache: Promise<void> = followerCache.saveFollowerToCache(
            `followers:${req.currentUser!.userId}`,
            addFollowerData
        );
        const addFolloweeToCache: Promise<void> = followerCache.saveFollowerToCache(`following:${followerId}`, addFollowerData);
        const followersCount: Promise<void> = followerCache.updateFollowersCountInCache(`${followerId}`, 'followersCount', 1);
        const followeeCount: Promise<void> = followerCache.updateFollowersCountInCache(`${req.currentUser?.userId}`, 'followingCount', 1);
        await Promise.all([addFollowerToCache, addFolloweeToCache, followersCount, followeeCount]);

        followerQueue.addFollowerJob('addFollowerDB', {
            keyOne: `${req.currentUser?.userId}`,
            keyTwo: `${followerId}`,
            username: req.currentUser?.username,
            followerDocumentId: followerObjectId
        });
        res.status(HTTP_STATUS.OK).json({ message: 'Following user now', notification: true });
    }

    private followerData(response: [IUserDocument, IUserDocument], followerObjectId: ObjectID): IFollower {
        return {
            _id: followerObjectId,
            followeeId: {
                _id: response[0]._id,
                username: response[0].username,
                avatarColor: response[0].avatarColor,
                postCount: response[0].postsCount,
                followersCount: response[0].followersCount,
                followingCount: response[0].followingCount,
                birthDay: response[0].birthDay,
                profilePicture: response[0].profilePicture,
                userProfile: response[0]
            },
            followerId: {
                _id: response[1]._id,
                username: response[1].username,
                avatarColor: response[1].avatarColor,
                postCount: response[1].postsCount,
                followersCount: response[1].followersCount,
                followingCount: response[1].followingCount,
                birthDay: response[1].birthDay,
                profilePicture: response[1].profilePicture,
                userProfile: response[1]
            },
            createdAt: new Date()
        };
    }
}
