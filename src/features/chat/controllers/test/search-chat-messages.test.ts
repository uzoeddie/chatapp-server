/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { chatMockRequest, chatMockResponse, searchResult } from '@root/mocks/chat.mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import { Search } from '@chat/controllers/search-chat-user';
import { UserModel } from '@user/models/user.schema';

jest.useFakeTimers();

describe('Search', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('user', () => {
        it('should send correct json response if searched user exist', async () => {
            const req: Request = chatMockRequest({}, {}, authUserPayload, { query: 'Danny' }) as Request;
            const res: Response = chatMockResponse();
            jest.spyOn(mongoose.Query.prototype, 'exec');
            jest.spyOn(UserModel, 'aggregate').mockResolvedValueOnce(searchResult);

            await Search.prototype.user(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Search results',
                search: searchResult
            });
        });

        it('should send correct json response if searched user does not exist', async () => {
            const req: Request = chatMockRequest({}, {}, authUserPayload, { query: 'DannyBoy' }) as Request;
            const res: Response = chatMockResponse();
            jest.spyOn(mongoose.Query.prototype, 'exec');
            jest.spyOn(UserModel, 'aggregate').mockResolvedValueOnce([]);

            await Search.prototype.user(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Search results',
                search: []
            });
        });
    });
});
