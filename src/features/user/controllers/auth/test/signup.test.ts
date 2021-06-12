import { authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { SignUp } from '@user/controllers/auth/signup';
import { Request, Response } from 'express';
import { CustomError } from '@global/helpers/error-handler';
import { existingUser } from '@root/mocks/user.mock';
import mongoose from 'mongoose';

const USERNAME = 'Manny';
const PASSWORD = 'manny1';
const WRONG_USERNAME = 'ma';
const SHORT_PASSWORD = 'ma';
const LONG_PASSWORD = 'mathematics1';
const LONG_USERNAME = 'mathematics';
const EMAIL = 'manny@test.com';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');

describe('SignUp', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('should throw an error if username is not available', () => {
        const req: Request = authMockRequest({}, { username: '', email: EMAIL, password: PASSWORD }) as Request;
        const res: Response = authMockResponse();
        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Username is a required field');
        });
    });

    it('should throw an error if username length is less than minimum length', () => {
        const req: Request = authMockRequest({}, { username: WRONG_USERNAME, email: EMAIL, password: PASSWORD }) as Request;
        const res: Response = authMockResponse();
        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Username must have a minimum length of 4');
        });
    });

    it('should throw an error if username length is greater than maximum length', () => {
        const req: Request = authMockRequest({}, { username: LONG_USERNAME, email: EMAIL, password: PASSWORD }) as Request;
        const res: Response = authMockResponse();
        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Username must have a maximum length of 8');
        });
    });

    it('should throw an error if email is not valid', () => {
        const req: Request = authMockRequest({}, { username: USERNAME, email: USERNAME, password: PASSWORD }) as Request;
        const res: Response = authMockResponse();
        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Email must be valid');
        });
    });

    it('should throw an error if email is not available', () => {
        const req: Request = authMockRequest({}, { username: USERNAME, email: '', password: PASSWORD }) as Request;
        const res: Response = authMockResponse();
        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Email is a required field');
        });
    });

    it('should throw an error if password is not available', () => {
        const req: Request = authMockRequest({}, { username: USERNAME, email: EMAIL, password: '' }) as Request;
        const res: Response = authMockResponse();
        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Password is a required field');
        });
    });

    it('should throw an error if password length is less than minimum length', () => {
        const req: Request = authMockRequest({}, { username: USERNAME, email: EMAIL, password: SHORT_PASSWORD }) as Request;
        const res: Response = authMockResponse();
        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Password must have a minimum length of 4');
        });
    });

    it('should throw an error if password length is greater than maximum length', () => {
        const req: Request = authMockRequest({}, { username: USERNAME, email: EMAIL, password: LONG_PASSWORD }) as Request;
        const res: Response = authMockResponse();
        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Password must have a maximum length of 8');
        });
    });

    it('should throw unauthorize error if user already exist', () => {
        const req: Request = authMockRequest({}, { username: USERNAME, email: EMAIL, password: PASSWORD }) as Request;
        const res: Response = authMockResponse();
        const mockUser = {
            ...existingUser,
            comparePassword: () => true
        };
        jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(mockUser);

        SignUp.prototype.create(req, res).catch((error: CustomError) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid credentials');
        });
    });
});
