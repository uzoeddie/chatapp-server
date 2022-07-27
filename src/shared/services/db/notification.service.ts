import { INotificationDocument } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import mongoose from 'mongoose';

class Notification {
  public async updateNotification(notificationId: string): Promise<void> {
    await NotificationModel.updateOne({ _id: notificationId }, { $set: { read: true } }).exec();
  }

  public async deleteNotification(notificationId: string): Promise<void> {
    await NotificationModel.deleteOne({ _id: notificationId }).exec();
  }

  public async getNotifications(userId: string): Promise<INotificationDocument[]> {
    const notifications = await NotificationModel.aggregate([
      { $match: { userTo: new mongoose.Types.ObjectId(userId) } },
      { $lookup: { from: 'User', localField: 'userFrom', foreignField: '_id', as: 'userFrom' } },
      { $unwind : '$userFrom'},
      { $lookup: { from: 'Auth', localField: 'userFrom.authId', foreignField: '_id', as: 'userFrom.authId' } },
      {
        $project: {
          _id: 1,
          message: 1,
          comment: 1,
          createdAt: 1,
          createdItemId: 1,
          entityId: 1,
          gifUrl: 1,
          imgId: 1,
          imgVersion: 1,
          notificationType: 1,
          post: 1,
          reaction: 1,
          read: 1,
          userTo: 1,
          userFrom: {
            profilePicture: '$userFrom.profilePicture',
            username: { $first: '$userFrom.authId.username' },
            avatarColor: { $first: '$userFrom.authId.avatarColor' },
            uId: { $first: '$userFrom.authId.uId' },
          }
        }
      }
    ]);
    return notifications;
  }
}

export const notificationService: Notification = new Notification();
