import { IFileImageJobData } from '@image/interface/image.interface';
import { BaseQueue } from '@service/queues/base.queue';
import { imageWorker } from '@worker/image.worker';

class ImageQueue extends BaseQueue {
    constructor() {
        super('images');
        this.processJob('updateImageInDB', 5, imageWorker.updateImageInDB);
        this.processJob('updateBGImageInDB', 5, imageWorker.updateBGImageInDB);
        this.processJob('removeImageFromDB', 5, imageWorker.removeImageFromDB);
    }

    public addImageJob(name: string, data: IFileImageJobData): void {
        this.addJob(name, data);
    }
}

export const imageQueue: ImageQueue = new ImageQueue();
