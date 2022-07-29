import { DoneCallback, Job } from 'bull';
import { followerService } from '@service/db/follower.service';
import Logger from 'bunyan';
import { config } from '@root/config';

const log: Logger = config.createLogger('followerWorker');

class FollowerWorker {
  async addFollowerToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo, username, followerDocumentId } = jobQueue.data;
      await followerService.addFollowerToDB(keyOne, keyTwo, username, followerDocumentId);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async removeFollowerFromDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = jobQueue.data;
      await followerService.removeFollowerFromDB(keyOne, keyTwo);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const followerWorker: FollowerWorker = new FollowerWorker();
