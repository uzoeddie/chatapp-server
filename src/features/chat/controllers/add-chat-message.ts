import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectID } from 'mongodb';
import mongoose from 'mongoose';
import { unflatten } from 'flat';
import { IChatConversationId, IChatMessage, IChatRedisData, IMessageDocument } from '@chat/interfaces/chat.interface';
import { addChatSchema } from '@chat/schemes/chat';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { chatQueue } from '@service/queues/chat.queue';
import { messageCache } from '@service/redis/message.cache';
import { AuthPayload, IUserDocument } from '@user/interfaces/user.interface';
import { UserCache } from '@service/redis/user.cache';
import { notificationTemplate } from '@service/emails/templates/notifications/notification-template';
import { emailQueue } from '@service/queues/email.queue';
import { INotificationTemplate } from '@notification/interfaces/notification.interface';
import { connectedUsersMap } from '@socket/user';
import { socketIOChatObject } from '@socket/chat';

const userCache = new UserCache();

export class Add {
  // @joiValidation(addChatSchema)
  public async message(req: Request, res: Response): Promise<void> {
    const {
      conversationId,
      receiverId,
      receiverUsername,
      receiverAvatarColor,
      receiverProfilePicture,
      body,
      gifUrl,
      isRead,
      selectedImage
    } = req.body;
    // const createdAt: Date = new Date();
    const messageObjectId: ObjectID = new ObjectID();

    const conversationObjectId: ObjectID = !conversationId ? new ObjectID() : mongoose.Types.ObjectId(conversationId);
    // const data: IChatRedisData = Add.prototype.flattenRedisData(req, {
    //   _id: `${messageObjectId}`,
    //   conversationId: `${conversationObjectId}`,
    //   createdAt
    // });

    const sender = await userCache.getUserFromCache(`${req.currentUser?.userId}`);

    const messageData = {
      _id: `${messageObjectId}`,
      conversationId: conversationObjectId,
      receiverId,
      receiverUsername,
      receiverAvatarColor,
      receiverProfilePicture,
      senderUsername: `${req.currentUser?.username}`,
      senderId: `${req.currentUser?.userId}`,
      senderAvatarColor: `${req.currentUser?.avatarColor}`,
      senderProfilePicture: `${sender?.profilePicture}`,
      body,
      isRead,
      gifUrl,
      selectedImages: '',
      createdAt: new Date()
    };
    if (!selectedImage.length) {
      Add.prototype.chatMessage(messageData);
    }

    // await messageCache.addChatListToCache(`${req.currentUser?.userId}`, `${receiverId}`, `${conversationObjectId}`);
    // await messageCache.addChatListToCache(`${receiverId}`, `${req.currentUser?.userId}`, `${conversationObjectId}`);
    // await messageCache.addChatMessageToCache(`${conversationObjectId}`, messageData);

    // const message: IMessageDocument = {
    //   _id: messageObjectId,
    //   conversationId: conversationObjectId,
    //   senderId: mongoose.Types.ObjectId(req.currentUser?.userId),
    //   senderName: `${req.currentUser?.username}`,
    //   receiverId: mongoose.Types.ObjectId(receiverId._id),
    //   receiverName,
    //   body,
    //   gifUrl,
    //   isRead,
    //   images: selectedImages,
    //   createdAt
    // } as IMessageDocument;

    // chatQueue.addChatJob('addChatMessageToDB', { value: message });
    // Add.prototype.messageNotification(req.currentUser!, body, receiverName, receiverId._id);
    res.status(HTTP_STATUS.OK).json({ message: 'Message added', conversationId: conversationObjectId });
  }

  private flattenRedisData(req: Request, conversation: IChatConversationId): IChatRedisData {
    const { conversationId, _id, createdAt } = conversation;
    const { receiverId, receiverName, body, gifUrl, isRead, profilePicture, selectedImages } = req.body;
    return {
      _id,
      conversationId,
      'senderId._id': `${req.currentUser?.userId}`,
      'senderId.username': `${req.currentUser?.username}`,
      'senderId.avatarColor': `${req.currentUser?.avatarColor}`,
      'senderId.email': `${req.currentUser?.email}`,
      'senderId.profilePicture': profilePicture,
      'receiverId._id': receiverId._id,
      'receiverId.username': receiverId.username,
      'receiverId.avatarColor': receiverId.avatarColor,
      'receiverId.email': receiverId.email,
      'receiverId.profilePicture': receiverId.profilePicture,
      body,
      isRead,
      gifUrl,
      senderName: `${req.currentUser?.username}`,
      receiverName,
      createdAt,
      images: selectedImages
    };
  }

  private chatMessage(data: any): void {
    const senderSocketId: string = connectedUsersMap.get(data.senderId) as string;
    const receiverSocketId: string = connectedUsersMap.get(data.receiverId) as string;
    socketIOChatObject.to(senderSocketId).to(receiverSocketId).emit('message received', data);
    socketIOChatObject.to(senderSocketId).to(receiverSocketId).emit('chat list', data);
    // socketIOChatObject.emit('trigger message notification', unflattenedMessageData);
  }

  private async messageNotification(currentUser: AuthPayload, message: string, receiverName: string, receiverId: string): Promise<void> {
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(`${receiverId}`)) as IUserDocument;
    if (cachedUser.notifications.messages) {
      const templateParams: INotificationTemplate = {
        username: receiverName,
        message,
        header: `Message Notification from ${currentUser.username}`
      };
      const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
      emailQueue.addEmailJob('directMessageMail', {
        receiverEmail: currentUser.email,
        template,
        subject: `You've received messages from ${receiverName}`
      });
    }
  }
}
