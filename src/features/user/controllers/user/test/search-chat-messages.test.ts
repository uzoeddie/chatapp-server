import { Request, Response } from 'express';
import { chatMockRequest, chatMockResponse } from '@root/mocks/chat.mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import { UserCache } from '@service/redis/user.cache';
import { searchedUserMock } from '@root/mocks/user.mock';
import { Search } from '@user/controllers/user/search-user';

jest.useFakeTimers();
jest.mock('@service/redis/user.cache');

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
      jest.spyOn(UserCache.prototype, 'searchForUserInCache').mockResolvedValue([searchedUserMock]);

      await Search.prototype.user(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Search results', search: [searchedUserMock]
      });
    });

    it('should send correct json response if searched user does not exist', async () => {
      const req: Request = chatMockRequest({}, {}, authUserPayload, { query: 'DannyBoy' }) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(UserCache.prototype, 'searchForUserInCache').mockResolvedValue([]);

      await Search.prototype.user(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Search results',
        search: []
      });
    });
  });
});
