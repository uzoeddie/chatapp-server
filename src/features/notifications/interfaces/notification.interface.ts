import mongoose, { Document } from 'mongoose';

export interface INotificationDocument extends Document {
    _id?: mongoose.Types.ObjectId | string;
    userTo: string;
    userFrom: string;
    message: string;
    notificationType: string;
    entityId: mongoose.Types.ObjectId;
    createdItemId: mongoose.Types.ObjectId;
    read?: boolean;
    date?: Date;

    insertNotification(data: INotification): Promise<void>;
}

export interface INotification {
    userTo: string;
    userFrom: string;
    message: string;
    notificationType: string;
    entityId: mongoose.Types.ObjectId | string;
    createdItemId: mongoose.Types.ObjectId | string;
}

export interface INotificationJobData {
    key?: string;
}

export interface INotificationTemplate {
    username: string;
    message: string;
    header: string;
}
