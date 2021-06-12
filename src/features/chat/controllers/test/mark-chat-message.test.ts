/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { ConversationModel } from '@chat/models/conversation.schema';
import { Mark } from '@chat/controllers/mark-chat-message';
import { Server } from 'socket.io';
import * as chatServer from '@socket/chat';
import { chatMockRequest, chatMockResponse, conversationParticipants } from '@root/mocks/chat.mock';
import { existingUser } from '@root/mocks/user.mock';
import { messageCache } from '@service/redis/message.cache';
import { chatQueue } from '@service/queues/chat.queue';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/message.cache');

Object.defineProperties(chatServer, {
    socketIOChatObject: {
        value: new Server(),
        writable: true
    }
});

describe('Mark', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('message', () => {
        it('should send correct json response if conversationId is empty', async () => {
            const req: Request = chatMockRequest(
                {},
                {
                    conversationId: '',
                    receiverId: '6064793b091bf02b6a71067a',
                    userId: existingUser._id
                },
                authUserPayload
            ) as Request;
            const res: Response = chatMockResponse();
            jest.spyOn(messageCache, 'updateIsReadPropInCache').mockImplementation((): any => JSON.stringify('testing'));
            jest.spyOn(ConversationModel, 'aggregate').mockResolvedValueOnce(conversationParticipants);
            jest.spyOn(chatServer.socketIOChatObject, 'emit');
            jest.spyOn(chatQueue, 'addChatJob');

            await Mark.prototype.message(req, res);
            expect(chatServer.socketIOChatObject.emit).toHaveBeenCalled();
            expect(chatQueue.addChatJob).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Message marked as read',
                notification: false
            });
        });

        it('should send correct json response if conversationId is not empty', async () => {
            const req: Request = chatMockRequest(
                {},
                {
                    conversationId: '6064799e091bf02b6a71067f',
                    receiverId: '6064793b091bf02b6a71067a',
                    userId: existingUser._id
                },
                authUserPayload
            ) as Request;
            const res: Response = chatMockResponse();
            jest.spyOn(messageCache, 'updateIsReadPropInCache').mockImplementation((): any => JSON.stringify('testing'));
            jest.spyOn(chatServer.socketIOChatObject, 'emit');
            jest.spyOn(chatQueue, 'addChatJob');

            await Mark.prototype.message(req, res);
            expect(chatServer.socketIOChatObject.emit).toHaveBeenCalled();
            expect(chatQueue.addChatJob).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Message marked as read',
                notification: false
            });
        });
    });
});
