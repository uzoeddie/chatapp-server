import { IFollowerJobData } from '@follower/interface/follower.interface';
import { BaseQueue } from '@service/queues/base.queue';
import { followerWorker } from '@worker/follower.worker';

class FollowerQueue extends BaseQueue {
  constructor() {
    super('followers');
    this.processJob('addFollowerDB', 5, followerWorker.addFollowerToDB);
    this.processJob('removeFollowerFromDB', 5, followerWorker.removeFollowerFromDB);
  }

  public addFollowerJob(name: string, data: IFollowerJobData): void {
    this.addJob(name, data);
  }
}

export const followerQueue: FollowerQueue = new FollowerQueue();
