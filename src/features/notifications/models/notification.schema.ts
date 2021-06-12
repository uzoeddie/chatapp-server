import mongoose, { model, Model, Schema } from 'mongoose';
import { INotificationDocument, INotification } from '@notification/interfaces/notification.interface';

const notificationSchema: Schema = new Schema({
    userTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    userFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    read: { type: Boolean, default: false },
    message: { type: String, default: '' },
    notificationType: String,
    entityId: mongoose.Schema.Types.ObjectId,
    createdItemId: mongoose.Schema.Types.ObjectId,
    date: { type: Date, default: Date.now() }
});

notificationSchema.methods.insertNotification = async function (body: INotification) {
    const { userTo, userFrom, message, notificationType, entityId, createdItemId } = body;
    await NotificationModel.create({
        userTo,
        userFrom,
        message,
        notificationType,
        entityId,
        createdItemId
    });
    try {
        return await NotificationModel.find({ userTo })
            .lean()
            .populate({
                path: 'userFrom',
                select: 'username avatarColor uId profilePicture'
            })
            .sort({ date: -1 })
            .exec();
    } catch (error) {
        return error;
    }
};

const NotificationModel: Model<INotificationDocument> = model<INotificationDocument>('Notification', notificationSchema, 'Notification');
export { NotificationModel };
