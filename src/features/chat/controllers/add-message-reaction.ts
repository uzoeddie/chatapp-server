import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { MessageCache } from '@service/redis/message.cache';
import { socketIOChatObject } from '@socket/chat';
import { chatQueue } from '@service/queues/chat.queue';
import mongoose from 'mongoose';
import { IMessageData } from '@chat/interfaces/chat.interface';

const messageCache: MessageCache = new MessageCache();

export class Message {
  public async reaction(req: Request, res: Response): Promise<void> {
    const { conversationId, messageId, reaction, type } = req.body;
    const updatedmessage: IMessageData = await messageCache.updateMessageReaction(
      `${conversationId}`,
      `${messageId}`,
      `${reaction}`,
      `${req.currentUser?.username}`,
      type
    );
    socketIOChatObject.emit('message reaction', updatedmessage);
    chatQueue.addChatJob('addMessageReaction', {
      messageId: mongoose.Types.ObjectId(messageId),
      senderName: req.currentUser!.username,
      reaction,
      type
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Message reaction added' });
  }
}
