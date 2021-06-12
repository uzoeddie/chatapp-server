import mongoose, { Document } from 'mongoose';
import { ObjectID } from 'mongodb';
import publicIP from 'public-ip';
import { ListType } from '@service/redis/user-info.cache';

declare global {
    namespace Express {
        interface Request {
            currentUser?: AuthPayload;
        }
    }
}

export interface AuthPayload {
    userId: string;
    uId: string;
    email: string;
    username: string;
    avatarColor: string;
    iat?: number;
}

export interface IUserDocument extends Document {
    _id: string | ObjectID;
    uId: string;
    username: string;
    email: string;
    password?: string;
    avatarColor: string;
    postsCount: number;
    work: IUserWork[];
    school: IUserSchool[];
    gender: string;
    birthDay: IUserBirthDay;
    relationship: string;
    quotes: string;
    about: string;
    placesLived: IUserPlacesLived[];
    blocked: [mongoose.Types.ObjectId] | [];
    blockedBy: [mongoose.Types.ObjectId] | [];
    followersCount: number;
    followingCount: number;
    notifications: INotificationSettings;
    createdAt: Date;
    bgImageVersion: string;
    bgImageId: string;
    profilePicture: string;
    passwordResetToken?: string;
    passwordResetExpires?: number | string;

    comparePassword(password: string): Promise<boolean>;
    hashPassword(password: string): Promise<string>;
}

export interface ISignUpData {
    createdObjectId: ObjectID;
    uId: string;
    email: string;
    username: string;
    password: string;
}

export interface IResetPasswordParams {
    username: string;
    email: string;
    ipaddress: publicIP.CancelablePromise<string>;
    date: string;
}

export interface IUserWork {
    _id: mongoose.Types.ObjectId | string;
    company: string;
    position: string;
    city: string;
    description: string;
    from: string;
    to: string;
}

export interface IUserSchool {
    _id: mongoose.Types.ObjectId | string;
    name: string;
    course: string;
    degree: string;
    from: string;
    to: string;
}

export interface IUserBirthDay {
    month: string;
    day: string;
}

export interface IUserPlacesLived {
    _id: mongoose.Types.ObjectId | string;
    city: string;
    country: string;
    year: string;
    month: string;
}

export interface INotificationSettings {
    messages: boolean;
    reactions: boolean;
    comments: boolean;
    follows: boolean;
}

export interface ISocketData {
    blockedUser: string;
    blockedBy: string;
}

export interface ILogin {
    userId: string;
}

export interface IUserJobInfo {
    key?: string;
    prop?: string;
    value?: string | IUserBirthDay | IUserPlacesLived | IUserWork | IUserSchool | null;
    type?: string;
    data?: IUserPlacesLived[] | IUserWork[] | IUserSchool[];
    paramsId?: string;
}

export interface IUserJob {
    keyOne?: string;
    keyTwo?: string;
    key?: string;
    value?: string | INotificationSettings | IUserDocument;
}

export interface IEmailJob {
    receiverEmail: string;
    template: string;
    subject: string;
}

export interface IUserInfoListProp {
    key: string;
    value: ListType;
    prop: string;
    type: string;
    deletedItemId?: string;
}
