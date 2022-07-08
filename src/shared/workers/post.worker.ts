import { postService } from '@service/db/post.service';
import { Job, DoneCallback } from 'bull';

class PostWorker {
  async savePostWorker(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await postService.addPostToDB(key, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      done(error as Error);
    }
  }

  async updatePostWorker(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await postService.editPost(key, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      done(error as Error);
    }
  }

  async deletePostWorker(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = job.data;
      await postService.deletePost(keyOne, keyTwo);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      done(error as Error);
    }
  }
}

export const postWorker: PostWorker = new PostWorker();
