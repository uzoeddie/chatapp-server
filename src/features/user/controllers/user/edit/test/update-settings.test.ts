import { Request, Response } from 'express';
import { authUserPayload, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { Settings } from '@user/controllers/user/edit/update-settings';
import { userQueue } from '@service/queues/user.queue';
import { userCache } from '@service/redis/user.cache';
import { existingUser } from '@root/mocks/user.mock';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user-info.cache');
jest.mock('@service/redis/user.cache');

describe('Settings', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('update', () => {
        it('should call "addUserJob" methods', async () => {
            const settings = {
                messages: true,
                reactions: false,
                comments: true,
                follows: false
            };
            const req: Request = authMockRequest({}, settings, authUserPayload) as Request;
            const res: Response = authMockResponse();
            jest.spyOn(userCache, 'updateNotificationSettingsInCache');
            jest.spyOn(userQueue, 'addUserJob');

            await Settings.prototype.update(req, res);
            expect(userCache.updateNotificationSettingsInCache).toHaveBeenCalledWith(existingUser._id, 'notifications', settings);
            expect(userQueue.addUserJob).toHaveBeenCalledWith('updateNotificationSettings', {
                key: 'Manny',
                value: settings
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Notification settings updated successfully',
                notification: false,
                settings: settings
            });
        });
    });
});
