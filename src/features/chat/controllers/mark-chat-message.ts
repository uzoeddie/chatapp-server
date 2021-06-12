import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { unflatten } from 'flat';
import { chatService } from '@service/db/chat.service';
import { IConversationDocument } from '@chat/interfaces/conversation.interface';
import { messageCache } from '@service/redis/message.cache';
import { chatQueue } from '@service/queues/chat.queue';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { markChatSchema } from '@chat/schemes/chat';
import { socketIOChatObject } from '@socket/chat';

export class Mark {
    @joiValidation(markChatSchema)
    public async message(req: Request, res: Response): Promise<void> {
        const { conversationId, receiverId, userId } = req.body;
        let conversationMessageId: mongoose.Types.ObjectId;
        if (!conversationId) {
            const conversation: IConversationDocument[] = await chatService.conversationAggregate(userId, receiverId);
            conversationMessageId = conversation[0]._id;
        } else {
            conversationMessageId = mongoose.Types.ObjectId(conversationId);
        }

        const response = await messageCache.updateIsReadPropInCache(
            `${req.currentUser?.userId}`,
            `${receiverId}`,
            `${conversationMessageId}`
        );
        socketIOChatObject.emit('message collection update', unflatten(JSON.parse(response)));
        chatQueue.addChatJob('markMessagesAsReadInDB', { conversationId: conversationMessageId });
        res.status(HTTP_STATUS.OK).json({ message: 'Message marked as read', notification: false });
    }
}
