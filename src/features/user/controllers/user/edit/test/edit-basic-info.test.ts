import { Request, Response } from 'express';
import { authUserPayload, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { Server } from 'socket.io';
import * as userServer from '@socket/user';
import { userInfoQueue } from '@service/queues/user-info.queue';
import { UserInfoCache } from '@service/redis/user-info.cache';
import { EditBasicInfo } from '@user/controllers/user/edit/edit-basic-info';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@socket/user');
jest.mock('@service/redis/user-info.cache');

Object.defineProperties(userServer, {
  socketIOUserObject: {
    value: new Server(),
    writable: true
  }
});

describe('EditBasicInfo', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('info', () => {
    it('should call updateUserInfoListInCache', async () => {
      const basicInfo = {
        quote: 'This is cool',
        work: 'KickChat Inc.',
        school: 'Taltech',
        location: 'Tallinn'
      };
      const req: Request = authMockRequest({}, basicInfo, authUserPayload, {}) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserInfoCache.prototype, 'updateUserInfoListInCache');

      await EditBasicInfo.prototype.info(req, res);
      for (const [key, value] of Object.entries(req.body)) {
        expect(UserInfoCache.prototype.updateUserInfoListInCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`, key, `${value}`);
      }
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Updated successfully'
      });
    });

    it('should call addUserInfoJob', async () => {
      const basicInfo = {
        quote: 'This is cool',
        work: 'KickChat Inc.',
        school: 'Taltech',
        location: 'Tallinn'
      };
      const req: Request = authMockRequest({}, basicInfo, authUserPayload, {}) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(userInfoQueue, 'addUserInfoJob');

      await EditBasicInfo.prototype.info(req, res);
      expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateUserInfoInCache', {
        key: `${req.currentUser?.userId}`,
        value: req.body
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Updated successfully'
      });
    });
  });

  describe('social', () => {
    it('should call updateUserInfoListInCache', async () => {
      const socialInfo = {
        facebook: 'https://facebook.com/tester',
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
        twitter: 'https://twitter.com'
      };
      const req: Request = authMockRequest({}, socialInfo, authUserPayload, {}) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(UserInfoCache.prototype, 'updateUserInfoListInCache');

      await EditBasicInfo.prototype.social(req, res);
      expect(UserInfoCache.prototype.updateUserInfoListInCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`, 'social', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Updated successfully'
      });
    });

    it('should call addUserInfoJob', async () => {
      const socialInfo = {
        facebook: 'https://facebook.com/tester',
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
        twitter: 'https://twitter.com'
      };
      const req: Request = authMockRequest({}, socialInfo, authUserPayload, {}) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(userInfoQueue, 'addUserInfoJob');

      await EditBasicInfo.prototype.social(req, res);
      expect(userInfoQueue.addUserInfoJob).toHaveBeenCalledWith('updateSocialLinksInCache', {
        key: `${req.currentUser?.userId}`,
        value: req.body
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Updated successfully'
      });
    });
  });
});
