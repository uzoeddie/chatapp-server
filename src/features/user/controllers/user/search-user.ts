import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from '@service/redis/user.cache';
import { Helpers } from '@global/helpers/helpers';
import { ISearchUser } from '@chat/interfaces/chat.interface';

const userCache: UserCache = new UserCache();

export class Search {
  public async user(req: Request, res: Response): Promise<void> {
    const users: ISearchUser[] = await userCache.searchForUserInCache(Helpers.escapeRegex(req.params.query), `${req.currentUser?.userId}`);
    res.status(HTTP_STATUS.OK).json({ message: 'Search results', search: users });
  }
}

// it seems aws elasticache does not support redis search
// if that is the case, then use the method below to search from mongodb database instead of redis

// public async user(req: Request, res: Response): Promise<void> {
//   const regex = new RegExp(Helpers.escapeRegex(req.params.query), 'i');
//   const users: ISearchUser[] = await Search.prototype.searchAggregate(regex);
//   res.status(HTTP_STATUS.OK).json({ message: 'Search results', search: users });
// }

// private searchAggregate(regex: RegExp): Promise<ISearchUser[]> {
//   return new Promise((resolve) => {
//       const users: Aggregate<ISearchUser[]> = UserModel.aggregate([
//           { $match: { username: regex } },
//           {
//               $project: {
//                   _id: 1,
//                   username: 1,
//                   email: 1,
//                   avatarColor: 1,
//                   profilePicture: 1
//               }
//           }
//       ]);
//       resolve(users);
//   });
// }
