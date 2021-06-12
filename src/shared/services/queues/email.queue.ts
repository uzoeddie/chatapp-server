import { BaseQueue } from '@service/queues/base.queue';
import { IEmailJob } from '@user/interfaces/user.interface';
import { emailWorker } from '@worker/email.worker';

class EmailQueue extends BaseQueue {
    constructor() {
        super('emails');
        this.processJob('forgotPasswordMail', 5, emailWorker.addNotificationMail);
        this.processJob('changePassword', 5, emailWorker.addNotificationMail);
        this.processJob('commentsMail', 5, emailWorker.addNotificationMail);
        this.processJob('reactionsMail', 5, emailWorker.addNotificationMail);
        this.processJob('directMessageMail', 5, emailWorker.addNotificationMail);
        this.processJob('followersMail', 5, emailWorker.addNotificationMail);
    }

    public addEmailJob(name: string, data: IEmailJob): void {
        this.addJob(name, data);
    }
}

export const emailQueue: EmailQueue = new EmailQueue();
