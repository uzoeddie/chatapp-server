import { IQueryReaction, IReactionDocument, IReactionJob } from '@reaction/interfaces/reaction.interface';
import { ReactionModel } from '@reaction/models/reaction.schema';
import { userCache } from '@service/redis/user.cache';
import { PostModel } from '@post/models/post.schema';
import { postCache } from '@service/redis/post.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IPostDocument } from '@post/interfaces/post.interface';
import { Aggregate, FilterQuery, Query, UpdateQuery } from 'mongoose';
import { IQuerySort } from '@comment/interfaces/comment.interface';
import { INotificationDocument, INotificationTemplate } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import { notificationTemplate } from '@service/emails/templates/notifications/notification-template';
import { emailQueue } from '@service/queues/email.queue';
import { socketIONotificationObject } from '@socket/notification';

class Reaction {
    public async addReactionDataToDB(reactionData: IReactionJob): Promise<void> {
        const { postId, userTo, username, userFrom, type, previousReaction, reactionObject } = reactionData;
        if (previousReaction) {
            delete reactionObject!._id;
        }
        const updatedReaction: [IUserDocument, UpdateQuery<IReactionDocument>, UpdateQuery<IPostDocument>] = (await Promise.all([
            userCache.getUserFromCache(`${userTo}`),
            ReactionModel.replaceOne({ postId, type: previousReaction, username }, reactionObject, {
                upsert: true
            }),
            PostModel.findOneAndUpdate(
                { _id: postId },
                {
                    $inc: {
                        [`reactions.${previousReaction}`]: -1,
                        [`reactions.${type}`]: 1
                    }
                },
                { new: true }
            )
        ])) as [IUserDocument, UpdateQuery<IReactionDocument>, UpdateQuery<IPostDocument>];
        const data: IPostDocument = updatedReaction[2] as IPostDocument;
        await postCache.updateSinglePostPropInCache(postId, 'reactions', (data.reactions as unknown) as string);
        if (userFrom !== userTo) {
            const notificationModel: INotificationDocument = new NotificationModel();
            const notifications = await notificationModel.insertNotification({
                userFrom: userFrom as string,
                userTo: userTo as string,
                message: `${username} reacted on your post.`,
                notificationType: 'reactions',
                entityId: postId,
                createdItemId: (updatedReaction[1] as IReactionDocument)._id as string
            });
            socketIONotificationObject.emit('insert notification', notifications, { userTo });
        }

        if (updatedReaction[0].notifications.reactions && userFrom !== userTo) {
            const templateParams: INotificationTemplate = {
                username: updatedReaction[0].username,
                message: `${username} reacted on your post.`,
                header: 'Post Reaction Notification'
            };
            const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
            emailQueue.addEmailJob('commentsMail', {
                receiverEmail: updatedReaction[0].email,
                template,
                subject: 'Post Reaction Notification'
            });
        }
    }

    public async removeReactionDataFromDB(reactionData: IReactionJob): Promise<void> {
        const { postId, previousReaction, username } = reactionData;
        const updatedReaction = await Promise.all([
            ReactionModel.deleteOne({ postId, type: previousReaction, username }),
            PostModel.findOneAndUpdate(
                { _id: postId },
                {
                    $inc: {
                        [`reactions.${previousReaction}`]: -1
                    }
                },
                { new: true }
            )
        ]);
        const data: IPostDocument = updatedReaction[1] as IPostDocument;
        await postCache.updateSinglePostPropInCache(postId, 'reactions', (data.reactions as unknown) as string);
    }

    public async getPostReactions(query: IQueryReaction, skip = 0, limit = 0, sort?: IQuerySort): Promise<[IReactionDocument[], number]> {
        try {
            const reactions: Aggregate<IReactionDocument[]> = ReactionModel.aggregate([
                { $match: query },
                { $sort: sort },
                { $skip: skip },
                { $limit: limit }
            ]);
            const count: Query<number, IReactionDocument> = ReactionModel.find(query as FilterQuery<IReactionDocument>).countDocuments();
            return await Promise.all([reactions, count]);
        } catch (error) {
            return error;
        }
    }
}

export const reactionService: Reaction = new Reaction();
