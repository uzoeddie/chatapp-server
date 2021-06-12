import { ICommentJob, ICommentDocument, ICommentNameList, IQueryComment, IQuerySort } from '@comment/interfaces/comment.interface';
import { CommentsModel } from '@comment/models/comment.schema';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { postCache } from '@service/redis/post.cache';
import { userCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Aggregate, UpdateQuery } from 'mongoose';
import { INotificationDocument, INotificationTemplate } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import { emailQueue } from '@service/queues/email.queue';
import { notificationTemplate } from '@service/emails/templates/notifications/notification-template';
import { socketIONotificationObject } from '@socket/notification';

class Comment {
    public async addCommentToDB(commentData: ICommentJob): Promise<void> {
        const { postId, userTo, userFrom, comment, username } = commentData;
        const comments: Promise<ICommentDocument> = CommentsModel.create(comment);
        const post: UpdateQuery<IPostDocument> = PostModel.findOneAndUpdate({ _id: postId }, { $inc: { commentsCount: 1 } }, { new: true });
        const user: Promise<IUserDocument> = userCache.getUserFromCache(userTo);
        const response: [ICommentDocument, UpdateQuery<IPostDocument>, IUserDocument] = await Promise.all([comments, post, user]);
        await postCache.updateSinglePostPropInCache(postId, 'commentsCount', `${(response[1] as IPostDocument).commentsCount}`);
        if (userFrom !== userTo) {
            const notificationModel: INotificationDocument = new NotificationModel();
            const notifications = await notificationModel.insertNotification({
                userFrom,
                userTo,
                message: `${username} commented on your post.`,
                notificationType: 'comment',
                entityId: postId,
                createdItemId: response[0]._id!
            });
            socketIONotificationObject.emit('insert notification', notifications, { userTo });
        }

        if (response[2].notifications.comments && userFrom !== userTo) {
            const templateParams: INotificationTemplate = {
                username: response[2].username,
                message: `${username} commented on your post.`,
                header: 'Comment Notification'
            };
            const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
            emailQueue.addEmailJob('commentsMail', { receiverEmail: response[2].email, template, subject: 'Post Notification' });
        }
    }

    public async getPostComments(query: IQueryComment, skip = 0, limit = 0, sort?: IQuerySort): Promise<ICommentDocument[]> {
        return new Promise((resolve) => {
            const comments: Aggregate<ICommentDocument[]> = CommentsModel.aggregate([
                { $match: query },
                { $sort: sort },
                { $skip: skip },
                { $limit: limit }
            ]);
            resolve(comments);
        });
    }

    public async getPostCommentNames(query: IQueryComment, skip = 0, limit = 0, sort?: IQuerySort): Promise<ICommentNameList[]> {
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
