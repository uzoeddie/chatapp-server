import mongoose from 'mongoose';
import { ICommentJob, ICommentDocument, ICommentNameList, IQueryComment } from '@comment/interfaces/comment.interface';
import { CommentsModel } from '@comment/models/comment.schema';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Aggregate, Query } from 'mongoose';
import { INotificationDocument, INotificationTemplate } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import { emailQueue } from '@service/queues/email.queue';
import { notificationTemplate } from '@service/emails/templates/notifications/notification-template';
import { socketIONotificationObject } from '@socket/notification';

const userCache = new UserCache();

class Comment {
  public async addCommentToDB(commentData: ICommentJob): Promise<void> {
    const { postId, userTo, userFrom, comment, username } = commentData;
    const comments: Promise<ICommentDocument> = CommentsModel.create(comment);
    const post: Query<IPostDocument, IPostDocument> = PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { commentsCount: 1 } },
      { new: true }
    ) as Query<IPostDocument, IPostDocument>;
    const user: Promise<IUserDocument> = userCache.getUserFromCache(userTo) as Promise<IUserDocument>;
    const response: [ICommentDocument, IPostDocument, IUserDocument] = await Promise.all([comments, post, user]);

    if (response[2].notifications.comments && userFrom !== userTo) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userFrom,
        userTo,
        message: `${username} commented on your post.`,
        notificationType: 'comment',
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(response[0]._id!),
        createdAt: new Date(),
        comment: comment.comment,
        post: response[1].post,
        imgId: response[1].imgId!,
        imgVersion: response[1].imgVersion!,
        gifUrl: response[1].gifUrl!,
        reaction: ''
      });
      socketIONotificationObject.emit('insert notification', notifications, { userTo });
      const templateParams: INotificationTemplate = {
        username: response[2].username,
        message: `${username} commented on your post.`,
        header: 'Comment Notification'
      };
      const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
      emailQueue.addEmailJob('commentsMail', { receiverEmail: response[2].email, template, subject: 'Post Notification' });
    }
  }

  public async getPostComments(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
    return new Promise((resolve) => {
      const comments: Aggregate<ICommentDocument[]> = CommentsModel.aggregate([{ $match: query }, { $sort: sort }]);
      resolve(comments);
    });
  }

  public async getPostCommentNames(query: IQueryComment, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<ICommentNameList[]> {
    return new Promise((resolve) => {
      const commentsNameList: Aggregate<ICommentNameList[]> = CommentsModel.aggregate([
        { $match: query },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        { $group: { _id: null, names: { $addToSet: '$username' }, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);
      resolve(commentsNameList);
    });
  }
}

export const commentService: Comment = new Comment();
