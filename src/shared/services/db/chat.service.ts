import { ObjectID } from 'mongodb';
import { IMessageDocument } from '@chat/interfaces/chat.interface';
import { IConversationDocument } from '@chat/interfaces/conversation.interface';
import { MessageModel } from '@chat/models/chat.schema';
import { ConversationModel } from '@chat/models/conversation.schema';
import { IQuerySort } from '@comment/interfaces/comment.interface';

class Chat {
  public async addMessageToDB(data: IMessageDocument): Promise<void> {
    const conversation: IConversationDocument[] = await ConversationModel.find({ _id: data?.conversationId }).exec();

    if (conversation.length === 0) {
      await ConversationModel.create({
        _id: data?.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId
      });
    }

    await MessageModel.create({
      _id: data._id,
      conversationId: data.conversationId,
      receiverId: data.receiverId,
      receiverUsername: data.receiverUsername,
      receiverAvatarColor: data.receiverAvatarColor,
      receiverProfilePicture: data.receiverProfilePicture,
      senderUsername: data.senderUsername,
      senderId: data.senderId,
      senderAvatarColor: data.senderAvatarColor,
      senderProfilePicture: data.senderProfilePicture,
      body: data.body,
      isRead: data.isRead,
      gifUrl: data.gifUrl,
      selectedImage: data.selectedImage,
      reaction: data.reaction,
      createdAt: data.createdAt
    });
  }

  public async getMessages(senderId: ObjectID, receiverId: ObjectID, sort?: IQuerySort): Promise<any[]> {
    const query = {
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    };
    const messages = await MessageModel.aggregate([{ $match: query }, { $sort: sort }]);
    return messages;
  }

  public async getUserConversationList(senderId: ObjectID): Promise<any[]> {
    const messages = await MessageModel.aggregate([
      { $match: { $or: [{ senderId }, { receiverId: senderId }] } },
      {
        $group: {
          _id: '$conversationId',
          result: { $last: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: '$result._id',
          conversationId: '$result.conversationId',
          receiverId: '$result.receiverId',
          receiverUsername: '$result.receiverUsername',
          receiverAvatarColor: '$result.receiverAvatarColor',
          receiverProfilePicture: '$result.receiverProfilePicture',
          senderUsername: '$result.senderUsername',
          senderId: '$result.senderId',
          senderAvatarColor: '$result.senderAvatarColor',
          senderProfilePicture: '$result.senderProfilePicture',
          body: '$result.body',
          isRead: '$result.isRead',
          gifUrl: '$result.gifUrl',
          selectedImage: '$result.selectedImage',
          reaction: '$result.reaction',
          createdAt: '$result.createdAt'
        }
      },
      { $sort: { createdAt: 1 } }
    ]);

    return messages;
  }

  public async markMessagesAsRead(senderId: ObjectID, receiverId: ObjectID): Promise<void> {
    const query = {
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    };
    await MessageModel.updateMany(query, { $set: { isRead: true } }).exec();
  }

  public async addMessageReaction(messageId: ObjectID, senderName: string, reaction: string, type: string): Promise<void> {
    if (type === 'add') {
      await MessageModel.updateOne({ _id: messageId }, { $push: { reaction: { senderName, type: reaction } } }).exec();
    } else {
      await MessageModel.updateOne({ _id: messageId }, { $pull: { reaction: { senderName } } }).exec();
    }
  }
}

export const chatService: Chat = new Chat();
