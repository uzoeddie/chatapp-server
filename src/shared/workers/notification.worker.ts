import { DoneCallback, Job } from 'bull';
import { notificationService } from '@service/db/notification.service';
import Logger from 'bunyan';
import { config } from '@root/config';

const log: Logger = config.createLogger('notificationWorker');

class NotificationWorker {
  async updateNotification(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key } = jobQueue.data;
      await notificationService.updateNotification(key);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async deleteNotification(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key } = jobQueue.data;
      await notificationService.deleteNotification(key);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const notificationWorker: NotificationWorker = new NotificationWorker();
