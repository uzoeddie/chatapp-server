import { commentService } from '@service/db/comment.service';
import { DoneCallback, Job } from 'bull';

class CommentWorker {
    async addCommentToDB(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { data } = job;
            await commentService.addCommentToDB(data);
            job.progress(100);
            done(null, data);
        } catch (error) {
            done(error);
        }
    }
}

export const commentWorker: CommentWorker = new CommentWorker();
