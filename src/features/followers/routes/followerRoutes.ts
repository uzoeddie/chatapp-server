import express, { Router } from 'express';
import { Add } from '@follower/controllers/follower-user';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { Remove } from '@follower/controllers/unfollow-user';
import { AddUser } from '@follower/controllers/block-user';
import { Get } from '@follower/controllers/get-followers';

class FollowerRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.get('/user/following', authMiddleware.checkAuthentication, Get.prototype.userFollowing);
        this.router.get('/user/followers/:userId', authMiddleware.checkAuthentication, Get.prototype.userFollowers);
        this.router.put('/user/follow/:followerId', authMiddleware.checkAuthentication, Add.prototype.follower);
        this.router.put('/user/unfollow/:followerObjectId/:followerId', authMiddleware.checkAuthentication, Remove.prototype.follower);
        this.router.put('/user/block/:followerId', authMiddleware.checkAuthentication, AddUser.prototype.block);
        this.router.put('/user/unblock/:followerId', authMiddleware.checkAuthentication, AddUser.prototype.unblock);

        return this.router;
    }
}

export const followerRoutes: FollowerRoutes = new FollowerRoutes();
