import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { MessageCache } from '@service/redis/message.cache';
import { chatService } from '@service/db/chat.service';

const messageCache: MessageCache = new MessageCache();

export class Get {
  public async conversationList(req: Request, res: Response): Promise<void> {
    let list = [];
    const cachedList = await messageCache.getUserConversationList(`${req.currentUser?.userId}`);
    if (cachedList.length) {
      list = cachedList;
    } else {
      list = await chatService.getUserConversationList(mongoose.Types.ObjectId(req.currentUser?.userId));
    }
    res.status(HTTP_STATUS.OK).json({ message: 'User conversation list', list });
  }

  public async messages(req: Request, res: Response): Promise<void> {
    const { receiverId } = req.params;
    let messages = [];
    const cachedMessages = await messageCache.getChatMessagesFromCache(`${req.currentUser?.userId}`, `${receiverId}`);
    if (cachedMessages.length) {
      messages = cachedMessages;
    } else {
      messages = await chatService.getMessages(mongoose.Types.ObjectId(req.currentUser!.userId), mongoose.Types.ObjectId(receiverId), {
        createdAt: 1
      });
    }
    res.status(HTTP_STATUS.OK).json({ message: 'User chat messages', messages });
  }
}
