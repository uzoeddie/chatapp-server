import express, { Router } from 'express';
import { Add } from '@chat/controllers/add-chat-message';
import { Get } from '@chat/controllers/get-chat-message';
import { Mark } from '@chat/controllers/mark-chat-message';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { Search } from '@chat/controllers/search-chat-user';

class ChatRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.get('/chat/message/search/:query', authMiddleware.checkAuthentication, Search.prototype.user);
        this.router.get('/chat/message/list', authMiddleware.checkAuthentication, Get.prototype.list);
        this.router.get('/chat/message/:receiverId/:conversationId', authMiddleware.checkAuthentication, Get.prototype.messages);
        this.router.post('/chat/message', authMiddleware.checkAuthentication, Add.prototype.message);
        this.router.put('/chat/message/mark-as-read', authMiddleware.checkAuthentication, Mark.prototype.message);

        return this.router;
    }
}

export const chatRoutes: ChatRoutes = new ChatRoutes();
