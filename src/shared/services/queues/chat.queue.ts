import { IChatJobData } from '@chat/interfaces/chat.interface';
import { BaseQueue } from '@service/queues/base.queue';
import { chatWorker } from '@worker/chat.worker';

class ChatQueue extends BaseQueue {
    constructor() {
        super('chats');
        this.processJob('addChatMessageToDB', 5, chatWorker.addChatMessageToDB);
        this.processJob('markMessagesAsReadInDB', 5, chatWorker.markMessagesAdReadInDB);
    }

    public addChatJob(name: string, data: IChatJobData): void {
        this.addJob(name, data);
    }
}

export const chatQueue: ChatQueue = new ChatQueue();
