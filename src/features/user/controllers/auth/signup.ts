import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';
import { Helpers } from '@global/helpers/helpers';
import { ISignUpData, IUserDocument } from '@user/interfaces/user.interface';
import { uploads } from '@global/helpers/cloudinary-upload';
import { config } from '@root/config';
import { UserCache } from '@service/redis/user.cache';
import { userQueue } from '@service/queues/user.queue';
import { BadRequestError } from '@global/helpers/error-handler';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { signupSchema } from '@user/schemes/auth/signup';
import { UploadApiResponse } from 'cloudinary';
import { userService } from '@service/db/user.service';

const userCache = new UserCache();

export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    const checkIfUserExist: IUserDocument = (await userService.getUserByUsernameOrEmail(username, email)) as IUserDocument;
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid credentials');
    }

    const createdObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const data: IUserDocument = SignUp.prototype.signupData({
      createdObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    });
    const result: UploadApiResponse = (await uploads(avatarImage, `${createdObjectId}`, true, true)) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError('Error occurred. Try again.');
    }
    data.profilePicture = `https://res.cloudinary.com/dyamr9ym3/image/upload/v${result.version}/${createdObjectId}`;
    await userCache.saveUserToCache(`${createdObjectId}`, uId, data);
    userQueue.addUserJob('addUserToDB', { value: data });
    const userJwt: string = SignUp.prototype.signToken(data);
    req.session = { jwt: userJwt };
    res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', user: data, token: userJwt });
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
    const { createdObjectId, username, email, uId, password, avatarColor } = data;
    return {
      _id: createdObjectId,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email,
      password,
      avatarColor,
      createdAt: new Date(),
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument;
  }
}
