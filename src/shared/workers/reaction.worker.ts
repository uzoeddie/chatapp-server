import { reactionService } from '@service/db/reaction.service';
import { DoneCallback, Job } from 'bull';

class ReactionWorker {
    async addReactionToDB(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { data } = job;
            await reactionService.addReactionDataToDB(data);
            job.progress(100);
            done(null, data);
        } catch (error) {
            done(error);
        }
    }

    async removeReactionFromDB(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { data } = job;
            await reactionService.removeReactionDataFromDB(data);
            job.progress(100);
            done(null, data);
        } catch (error) {
            done(error);
        }
    }
}

export const reactionWorker: ReactionWorker = new ReactionWorker();
