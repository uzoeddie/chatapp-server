import { authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { Request, Response } from 'express';
import { CustomError } from '@global/helpers/error-handler';
import { existingUser } from '@root/mocks/user.mock';
import { SignIn } from '@user/controllers/auth/signin';
import { UserModel } from '@user/models/user.schema';
import mongoose from 'mongoose';
import { Helpers } from '@global/helpers/helpers';

const USERNAME = 'Manny';
const PASSWORD = 'manny1';
const WRONG_USERNAME = 'ma';
const WRONG_PASSWORD = 'ma';
const LONG_PASSWORD = 'mathematics1';
const LONG_USERNAME = 'mathematics';

jest.useFakeTimers();

describe('SignIn', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest({}, { username: '', password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  it('should throw an error if username length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: WRONG_USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if username length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: LONG_USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if password is not available', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: '' }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required field');
    });
  });

  it('should throw an error if password length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw an error if password length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: LONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw "Invalid credentials" if username does not exist', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    jest.spyOn(UserModel, 'findOne');
    jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(null);

    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(UserModel.findOne).toHaveBeenCalledWith({ username: Helpers.firstLetterUppercase(req.body.username) });
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('should throw "Invalid credentials" if password does not exist', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    const mockUser = {
      ...existingUser,
      comparePassword: () => false
    };
    jest.spyOn(UserModel, 'findOne');
    jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(mockUser);

    SignIn.prototype.read(req, res).catch((error: CustomError) => {
      expect(UserModel.findOne).toHaveBeenCalledWith({ username: Helpers.firstLetterUppercase(req.body.username) });
      expect(mockUser.comparePassword()).toEqual(false);
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    const mockUser = {
      ...existingUser,
      comparePassword: () => true
    };
    jest.spyOn(UserModel, 'findOne');
    jest.spyOn(mongoose.Query.prototype, 'exec').mockResolvedValueOnce(mockUser);

    await SignIn.prototype.read(req, res);
    expect(req.session?.jwt).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User login successfully',
      user: mockUser,
      token: req.session?.jwt
    });
  });
});
