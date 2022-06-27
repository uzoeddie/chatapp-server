import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectID } from 'mongodb';
import mongoose from 'mongoose';
import { addChatSchema } from '@chat/schemes/chat';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { chatQueue } from '@service/queues/chat.queue';
import { MessageCache } from '@service/redis/message.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserCache } from '@service/redis/user.cache';
import { notificationTemplate } from '@service/emails/templates/notifications/notification-template';
import { emailQueue } from '@service/queues/email.queue';
import { INotificationTemplate } from '@notification/interfaces/notification.interface';
import { socketIOChatObject } from '@socket/chat';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { IMessageData, IMessageNotification } from '@chat/interfaces/chat.interface';

const userCache = new UserCache();
const messageCache: MessageCache = new MessageCache();

export class Add {
  @joiValidation(addChatSchema)
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
    let fileUrl = '';
    const messageObjectId: ObjectID = new ObjectID();

    const conversationObjectId: ObjectID = !conversationId ? new ObjectID() : mongoose.Types.ObjectId(conversationId);
    const sender = await userCache.getUserFromCache(`${req.currentUser?.userId}`);

    if (selectedImage.length) {
      const result: UploadApiResponse = (await uploads(selectedImage)) as UploadApiResponse;
      if (!result?.public_id) {
        throw new BadRequestError(result.message);
      }
      fileUrl = `https://res.cloudinary.com/dyamr9ym3/image/upload/v${result?.version}/${result?.public_id}`;
    }

    const messageData: IMessageData = {
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
      selectedImage: fileUrl,
      reaction: [],
      createdAt: new Date()
    };
    Add.prototype.emitSocketIOEvent(messageData);

    if (!isRead) {
      Add.prototype.messageNotification({
        currentUser: req.currentUser!,
        message: body,
        receiverName: receiverUsername,
        receiverId,
        messageData
      });
    }
    await messageCache.addChatListToCache(`${req.currentUser?.userId}`, `${receiverId}`, `${conversationObjectId}`);
    await messageCache.addChatListToCache(`${receiverId}`, `${req.currentUser?.userId}`, `${conversationObjectId}`);
    await messageCache.addChatMessageToCache(`${conversationObjectId}`, messageData);
    chatQueue.addChatJob('addChatMessageToDB', messageData);

    res.status(HTTP_STATUS.OK).json({ message: 'Message added', conversationId: conversationObjectId });
  }

  public async addChatUsers(req: Request, res: Response): Promise<void> {
    const chatUsers = await messageCache.addChatUsersToCache(req.body);
    socketIOChatObject.emit('add chat users', chatUsers);
    res.status(HTTP_STATUS.OK).json({ message: 'Users added' });
  }

  public async removeChatUsers(req: Request, res: Response): Promise<void> {
    const chatUsers = await messageCache.removeChatUsersFromCache(req.body);
    socketIOChatObject.emit('add chat users', chatUsers);
    res.status(HTTP_STATUS.OK).json({ message: 'Users removed' });
  }

  private emitSocketIOEvent(data: IMessageData): void {
    socketIOChatObject.emit('message received', data);
    socketIOChatObject.emit('chat list', data);
  }

  private async messageNotification({ currentUser, message, receiverName, receiverId }: IMessageNotification): Promise<void> {
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
