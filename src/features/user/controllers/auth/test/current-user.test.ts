import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CurrentUser } from '@user/controllers/auth/current-user';
import { authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { existingUser } from '@root/mocks/user.mock';

jest.mock('@service/redis/user.cache');

const USERNAME = 'Manny';
const PASSWORD = 'manny1';

describe('CurrentUser', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should set session token', async () => {
        const req: Request = authMockRequest({ jwt: '12djdj34' }, { username: USERNAME, password: PASSWORD }) as Request;
        const res: Response = authMockResponse();
        jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(existingUser);
        await CurrentUser.prototype.read(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            token: req.session?.jwt,
            isUser: true
        });
    });

    it('should set session token to null and send correct json response', async () => {
        const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
        const res: Response = authMockResponse();
        jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(null);
        await CurrentUser.prototype.read(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            token: null,
            isUser: false
        });
    });
});
