import mongoose, { Document } from 'mongoose';
import { ObjectID } from 'mongodb';
import publicIP from 'public-ip';

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
  work: string;
  school: string;
  quote: string;
  location: string;
  blocked: mongoose.Types.ObjectId[];
  blockedBy: mongoose.Types.ObjectId[];
  followersCount: number;
  followingCount: number;
  notifications: INotificationSettings;
  social: ISocialLinks;
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

export interface INotificationSettings {
  messages: boolean;
  reactions: boolean;
  comments: boolean;
  follows: boolean;
}

export interface ISocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
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
  value?: string | ISocialLinks;
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

export interface IAllUsers {
  users: IUserDocument[];
  totalUsers: number;
}
