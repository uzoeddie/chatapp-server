import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { Add } from '@reaction/controllers/add-reaction';
import { Remove } from '@reaction/controllers/remove-reaction';
import { Get } from '@reaction/controllers/get-reactions';

class ReactionRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.get('/post/reactions/:postId', authMiddleware.checkAuthentication, Get.prototype.reactions);
        this.router.get('/post/single/reaction/:postId/:reactionId', authMiddleware.checkAuthentication, Get.prototype.singleReaction);
        this.router.get('/post/single/reaction/username/:username/:postId', authMiddleware.checkAuthentication, Get.prototype.singleReactionByUsername);
        this.router.get('/post/reactions/username/:username', authMiddleware.checkAuthentication, Get.prototype.reactionsByUsernameFromCache);
        this.router.post('/post/reaction', authMiddleware.checkAuthentication, Add.prototype.reaction);
        this.router.delete('/post/reaction/:postId/:previousReaction/:postReactions', authMiddleware.checkAuthentication, Remove.prototype.reaction);

        return this.router;
    }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes();
