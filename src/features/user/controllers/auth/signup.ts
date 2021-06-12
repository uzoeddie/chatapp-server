import { ObjectID } from 'mongodb';
import { Request, Response } from 'express';
import crypto from 'crypto';
import Jimp from 'jimp';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';
import { Helpers } from '@global/helpers/helpers';
import { ISignUpData, IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import { uploads } from '@global/helpers/cloudinary-upload';
import { config } from '@root/config';
import { userCache } from '@service/redis/user.cache';
import { userQueue } from '@service/queues/user.queue';
import { BadRequestError } from '@global/helpers/error-handler';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { signupSchema } from '@user/schemes/auth/signup';

const MIN_NUMBER = 1000;
const MAX_NUMBER = 10000;

export class SignUp {
    @joiValidation(signupSchema)
    public async create(req: Request, res: Response): Promise<void> {
        const { username, email, password } = req.body;
        const checkIfUserExist: IUserDocument = (await UserModel.findOne({
            username: Helpers.firstLetterUppercase(username),
            email: Helpers.lowerCase(email)
        }).exec()) as IUserDocument;
        if (checkIfUserExist) {
            throw new BadRequestError('Invalid credentials');
        }

        const createdObjectId: ObjectID = new ObjectID();
        const random: number = await Promise.resolve(crypto.randomInt(MIN_NUMBER, MAX_NUMBER));
        const uId = `${random}${Date.now()}`;
        const data: IUserDocument = SignUp.prototype.signupData({
            createdObjectId,
            uId,
            username,
            email,
            password
        });
        const image: Jimp = await SignUp.prototype.loadJimpImage(Helpers.firstLetterUppercase(username), data.avatarColor);
        const dataFile: string = await image.getBase64Async('image/png');
        await Promise.all([
            uploads(dataFile, `${createdObjectId}`, true, true),
            userCache.saveUserToCache(`${createdObjectId}`, uId, data)
        ]);
        userQueue.addUserJob('addUserToDB', { value: data });
        const userJwt: string = SignUp.prototype.signToken(data);
        req.session = { jwt: userJwt };
        res.status(HTTP_STATUS.CREATED).json({ message: 'User created succesffuly', user: data, token: userJwt, notification: false });
    }

    private signToken(data: IUserDocument): string {
        return JWT.sign(
            {
                userId: data._id,
                uId: data.uId,
                email: data.email,
                username: data.username,
                avatarColor: data.avatarColor
            },
            config.JWT_TOKEN!
        );
    }

    private signupData(data: ISignUpData): IUserDocument {
        const { createdObjectId, username, email, uId, password } = data;
        return ({
            _id: createdObjectId,
            uId,
            username,
            email,
            password,
            avatarColor: Helpers.avatarColor(),
            createdAt: new Date(),
            blocked: [],
            blockedBy: [],
            work: [],
            placesLived: [],
            school: [],
            gender: '',
            quotes: '',
            about: '',
            relationship: '',
            bgImageVersion: '',
            bgImageId: '',
            profilePicture: `http://res.cloudinary.com/ratingapp/image/upload/${createdObjectId}`,
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            birthDay: { month: '', day: '' },
            notifications: {
                messages: true,
                reactions: true,
                comments: true,
                follows: true
            }
        } as unknown) as IUserDocument;
    }

    private async loadJimpImage(username: string, avatarColor: string): Promise<Jimp> {
        const image: Jimp = new Jimp(256, 256, avatarColor);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
        image.print(
            font,
            65,
            70,
            {
                text: username.charAt(0),
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
            },
            image.bitmap.width / 2,
            image.bitmap.height / 2
        );
        return image;
    }
}
