import { userService } from '@service/db/user.service';
import { DoneCallback, Job } from 'bull';

class UserWorker {
  async addUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      await userService.addUserDataToDB(value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      done(error);
    }
  }

  async updateNotificationSettings(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await userService.updateNotificationSettings(key, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      done(error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
