import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import Jimp from 'jimp';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';
import { Helpers } from '@global/helpers/helpers';
import { ISignUpData, IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import { uploads } from '@global/helpers/cloudinary-upload';
import { config } from '@root/config';
import { UserCache } from '@service/redis/user.cache';
import { userQueue } from '@service/queues/user.queue';
import { BadRequestError } from '@global/helpers/error-handler';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { signupSchema } from '@user/schemes/auth/signup';
import { UploadApiResponse } from 'cloudinary';
// import { faker } from '@faker-js/faker';

const userCache = new UserCache();

export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password } = req.body;
    // const username = faker.name.middleName();
    // const email = faker.internet.email();
    // const password = 'qwerty';
    const query = {
      $or: [{ username: Helpers.firstLetterUppercase(username) }, { email: Helpers.lowerCase(email) }]
    };
    const checkIfUserExist: IUserDocument = (await UserModel.findOne(query).exec()) as IUserDocument;
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
      password
    });
    const image: Jimp = await SignUp.prototype.loadJimpImage(Helpers.firstLetterUppercase(username), data.avatarColor);
    const dataFile: string = await image.getBase64Async('image/png');
    const result: UploadApiResponse = (await uploads(dataFile, `${createdObjectId}`, true, true)) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError('Error occurred. Try again.');
    }
    data.profilePicture = `https://res.cloudinary.com/dyamr9ym3/image/upload/v${result.version}/${createdObjectId}`;
    await userCache.saveUserToCache(`${createdObjectId}`, uId, data);
    userQueue.addUserJob('addUserToDB', { value: data });
    const userJwt: string = SignUp.prototype.signToken(data);
    req.session = { jwt: userJwt };
    res.status(HTTP_STATUS.CREATED).json({ message: 'User created succesffuly', user: data, token: userJwt });
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
      username: Helpers.firstLetterUppercase(username),
      email,
      password,
      avatarColor: Helpers.avatarColor(),
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
