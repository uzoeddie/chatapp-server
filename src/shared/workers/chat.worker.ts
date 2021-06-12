import { chatService } from '@service/db/chat.service';
import { DoneCallback, Job } from 'bull';

class ChatWorker {
    async addChatMessageToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
        try {
            const { value } = jobQueue.data;
            await chatService.addMessageToDB(value);
            jobQueue.progress(100);
            done(null, jobQueue.data);
        } catch (error) {
            done(error);
        }
    }

    async markMessagesAdReadInDB(jobQueue: Job, done: DoneCallback): Promise<void> {
        try {
            const { conversationId } = jobQueue.data;
            await chatService.markMessagesAsRead(conversationId);
            jobQueue.progress(100);
            done(null, jobQueue.data);
        } catch (error) {
            done(error);
        }
    }
}

export const chatWorker: ChatWorker = new ChatWorker();
