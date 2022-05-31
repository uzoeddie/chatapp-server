/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { Server } from 'socket.io';
import * as chatServer from '@socket/chat';
import { chatMessage, chatMockRequest, chatMockResponse } from '@root/mocks/chat.mock';
import { CustomError } from '@global/helpers/error-handler';
import { Add } from '@chat/controllers/add-chat-message';
import { chatQueue } from '@service/queues/chat.queue';
import { authUserPayload } from '@root/mocks/auth.mock';
import { existingUser } from '@root/mocks/user.mock';
import { UserCache } from '@service/redis/user.cache';

const userCache = new UserCache();

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@socket/user');
jest.mock('@service/redis/user.cache');
jest.mock('@service/redis/message.cache');

Object.defineProperties(chatServer, {
    socketIOChatObject: {
        value: new Server(),
        writable: true
    }
});

describe('Add', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('should throw an error if receiverName is not available', () => {
        const req: Request = chatMockRequest({}, { receiverName: '', receiverId: {} }) as Request;
        const res: Response = chatMockResponse();
        Add.prototype.message(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('"receiverName" is not allowed to be empty');
        });
    });

    it('should set session data for valid credentials and send correct json response', async () => {
        const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request;
        const res: Response = chatMockResponse();
        jest.spyOn(userCache, 'getUserFromCache').mockImplementation((): any => existingUser);
        jest.spyOn(chatServer.socketIOChatObject, 'to');
        jest.spyOn(chatServer.socketIOChatObject, 'emit');
        jest.spyOn(chatQueue, 'addChatJob');

        await Add.prototype.message(req, res);
        expect(chatServer.socketIOChatObject.to).toHaveBeenCalled();
        expect(chatServer.socketIOChatObject.emit).toHaveBeenCalled();
        expect(chatQueue.addChatJob).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Message added',
            conversationId: mongoose.Types.ObjectId(`${chatMessage.conversationId}`),
            notification: false
        });
    });
});
