import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import moment from 'moment';
import publicIP from 'ip';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { BadRequestError } from '@global/helpers/error-handler';
import { resetPasswordTemplate } from '@service/emails/templates/reset/reset-template';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { emailQueue } from '@service/queues/email.queue';
import { userService } from '@service/db/user.service';
import { changePasswordSchema } from '@user/schemes/info';
import { authService } from '@service/db/auth.service';
import { IAuthDocument } from '@auth/interfaces/auth.interface';

export class ChangePassword {
  @joiValidation(changePasswordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      throw new BadRequestError('Passwords do not match.');
    }
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(req.currentUser!.username);
    const passwordsMatch: boolean = await existingUser.comparePassword(currentPassword);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }
    const hashedPassword: string = await existingUser.hashPassword(newPassword);
    userService.updatePassword(`${req.currentUser?.userId}`, hashedPassword);

    const templateParams: IResetPasswordParams = {
      username: existingUser.username!,
      email: existingUser.email!,
      ipaddress: publicIP.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };

    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('changePassword', {
      template,
      receiverEmail: existingUser.email!,
      subject: 'Password Update Confirmation'
    });
    res.status(HTTP_STATUS.OK).json({
      message: 'Password updated successfully. You will be redirected shortly to the login page'
    });
  }
}
