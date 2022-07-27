import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { omit } from 'lodash';
import HTTP_STATUS from 'http-status-codes';
import { Helpers } from '@global/helpers/helpers';
import { IUserDocument } from '@user/interfaces/user.interface';
import { uploads } from '@global/helpers/cloudinary-upload';
import { config } from '@root/config';
import { UserCache } from '@service/redis/user.cache';
import { userQueue } from '@service/queues/user.queue';
import { BadRequestError } from '@global/helpers/error-handler';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { UploadApiResponse } from 'cloudinary';
import { signupSchema } from '@auth/schemes/signup';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { authQueue } from '@service/queues/auth.queue';

const userCache = new UserCache();

export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    const checkIfUserExist: IAuthDocument = (await authService.getUserByUsernameOrEmail(username, email)) as IAuthDocument;
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid credentials');
    }

    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    });
    // const result: UploadApiResponse = (await uploads(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse;
    // if (!result?.public_id) {
    //   throw new BadRequestError('Error occurred. Try again.');
    // }
    // Add to redis cache
    const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);
    // userDataForCache.profilePicture = `https://res.cloudinary.com/dyamr9ym3/image/upload/v${result.version}/${userObjectId}`;
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

    // Add to database
    // userData.profilePicture = `https://res.cloudinary.com/dyamr9ym3/image/upload/v${result.version}/${userObjectId}`;
    omit(userDataForCache, ['uId', 'username', 'email', 'avatarColor', 'password']);
    authQueue.addUserJob('addAuthUserToDB', { value: authData });
    userQueue.addUserJob('addUserToDB', { value: userDataForCache });

    const userJwt: string = SignUp.prototype.signToken(authData, userObjectId);
    req.session = { jwt: userJwt };
    res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', user: userDataForCache, token: userJwt });
  }

  private signToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor
      },
      config.JWT_TOKEN!
    );
  }

  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email,
      password,
      avatarColor,
      createdAt: new Date(),
    } as unknown as IAuthDocument;
  }

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email,
      password,
      avatarColor,
      profilePicture: '',
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
