import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import moment from 'moment';
import publicIP from 'public-ip';
import { IResetPasswordParams, IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import { BadRequestError } from '@global/helpers/error-handler';
import { resetPasswordTemplate } from '@service/emails/templates/reset/reset-template';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { emailQueue } from '@service/queues/email.queue';
import { changePasswordSchema } from '@user/schemes/user/info';

export class ChangePassword {
  @joiValidation(changePasswordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      throw new BadRequestError('Passwords do not match.');
    }
    const existingUser: IUserDocument = (await UserModel.findOne({
      username: req.currentUser?.username
    }).exec()) as IUserDocument;
    const passwordsMatch: boolean = await existingUser.comparePassword(currentPassword);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }
    const hashedPassword: string = await existingUser.hashPassword(newPassword);
    await UserModel.updateOne({ _id: req.currentUser?.userId }, { $set: { password: hashedPassword } }).exec();

    const templateParams: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: publicIP.v4(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };

    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('changePassword', {
      template,
      receiverEmail: existingUser.email,
      subject: 'Password Update Confirmation'
    });
    res.status(HTTP_STATUS.OK).json({
      message: 'Password updated successfully. You will be redirected shortly to the login page'
    });
  }
}
