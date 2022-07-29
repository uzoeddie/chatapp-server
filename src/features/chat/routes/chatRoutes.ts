import express, { Router } from 'express';
import { Add } from '@chat/controllers/add-chat-message';
import { Message } from '@chat/controllers/add-message-reaction';
import { Get } from '@chat/controllers/get-chat-message';
import { Mark } from '@chat/controllers/mark-chat-message';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { Delete } from '@chat/controllers/delete-chat-message';

class ChatRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/chat/message/user/:receiverId', authMiddleware.checkAuthentication, Get.prototype.messages);
    this.router.get('/chat/message/conversation-list', authMiddleware.checkAuthentication, Get.prototype.conversationList);
    this.router.post('/chat/message', authMiddleware.checkAuthentication, Add.prototype.message);
    this.router.post('/chat/message/add-chat-users', authMiddleware.checkAuthentication, Add.prototype.addChatUsers);
    this.router.post('/chat/message/remove-chat-users', authMiddleware.checkAuthentication, Add.prototype.removeChatUsers);
    this.router.put('/chat/message/mark-as-read', authMiddleware.checkAuthentication, Mark.prototype.message);
    this.router.put('/chat/message/reaction', authMiddleware.checkAuthentication, Message.prototype.reaction);
    this.router.delete('/chat/message/mark-as-deleted/:messageId/:senderId/:receiverId/:type', authMiddleware.checkAuthentication, Delete.prototype.markMessageAsDeleted);

    return this.router;
  }
}

export const chatRoutes: ChatRoutes = new ChatRoutes();
