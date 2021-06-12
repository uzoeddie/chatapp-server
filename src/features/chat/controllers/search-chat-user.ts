import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ISearchUser } from '@chat/interfaces/chat.interface';
import { Helpers } from '@global/helpers/helpers';
import { UserModel } from '@user/models/user.schema';
import { Aggregate } from 'mongoose';

export class Search {
    public async user(req: Request, res: Response): Promise<void> {
        const regex = new RegExp(Helpers.escapeRegex(req.params.query), 'i');
        const users: ISearchUser[] = await Search.prototype.searchAggregate(regex);
        res.status(HTTP_STATUS.OK).json({ message: 'Search results', search: users });
    }

    private searchAggregate(regex: RegExp): Promise<ISearchUser[]> {
        return new Promise((resolve) => {
            const users: Aggregate<ISearchUser[]> = UserModel.aggregate([
                { $match: { username: regex } },
                {
                    $project: {
                        _id: 1,
                        username: 1,
                        email: 1,
                        avatarColor: 1,
                        profilePicture: 1
                    }
                }
            ]);
            resolve(users);
        });
    }
}
