import { Application, json, urlencoded, Response, Request, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieSession from 'cookie-session';
import compression from 'compression';
import Logger from 'bunyan';
import HTTP_STATUS from 'http-status-codes';
import 'express-async-errors';
import apiStats from 'swagger-stats';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { config } from '@root/config';
import applicationRoutes from '@root/routes';
import { CustomError, IErrorResponse } from '@global/helpers/error-handler';
import { SocketIOUserHandler } from '@socket/user';
import { SocketIOChatHandler } from '@socket/chat';
import { SocketIOFollowerHandler } from '@socket/follower';
import { SocketIOImageHandler } from '@socket/image';
import { SocketIONotificationHandler } from '@socket/notification';
import { SocketIOPostHandler } from '@socket/post';

const log: Logger = config.createLogger('server');
const SERVER_PORT = 5000;

export class ChatServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddlewares(this.app);
    this.standardMiddlewares(this.app);
    this.routeMiddlewares(this.app);
    this.apiMonitoring(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddlewares(app: Application): void {
    app.set('trust proxy', 1);
    app.use(
      cookieSession({
        name: 'session',
        keys: [process.env.SECRET_KEY_ONE!, process.env.SECRET_KEY_TWO!],
        maxAge: 24 * 7 * 3600000,
        secure: process.env.NODE_ENV !== 'development',
        // sameSite: 'none',
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
  }

  private standardMiddlewares(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  private apiMonitoring(app: Application): void {
    app.use(
      apiStats.getMiddleware({
        uriPath: '/swagger-monitoring'
      })
    );
  }

  private routeMiddlewares(app: Application): void {
    applicationRoutes(app);
  }

  private globalErrorHandler(app: Application): void {
    app.all('*', async (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });

    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeErrors());
      }
      next(error);
    });
  }

  private async startServer(app: Application): Promise<void> {
    if (!config.JWT_TOKEN) {
      throw new Error('JWT_TOKEN must be provided');
    }

    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      this.socketIOConnections(socketIO);
    } catch (error) {
      log.error(error);
    }
  }

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });
    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  private startHttpServer(httpServer: http.Server): void {
    log.info(`Worker with process id of ${process.pid} has started...`);
    log.info(`Server has started with process ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Server running on port ${SERVER_PORT}`);
    });
  }

  private socketIOConnections(io: Server): void {
    const userSocketIOHandler: SocketIOUserHandler = new SocketIOUserHandler(io);
    const chatSocketIOHandler: SocketIOChatHandler = new SocketIOChatHandler(io);
    const postSocketIOHandler: SocketIOPostHandler = new SocketIOPostHandler(io);
    const followerSocketIOHandler: SocketIOFollowerHandler = new SocketIOFollowerHandler();
    const imageSocketIOHandler: SocketIOImageHandler = new SocketIOImageHandler();
    const notificationSocketIOHandler: SocketIONotificationHandler = new SocketIONotificationHandler();

    userSocketIOHandler.listen();
    chatSocketIOHandler.listen();
    postSocketIOHandler.listen();
    followerSocketIOHandler.listen(io);
    imageSocketIOHandler.listen(io);
    notificationSocketIOHandler.listen(io);
  }
}
