import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Password } from '@user/controllers/auth/password';
import { authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { CustomError } from '@global/helpers/error-handler';
import { existingUser } from '@root/mocks/user.mock';
import { emailQueue } from '@service/queues/email.queue';

const WRONG_EMAIL = 'test@email.com';
const CORRECT_EMAIL = 'manny@me.com';
const INVALID_EMAIL = 'test';
const CORRECT_PASSWORD = 'manny';

jest.mock('@service/queues/base.queue');
jest.mock('@service/queues/email.queue');

describe('Password', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw an error if email is invalid', () => {
      const req: Request = authMockRequest({}, { email: INVALID_EMAIL }) as Request;
      const res: Response = authMockResponse();
      Password.prototype.create(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Field must be valid');
      });
    });

    it('should throw "Invalid credentials" if email does not exist', () => {
      const req: Request = authMockRequest({}, { email: WRONG_EMAIL }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(null);
      Password.prototype.create(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid credentials');
      });
    });

    it('should call sendMail method', async () => {
      const req: Request = authMockRequest({}, { email: CORRECT_EMAIL }) as Request;
      const res: Response = authMockResponse();
      const mockUser = {
        ...existingUser,
        save: () => Promise.resolve(existingUser)
      };
      jest.spyOn(emailQueue, 'addEmailJob');
      jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(mockUser);
      await Password.prototype.create(req, res);
      expect(emailQueue.addEmailJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset email sent.',
        user: {},
        token: ''
      });
    });
  });

  describe('update', () => {
    it('should throw an error if password is empty', () => {
      const req: Request = authMockRequest({}, { password: '' }) as Request;
      const res: Response = authMockResponse();
      Password.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Password is a required field');
      });
    });

    it('should throw an error if password and cpassword are different', () => {
      const req: Request = authMockRequest({}, { password: CORRECT_PASSWORD, cpassword: `${CORRECT_PASSWORD}2` }) as Request;
      const res: Response = authMockResponse();
      Password.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Passwords should match');
      });
    });

    it('should throw error if reset token has expired', () => {
      const req: Request = authMockRequest({}, { password: CORRECT_PASSWORD, cpassword: CORRECT_PASSWORD }, null, {
        token: ''
      }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(null);
      Password.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Reset token has expired.');
      });
    });

    it('should call sendMail method and send correct json response', async () => {
      const req: Request = authMockRequest({}, { password: CORRECT_PASSWORD, cpassword: CORRECT_PASSWORD }, null, {
        token: '12sde3'
      }) as Request;
      const res: Response = authMockResponse();
      const mockUser = {
        ...existingUser,
        save: () => Promise.resolve(existingUser)
      };
      jest.spyOn(emailQueue, 'addEmailJob');
      jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(mockUser);
      await Password.prototype.update(req, res);
      expect(emailQueue.addEmailJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password successfully updated.',
        user: {},
        token: ''
      });
    });
  });
});
