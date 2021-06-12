import { DoneCallback, Job } from 'bull';
import { imageService } from '@service/db/image.service';

class ImageWorker {
    async updateImageInDB(jobQueue: Job, done: DoneCallback): Promise<void> {
        try {
            const { key, value } = jobQueue.data;
            await imageService.addImageToDB(key, value);
            jobQueue.progress(100);
            done(null, jobQueue.data);
        } catch (error) {
            done(error);
        }
    }

    async updateBGImageInDB(jobQueue: Job, done: DoneCallback): Promise<void> {
        try {
            const { key, imgId, imgVersion } = jobQueue.data;
            await imageService.addBackgroundImageToDB(key, imgId, imgVersion);
            jobQueue.progress(100);
            done(null, jobQueue.data);
        } catch (error) {
            done(error);
        }
    }

    async removeImageFromDB(jobQueue: Job, done: DoneCallback): Promise<void> {
        try {
            const { userId, imageId } = jobQueue.data;
            await imageService.removeImageFromDB(userId, imageId);
            jobQueue.progress(100);
            done(null, jobQueue.data);
        } catch (error) {
            done(error);
        }
    }
}

export const imageWorker: ImageWorker = new ImageWorker();
