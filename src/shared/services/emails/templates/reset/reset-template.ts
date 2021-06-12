import fs from 'fs';
import ejs from 'ejs';
import { IResetPasswordParams } from '@user/interfaces/user.interface';

class ResetPasswordConfirmationTemplate {
    public passwordResetConfirmationTemplate(templateParams: IResetPasswordParams): string {
        const { username, email, ipaddress, date } = templateParams;
        return ejs.render(fs.readFileSync(__dirname + '/reset-confirmation.ejs', 'utf8'), {
            username,
            email,
            ipaddress,
            date,
            image_url:
                'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
        });
    }
}

export const resetPasswordTemplate: ResetPasswordConfirmationTemplate = new ResetPasswordConfirmationTemplate();
