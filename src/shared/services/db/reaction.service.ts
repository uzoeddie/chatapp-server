import mongoose from 'mongoose';
import { omit } from 'lodash';
import { IQueryReaction, IReactionDocument, IReactionJob } from '@reaction/interfaces/reaction.interface';
import { ReactionModel } from '@reaction/models/reaction.schema';
import { UserCache } from '@service/redis/user.cache';
import { PostModel } from '@post/models/post.schema';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IPostDocument } from '@post/interfaces/post.interface';
import { Aggregate, FilterQuery, Query } from 'mongoose';
import { INotificationDocument, INotificationTemplate } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import { notificationTemplate } from '@service/emails/templates/notifications/notification-template';
import { emailQueue } from '@service/queues/email.queue';
import { socketIONotificationObject } from '@socket/notification';
import { Helpers } from '@global/helpers/helpers';

const userCache = new UserCache();

class Reaction {
  public async addReactionDataToDB(reactionData: IReactionJob): Promise<void> {
    const { postId, userTo, username, userFrom, type, previousReaction, reactionObject } = reactionData;
    if (previousReaction) {
      // use delete with care. It is usually not recommended
      // delete reactionObject!._id;
      omit(reactionObject!, ['_id']);
    }
    const updatedReaction: [IUserDocument, IReactionDocument, IPostDocument] = (await Promise.all([
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
    ])) as [IUserDocument, IReactionDocument, IPostDocument];

    if (updatedReaction[0].notifications.reactions && userFrom !== userTo) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userFrom: userFrom as string,
        userTo: userTo as string,
        message: `${username} reacted on your post.`,
        notificationType: 'reactions',
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId((updatedReaction[1] as IReactionDocument)._id),
        createdAt: new Date(),
        comment: '',
        reaction: type!,
        post: updatedReaction[2].post!,
        imgId: updatedReaction[2].imgId!,
        imgVersion: updatedReaction[2].imgVersion!,
        gifUrl: updatedReaction[2].gifUrl!
      });
      socketIONotificationObject.emit('insert notification', notifications, { userTo });

      const templateParams: INotificationTemplate = {
        username: updatedReaction[0].username!,
        message: `${username} reacted on your post.`,
        header: 'Post Reaction Notification'
      };
      const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
      emailQueue.addEmailJob('commentsMail', {
        receiverEmail: updatedReaction[0].email!,
        template,
        subject: 'Post Reaction Notification'
      });
    }
  }

  public async removeReactionDataFromDB(reactionData: IReactionJob): Promise<void> {
    const { postId, previousReaction, username } = reactionData;
    await Promise.all([
      ReactionModel.deleteOne({ postId, type: previousReaction, username }),
      PostModel.updateOne(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1
          }
        },
        { new: true }
      )
    ]);
  }

  public async getPostReactions(query: IQueryReaction, sort: Record<string, 1 | -1>): Promise<[IReactionDocument[], number]> {
    const reactions: Aggregate<IReactionDocument[]> = ReactionModel.aggregate([{ $match: query }, { $sort: sort }]);
    const count: Query<number, IReactionDocument> = ReactionModel.find(query as FilterQuery<IReactionDocument>).countDocuments();
    const response: [IReactionDocument[], number] = await Promise.all([reactions, count]);
    return response;
  }

  public async getSinglePostReactionByUsername(postId: string, username: string): Promise<[IReactionDocument, number] | []> {
    const reaction: IReactionDocument | null = await ReactionModel.findOne({ postId, username: Helpers.firstLetterUppercase(username) });
    let result: [IReactionDocument, number] | [] = [];
    if (reaction) {
      result = [reaction, 1];
    }
    return result;
  }

  public async getReactionsByUsername(username: string): Promise<IReactionDocument[]> {
    const reaction: IReactionDocument[] = await ReactionModel.find({ username: Helpers.firstLetterUppercase(username) });
    return reaction;
  }
}

export const reactionService: Reaction = new Reaction();
