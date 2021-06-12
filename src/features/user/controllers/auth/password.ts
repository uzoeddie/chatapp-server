import { Request, Response } from 'express';
import crypto from 'crypto';
import HTTP_STATUS from 'http-status-codes';
import moment from 'moment';
import publicIP from 'public-ip';
import { IResetPasswordParams, IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import { Helpers } from '@global/helpers/helpers';
import { BadRequestError } from '@global/helpers/error-handler';
import { config } from '@root/config';
import { forgotPasswordTemplate } from '@service/emails/templates/forgot/forgot-template';
import { resetPasswordTemplate } from '@service/emails/templates/reset/reset-template';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { emailSchema, passwordSchema } from '@user/schemes/auth/password';
import { emailQueue } from '@service/queues/email.queue';

export class Password {
    @joiValidation(emailSchema)
    public async create(req: Request, res: Response): Promise<void> {
        const { email } = req.body;
        const existingUser: IUserDocument = (await UserModel.findOne({
            email: Helpers.lowerCase(email)
        }).exec()) as IUserDocument;
        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }

        const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
        const randomCharacters: string = randomBytes.toString('hex');
        existingUser.passwordResetToken = randomCharacters;
        existingUser.passwordResetExpires = Date.now() + 60 * 60 * 1000;
        await existingUser.save();

        const resetLink = `${config.CLIENT_URL}/auth/reset-password?token=${randomCharacters}`;
        const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username, resetLink);
        emailQueue.addEmailJob('forgotPasswordMail', { template, receiverEmail: email, subject: 'Reset your password' });
        res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent.', user: {}, token: '' });
    }

    @joiValidation(passwordSchema)
    public async update(req: Request, res: Response): Promise<void> {
        const { token } = req.params;
        const existingUser: IUserDocument = (await UserModel.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        }).exec()) as IUserDocument;
        if (!existingUser) {
            throw new BadRequestError('Reset token has expired.');
        }

        existingUser.password = req.body.password;
        existingUser.passwordResetToken = undefined;
        existingUser.passwordResetExpires = undefined;
        await existingUser.save();

        const templateParams: IResetPasswordParams = {
            username: existingUser.username,
            email: existingUser.email,
            ipaddress: publicIP.v4(),
            date: moment().format('DD/MM/YYYY HH:mm')
        };

        const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
        emailQueue.addEmailJob('forgotPasswordMail', {
            template,
            receiverEmail: existingUser.email,
            subject: 'Password Reset Confirmation'
        });
        res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated.', user: {}, token: '', notification: false });
    }
}
