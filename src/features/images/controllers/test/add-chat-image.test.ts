/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { Add } from '@chat/controllers/add-chat-message';
import * as chatServer from '@socket/chat';
import { imagesMockRequest, imagesMockResponse } from '@root/mocks/image.mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import { AddMessage } from '@image/controllers/add-chat-image';
import * as cloudinaryUploads from '@global/helpers/cloudinary-upload';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@chat/controllers/add-chat-message');
jest.mock('@global/helpers/cloudinary-upload');

Object.defineProperties(chatServer, {
    socketIOChatObject: {
        value: new Server(),
        writable: true
    }
});

describe('AddMessage', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('should call the upload and message methods', async () => {
        const req: Request = imagesMockRequest(
            {},
            {
                selectedImages: ['this is a string'],
                receiverId: {
                    avatarColor: '#9c27b0',
                    email: 'danny@me.com',
                    profilePicture: '',
                    username: 'Danny',
                    _id: '605727cd646eb50e668a4e13'
                },
                receiverName: 'Manny'
            },
            authUserPayload
        ) as Request;
        const res: Response = imagesMockResponse();
        jest.spyOn(chatServer.socketIOChatObject, 'emit');
        jest.spyOn(Add.prototype, 'message');
        jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));

        await AddMessage.prototype.image(req, res);
        expect(cloudinaryUploads.uploads).toHaveBeenCalled();
        expect(Add.prototype.message).toHaveBeenCalled();
    });
});
