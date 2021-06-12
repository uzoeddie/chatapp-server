import mongoose, { Query } from 'mongoose';
import { BulkWriteOpResultObject, ObjectId, ObjectID } from 'mongodb';
import { UserModel } from '@user/models/user.schema';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IFollowerDocument } from '@follower/interface/follower.interface';
import { FollowerModel } from '@follower/models/follower.schema';
import { INotificationDocument, INotificationTemplate } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import { notificationTemplate } from '@service/emails/templates/notifications/notification-template';
import { emailQueue } from '@service/queues/email.queue';
import { IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface';
import { socketIONotificationObject } from '@socket/notification';

class Follower {
    public async addFollowerToDB(userId: string, followerId: string, username: string, followerDocumentId: ObjectID): Promise<void> {
        const followeeObjectId: ObjectId = mongoose.Types.ObjectId(followerId);
        const userObjectId: ObjectId = mongoose.Types.ObjectId(userId);

        const following: Promise<IFollowerDocument> = FollowerModel.create({
            _id: followerDocumentId,
            followeeId: followeeObjectId,
            followerId: userObjectId
        });
        const users: Promise<BulkWriteOpResultObject> = UserModel.bulkWrite([
            {
                updateOne: {
                    filter: { _id: userId },
                    update: { $inc: { followingCount: 1 } }
                }
            },
            {
                updateOne: {
                    filter: { _id: followerId },
                    update: { $inc: { followersCount: 1 } }
                }
            }
        ]);
        const response: [IFollowerDocument, BulkWriteOpResultObject, IUserDocument | null] = await Promise.all([
            following,
            users,
            UserModel.findOne({ _id: followerId })
        ]);

        if (userId !== followerId) {
            const notificationModel: INotificationDocument = new NotificationModel();
            const notifications = await notificationModel.insertNotification({
                userFrom: userId,
                userTo: followerId,
                message: `${username} is now following you.`,
                notificationType: 'follows',
                entityId: userId,
                createdItemId: response[0]._id
            });
            socketIONotificationObject.emit('insert notification', notifications, { userTo: followerId });
        }

        if (response[2]?.notifications.follows && userId !== followerId) {
            const templateParams: INotificationTemplate = {
                username: response[2].username,
                message: `${username} is now following you.`,
                header: 'Follower Notification'
            };
            const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
            emailQueue.addEmailJob('commentsMail', {
                receiverEmail: response[2].email,
                template,
                subject: `${username} is now following you.`
            });
        }
    }

    public async removeFollowerFromDB(userId: string, followerId: string): Promise<void> {
        const followeeObjectId: ObjectId = mongoose.Types.ObjectId(followerId);
        const userObjectId: ObjectId = mongoose.Types.ObjectId(userId);

        const unfollow: Query<IQueryComplete & IQueryDeleted, IFollowerDocument> = FollowerModel.deleteOne({
            followerId: userObjectId,
            followeeId: followeeObjectId
        });
        const users: Promise<BulkWriteOpResultObject> = UserModel.bulkWrite([
            {
                updateOne: {
                    filter: { _id: userId },
                    update: { $inc: { followingCount: -1 } }
                }
            },
            {
                updateOne: {
                    filter: { _id: followerId },
                    update: { $inc: { followersCount: -1 } }
                }
            }
        ]);
        await Promise.all([unfollow, users]);
    }
}

export const followerService: Follower = new Follower();
