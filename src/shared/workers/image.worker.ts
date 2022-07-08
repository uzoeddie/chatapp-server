import { DoneCallback, Job } from 'bull';
import { imageService } from '@service/db/image.service';

class ImageWorker {
  async addUserProfileImageToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value, imgId, imgVersion } = jobQueue.data;
      await imageService.addUserProfileImageToDB(key, value, imgId, imgVersion);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error as Error);
    }
  }

  async updateBGImageInDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, imgId, imgVersion } = jobQueue.data;
      await imageService.addBackgroundImageToDB(key, imgId, imgVersion);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error as Error);
    }
  }

  async addImageToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, imgId, imgVersion } = jobQueue.data;
      await imageService.addImage(key, imgId, imgVersion, '');
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error as Error);
    }
  }

  async removeImageFromDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { imageId } = jobQueue.data;
      await imageService.removeImageFromDB(imageId);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error as Error);
    }
  }
}

export const imageWorker: ImageWorker = new ImageWorker();
