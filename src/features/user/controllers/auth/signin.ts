import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import { Helpers } from '@global/helpers/helpers';
import { BadRequestError } from '@global/helpers/error-handler';
import { config } from '@root/config';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { loginSchema } from '@user/schemes/auth/signin';

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existingUser: IUserDocument = (await UserModel.findOne({
      username: Helpers.firstLetterUppercase(username)
    }).exec()) as IUserDocument;
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch: boolean = await existingUser.comparePassword(password);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const userJwt: string = JWT.sign(
      {
        userId: existingUser._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN!
    );
    req.session = { jwt: userJwt };
    res.status(HTTP_STATUS.CREATED).json({
      message: 'User login successfully',
      user: existingUser,
      token: userJwt,
      notification: false
    });
  }
}
