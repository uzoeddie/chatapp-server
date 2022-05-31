import Queue, { Job } from 'bull';
import Logger from 'bunyan';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { config } from '@root/config';
import { IEmailJob, IUserJob, IUserJobInfo } from '@user/interfaces/user.interface';
import { IPostJobData } from '@post/interfaces/post.interface';
import { ICommentJob } from '@comment/interfaces/comment.interface';
import { IReactionJob } from '@reaction/interfaces/reaction.interface';
import { IChatJobData } from '@chat/interfaces/chat.interface';
import { IFileImageJobData } from '@image/interface/image.interface';
import { IBlockedUserJobData } from '@follower/interface/follower.interface';

type IBaseJobData =
    | IUserJob
    | IPostJobData
    | IEmailJob
    | ICommentJob
    | IReactionJob
    | IChatJobData
    | IFileImageJobData
    | IBlockedUserJobData
    | IUserJobInfo;
let bullAdaptars: BullAdapter[] = [];
export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
    queue: Queue.Queue;
    log: Logger;

    constructor(queueName: string) {
        this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
        bullAdaptars.push(new BullAdapter(this.queue));
        bullAdaptars = [...new Set(bullAdaptars)];
        serverAdapter = new ExpressAdapter();
        serverAdapter.setBasePath('/queues');

        createBullBoard({
            queues: bullAdaptars,
            serverAdapter,
        });
        this.log = config.createLogger(`${queueName}Queue`);

        this.queue.on('completed', (job: Job) => {
            job.remove();
        });

        this.queue.on('global:completed', (jobId: string) => {
            this.log.info(`Job ${jobId} completed`);
        });

        this.queue.on('global:stalled', (jobId: string) => {
            this.log.info(`Job ${jobId} is stalled`);
        });
    }

    protected addJob(name: string, data: IBaseJobData): void {
        this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
    }

    protected processJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
        this.queue.process(name, concurrency, callback);
    }
}
