import { Application } from 'express';
import { currentUserRoute } from '@user/routes/currenUserRoutes';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { postRoutes } from '@post/routes/postRoutes';
import { commentRoutes } from '@comment/routes/commentRoutes';
import { reactionRoutes } from '@reaction/routes/reactionRoutes';
import { chatRoutes } from '@chat/routes/chatRoutes';
import { imageRoutes } from '@image/routes/imageRoutes';
import { notificationRoutes } from '@notification/routes/notificationRoutes';
import { followerRoutes } from '@follower/routes/followerRoutes';
import { userRoutes } from '@user/routes/userRoutes';
import { healthRoute } from '@user/routes/healthRoutes';
import { authRoutes } from '@user/routes/authRoutes';
import { serverAdapter } from '@service/queues/base.queue';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use('', healthRoute.routes());
    app.use('', healthRoute.fiboRoutes());
    app.use('', healthRoute.instance());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signoutRoute());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoute.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, commentRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, chatRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, imageRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, notificationRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, followerRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, userRoutes.routes());
  };
  routes();
};
