import { mailTransport } from '@service/emails/mail-transport';
import { Job, DoneCallback } from 'bull';

class EmailWorker {
    async addNotificationMail(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { template, receiverEmail, subject } = job.data;
            await mailTransport.sendEmail(receiverEmail, subject, template);
            job.progress(100);
            done(null, job.data);
        } catch (error) {
            done(error);
        }
    }
}

export const emailWorker: EmailWorker = new EmailWorker();
