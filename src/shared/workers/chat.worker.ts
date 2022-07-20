import { chatService } from '@service/db/chat.service';
import { DoneCallback, Job } from 'bull';

class ChatWorker {
  async addChatMessageToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      await chatService.addMessageToDB(jobQueue.data);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error as Error);
    }
  }

  async markMessagesAdReadInDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { receiverId, senderId } = jobQueue.data;
      await chatService.markMessagesAsRead(senderId, receiverId);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error as Error);
    }
  }

  async addMessageReactionToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { messageId, senderName, reaction, type } = jobQueue.data;
      await chatService.addMessageReaction(messageId, senderName, reaction, type);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      done(error as Error);
    }
  }
}

export const chatWorker: ChatWorker = new ChatWorker();
