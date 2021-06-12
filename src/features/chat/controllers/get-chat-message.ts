import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { unflatten } from 'flat';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { IChatMessage } from '@chat/interfaces/chat.interface';
import { messageCache } from '@service/redis/message.cache';
import { chatService } from '@service/db/chat.service';
import { IConversationDocument } from '@chat/interfaces/conversation.interface';

export class Get {
    public async list(req: Request, res: Response): Promise<void> {
        let list: IChatMessage[];
        const cachedList: string[] = await messageCache.getChatFromCache(`chatList:${req.currentUser?.userId}`);
        if (cachedList.length) {
            list = Get.prototype.unflattenList(cachedList);
        } else {
            const senderId: ObjectId = mongoose.Types.ObjectId(req.currentUser?.userId);
            list = await chatService.getMessages(
                {
                    $or: [{ senderId }, { receiverId: senderId }]
                },
                { createdAt: 1 }
            );
        }

        res.status(HTTP_STATUS.OK).json({ message: 'User chat list', list });
    }

    public async messages(req: Request, res: Response): Promise<void> {
        const { conversationId, receiverId } = req.params;
        let messages: IChatMessage[] = [];
        if (conversationId !== 'undefined') {
            const cachedMessages: string[] = await messageCache.getChatFromCache(`messages:${conversationId}`);
            messages = cachedMessages.length
                ? Get.prototype.unflattenList(cachedMessages)
                : await chatService.getMessages({ conversationId: mongoose.Types.ObjectId(conversationId) }, { createdAt: 1 });
        } else {
            const conversation: IConversationDocument[] = await chatService.conversationAggregate(req.currentUser!.userId, receiverId);
            if (conversation.length) {
                messages = await chatService.getMessages({ conversationId: conversation[0]._id }, { createdAt: 1 });
            }
        }
        res.status(HTTP_STATUS.OK).json({ message: 'User chat messages', chat: messages });
    }

    private unflattenList(cachedList: string[]): IChatMessage[] {
        const flattenedList = [];
        for (const item of cachedList) {
            flattenedList.push(unflatten(JSON.parse(item)));
        }
        return flattenedList;
    }
}
