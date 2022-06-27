import mongoose, { Query } from 'mongoose';
import { BulkWriteOpResultObject, ObjectId, ObjectID } from 'mongodb';
import _ from 'lodash';
import { UserModel } from '@user/models/user.schema';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IFollower, IFollowerDocument } from '@follower/interface/follower.interface';
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

    if (response[2]?.notifications.follows && userId !== followerId) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userFrom: userId,
        userTo: followerId,
        message: `${username} is now following you.`,
        notificationType: 'follows',
        entityId: userId,
        createdItemId: response[0]._id,
        createdAt: new Date(),
        comment: '',
        reaction: '',
        post: '',
        imgId: '',
        imgVersion: '',
        gifUrl: ''
      });
      socketIONotificationObject.emit('insert notification', notifications, { userTo: followerId });
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

  public async removeFollowerFromDB(followeeId: string, followerId: string): Promise<void> {
    const followeeObjectId: ObjectId = mongoose.Types.ObjectId(followeeId);
    const userObjectId: ObjectId = mongoose.Types.ObjectId(followerId);

    const unfollow: Query<IQueryComplete & IQueryDeleted, IFollowerDocument> = FollowerModel.deleteOne({
      followerId: userObjectId,
      followeeId: followeeObjectId
    });
    const users: Promise<BulkWriteOpResultObject> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: followerId },
          update: { $inc: { followingCount: -1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: -1 } }
        }
      }
    ]);
    await Promise.all([unfollow, users]);
  }

  public async getFolloweeData(userObjectId: ObjectId): Promise<IFollower[]> {
    const followee = await FollowerModel.aggregate([
      { $match: { followerId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followeeId', foreignField: '_id', as: 'followeeId' } },
      {
        $addFields: {
          _id: { $first: '$followeeId._id' },
          username: { $first: '$followeeId.username' },
          avatarColor: { $first: '$followeeId.avatarColor' },
          postsCount: { $first: '$followeeId.postsCount' },
          followersCount: { $first: '$followeeId.followersCount' },
          followingCount: { $first: '$followeeId.followingCount' },
          profilePicture: { $first: '$followeeId.profilePicture' },
          uId: { $first: '$followeeId.uId' }
        }
      },
      {
        $project: {
          followeeId: 0,
          followerId: 0,
          createdAt: 0,
          __v: 0
        }
      }
    ]);
    return followee;
  }

  public async getFollowerData(userObjectId: ObjectId): Promise<IFollower[]> {
    const follower = await FollowerModel.aggregate([
      { $match: { followeeId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followerId' } },
      {
        $addFields: {
          _id: { $first: '$followerId._id' },
          username: { $first: '$followerId.username' },
          avatarColor: { $first: '$followerId.avatarColor' },
          postsCount: { $first: '$followerId.postsCount' },
          followersCount: { $first: '$followerId.followersCount' },
          followingCount: { $first: '$followerId.followingCount' },
          profilePicture: { $first: '$followerId.profilePicture' },
          uId: { $first: '$followeeId.uId' }
        }
      },
      {
        $project: {
          followeeId: 0,
          followerId: 0,
          createdAt: 0,
          __v: 0
        }
      }
    ]);
    return follower;
  }

  public async getFollowers(userId: string): Promise<IFollowerDocument[]> {
    const followers = await FollowerModel.find({ followerId: userId })
      .populate({
        path: 'followerId',
        select: 'username avatarColor postsCount followersCount followingCount profilePicture'
      })
      .populate({
        path: 'followeeId',
        select: 'username avatarColor postsCount followersCount followingCount profilePicture'
      })
      .sort({ createdAt: -1 })
      .exec();

    return followers;
  }

  public async getFolloweeIds(userId: string): Promise<string[]> {
    const followee = await FollowerModel.aggregate([
      { $match: { followerId: mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          followeeId: 1,
          _id: 0
        }
      }
    ]);
    return _.map(followee, (res) => res.followeeId.toString());
  }
}

export const followerService: Follower = new Follower();
