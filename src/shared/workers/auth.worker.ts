import { DoneCallback, Job } from 'bull';
import { authService } from '@service/db/auth.service';

class AuthWorker {
  async addAuthUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      await authService.addAuthUserDataToDB(value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      done(error as Error);
    }
  }
}

export const authWorker: AuthWorker = new AuthWorker();
