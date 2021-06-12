/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { ConversationModel } from '@chat/models/conversation.schema';
import {
    cachedList,
    cachedMessage,
    chatMessage,
    chatMockRequest,
    chatMockResponse,
    conversationParticipants,
    flattenedChatList,
    parsedChatMessage
} from '@root/mocks/chat.mock';
import { messageCache } from '@service/redis/message.cache';
import { Get } from '@chat/controllers/get-chat-message';
import { chatService } from '@service/db/chat.service';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/message.cache');

describe('Get', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('list', () => {
        it('should send correct json response if chat list exist in redis', async () => {
            const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request;
            const res: Response = chatMockResponse();
            jest.spyOn(messageCache, 'getChatFromCache').mockImplementation((): any => cachedList);

            await Get.prototype.list(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User chat list',
                list: flattenedChatList
            });
        });

        it('should send correct json response if no chat list response from redis', async () => {
            const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request;
            const res: Response = chatMockResponse();
            jest.spyOn(messageCache, 'getChatFromCache').mockImplementation((): any => []);
            jest.spyOn(chatService, 'getMessages').mockImplementation(() => Promise.resolve(flattenedChatList));

            await Get.prototype.list(req, res);
            expect(chatService.getMessages).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User chat list',
                list: flattenedChatList
            });
        });

        it('should send correct json response with empty chat list if it does not exist (redis & database)', async () => {
            const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request;
            const res: Response = chatMockResponse();
            jest.spyOn(messageCache, 'getChatFromCache').mockImplementation((): any => []);
            jest.spyOn(chatService, 'getMessages').mockImplementation(() => Promise.resolve([]));

            await Get.prototype.list(req, res);
            expect(chatService.getMessages).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User chat list',
                list: []
            });
        });
    });

    describe('messages', () => {
        it('should send correct json response if conversationId is not undefined and messages exist in redis', async () => {
            const req: Request = chatMockRequest({}, chatMessage, authUserPayload, {
                conversationId: '6064799e091bf02b6a71067f',
                receiverId: '6064793b091bf02b6a71067a'
            }) as Request;
            const res: Response = chatMockResponse();
            jest.spyOn(messageCache, 'getChatFromCache').mockImplementation((): any => cachedMessage);

            await Get.prototype.messages(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User chat messages',
                chat: parsedChatMessage
            });
        });

        it('should send correct json response if conversationId is not undefined and messages does not exist in redis', async () => {
            const req: Request = chatMockRequest({}, chatMessage, authUserPayload, {
                conversationId: '6064799e091bf02b6a71067f',
                receiverId: '6064793b091bf02b6a71067a'
            }) as Request;
            const res: Response = chatMockResponse();
            jest.spyOn(messageCache, 'getChatFromCache').mockImplementation((): any => []);
            jest.spyOn(chatService, 'getMessages').mockImplementation(() => Promise.resolve(parsedChatMessage));

            await Get.prototype.messages(req, res);
            expect(chatService.getMessages).toHaveBeenCalledWith(
                { conversationId: mongoose.Types.ObjectId('6064799e091bf02b6a71067f') },
                { createdAt: 1 }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User chat messages',
                chat: parsedChatMessage
            });
        });

        it('should send correct json response if conversationId is undefined', async () => {
            const req: Request = chatMockRequest({}, chatMessage, authUserPayload, {
                conversationId: 'undefined',
                receiverId: '6064793b091bf02b6a71067a'
            }) as Request;
            const res: Response = chatMockResponse();
            jest.spyOn(ConversationModel, 'aggregate').mockResolvedValueOnce(conversationParticipants);
            jest.spyOn(chatService, 'getMessages').mockImplementation(() => Promise.resolve(parsedChatMessage));

            await Get.prototype.messages(req, res);
            expect(chatService.getMessages).toHaveBeenCalledWith(
                { conversationId: mongoose.Types.ObjectId(conversationParticipants[0]._id) },
                { createdAt: 1 }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User chat messages',
                chat: parsedChatMessage
            });
        });

        it('should send correct json response if conversationId is undefined and no conversation in the database', async () => {
            const req: Request = chatMockRequest({}, chatMessage, authUserPayload, {
                conversationId: 'undefined',
                receiverId: '6064793b091bf02b6a71067a'
            }) as Request;
            const res: Response = chatMockResponse();
            jest.spyOn(ConversationModel, 'aggregate').mockResolvedValueOnce([]);

            await Get.prototype.messages(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User chat messages',
                chat: []
            });
        });
    });
});
