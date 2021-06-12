import { ObjectID } from 'mongodb';
import mongoose from 'mongoose';
import { IUserBirthDay, IUserDocument } from '@user/interfaces/user.interface';

export interface IFollowing {
    userId: string;
}

export interface IFollowers {
    userId: string;
}

export interface IFollowerDocument extends mongoose.Document {
    _id: mongoose.Types.ObjectId | string;
    followerId: mongoose.Types.ObjectId;
    followeeId: mongoose.Types.ObjectId;
    createdAt?: Date;
}

export interface IFollower {
    _id: mongoose.Types.ObjectId | string;
    followeeId: IFollowerData;
    followerId: IFollowerData;
    createdAt?: Date;
}

export interface IFollowerData {
    avatarColor: string;
    followersCount: number;
    followingCount: number;
    profilePicture: string;
    postCount: number;
    username: string;
    _id?: mongoose.Types.ObjectId | string;
    birthDay?: IUserBirthDay;
    userProfile?: IUserDocument;
}

export interface IFollowerJobData {
    keyOne?: string;
    keyTwo?: string;
    username?: string;
    followerDocumentId?: ObjectID;
}

export interface IBlockedUserJobData {
    keyOne?: string;
    keyTwo?: string;
    type?: string;
}
