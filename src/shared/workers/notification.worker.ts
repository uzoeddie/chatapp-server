import { DoneCallback, Job } from 'bull';
import { notificationService } from '@service/db/notification.service';

class NotificationWorker {
    async updateNotification(jobQueue: Job, done: DoneCallback): Promise<void> {
        try {
            const { key } = jobQueue.data;
            await notificationService.updateNotification(key);
            jobQueue.progress(100);
            done(null, jobQueue.data);
        } catch (error) {
            done(error);
        }
    }

    async deleteNotification(jobQueue: Job, done: DoneCallback): Promise<void> {
        try {
            const { key } = jobQueue.data;
            await notificationService.deleteNotification(key);
            jobQueue.progress(100);
            done(null, jobQueue.data);
        } catch (error) {
            done(error);
        }
    }
}

export const notificationWorker: NotificationWorker = new NotificationWorker();
