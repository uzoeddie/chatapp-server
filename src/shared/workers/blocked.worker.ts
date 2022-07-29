import { config } from '@root/config';
import { blockUserService } from '@service/db/block-user.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('blockedUserWorker');

class BlockedUserWorker {
  async addBlockedUserToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo, type } = jobQueue.data;
      if (type === 'block') {
        await blockUserService.blockUser(keyOne, keyTwo);
      } else {
        await blockUserService.unblockUser(keyOne, keyTwo);
      }
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const blockedUserWorker: BlockedUserWorker = new BlockedUserWorker();
