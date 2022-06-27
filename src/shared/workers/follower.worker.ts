import { DoneCallback, Job } from 'bull';
import { followerService } from '@service/db/follower.service';

class FollowerWorker {
  async addFollowerToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo, username, followerDocumentId } = jobQueue.data;
      await followerService.addFollowerToDB(keyOne, keyTwo, username, followerDocumentId);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }

  async removeFollowerFromDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = jobQueue.data;
      await followerService.removeFollowerFromDB(keyOne, keyTwo);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error);
    }
  }
}

export const followerWorker: FollowerWorker = new FollowerWorker();
