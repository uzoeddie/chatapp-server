import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { authUserPayload } from '@root/mocks/auth.mock';
import { notificationData, notificationMockRequest, notificationMockResponse } from '@root/mocks/notification.mock';
import { NotificationModel } from '@notification/models/notification.schema';
import { Get } from '@notification/controllers/get-notification';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');

describe('Get', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('should send correct json response', async () => {
        const req: Request = notificationMockRequest({}, authUserPayload, { notificationId: '12345' }) as Request;
        const res: Response = notificationMockResponse();
        jest.spyOn(NotificationModel, 'find');
        jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce([notificationData]);

        await Get.prototype.notification(req, res);
        expect(NotificationModel.find).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User notifications',
            notifications: [notificationData],
            notification: false
        });
    });
});
