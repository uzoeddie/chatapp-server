import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { followerCache } from '@service/redis/follower.cache';
import { blockedUserQueue } from '@service/queues/blocked.queue';

export class AddUser {
    public async block(req: Request, res: Response): Promise<void> {
        const { followerId } = req.params;
        AddUser.prototype.updateBlockedUser(followerId, req.currentUser!.userId, 'block');
        blockedUserQueue.addBlockedUserJob('addBlockedUserToDB', {
            keyOne: `${req.currentUser?.userId}`,
            keyTwo: `${followerId}`,
            type: 'block'
        });
        res.status(HTTP_STATUS.OK).json({ message: 'User blocked', notification: false });
    }

    public async unblock(req: Request, res: Response): Promise<void> {
        const { followerId } = req.params;
        AddUser.prototype.updateBlockedUser(followerId, req.currentUser!.userId, 'unblock');
        blockedUserQueue.addBlockedUserJob('removeBlockedUserFromDB', {
            keyOne: `${req.currentUser?.userId}`,
            keyTwo: `${followerId}`,
            type: 'unblock'
        });
        res.status(HTTP_STATUS.OK).json({ message: 'User unblocked', notification: false });
    }

    private async updateBlockedUser(followerId: string, userId: string, type: 'block' | 'unblock'): Promise<void> {
        const blockedBy: Promise<void> = followerCache.updateBlockedUserPropInCache(`${followerId}`, 'blockedBy', `${userId}`, type);
        const blocked: Promise<void> = followerCache.updateBlockedUserPropInCache(`${userId}`, 'blocked', `${followerId}`, type);
        await Promise.all([blockedBy, blocked]);
    }
}
