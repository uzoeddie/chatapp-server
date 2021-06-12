/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/auth.mock';
import * as imageServer from '@socket/image';
import { imagesMockRequest, imagesMockResponse } from '@root/mocks/image.mock';
import { imageQueue } from '@service/queues/image.queue';
import { Delete } from '@image/controllers/delete-image';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');

Object.defineProperties(imageServer, {
    socketIOImageObject: {
        value: new Server(),
        writable: true
    }
});

describe('Delete', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('should send correct json response', async () => {
        const req: Request = imagesMockRequest({}, {}, authUserPayload, { imageId: '12345' }) as Request;
        const res: Response = imagesMockResponse();
        jest.spyOn(imageServer.socketIOImageObject, 'emit');
        jest.spyOn(imageQueue, 'addImageJob');

        await Delete.prototype.image(req, res);
        expect(imageServer.socketIOImageObject.emit).toHaveBeenCalled();
        expect(imageQueue.addImageJob).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Image deleted successfully',
            notification: true
        });
    });
});
