import { Response } from 'express';
import { AuthPayload } from '@user/interfaces/user.interface';
import { IJwt } from './auth.mock';

export const globalMockRequest = (sessionData: IJwt, currentUser?: AuthPayload | null) => ({
    session: sessionData,
    currentUser
});

export const globalMockResponse = (): Response => {
    const res: Response = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
