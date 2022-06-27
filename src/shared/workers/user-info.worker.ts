import { DoneCallback, Job } from 'bull';
import { userInfoService } from '@service/db/user-info.service';

class UserInfoWorker {
  async updateUserInfo(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await userInfoService.updateUserInfo(key, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async updateSocialLinks(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await userInfoService.updateSocialLinks(key, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }
}

export const userInfoWorker: UserInfoWorker = new UserInfoWorker();
