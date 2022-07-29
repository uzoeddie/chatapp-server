import { DoneCallback, Job } from 'bull';
import { userInfoService } from '@service/db/user-info.service';
import Logger from 'bunyan';
import { config } from '@root/config';

const log: Logger = config.createLogger('userInfoWorker');

class UserInfoWorker {
  async updateUserInfo(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await userInfoService.updateUserInfo(key, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async updateSocialLinks(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = jobQueue.data;
      await userInfoService.updateSocialLinks(key, value);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const userInfoWorker: UserInfoWorker = new UserInfoWorker();
