import { ObjectID } from 'mongodb';
import { Document } from 'mongoose';

export interface ICommentDocument extends Document {
    _id?: string | ObjectID;
    username: string;
    avataColor: string;
    postId: string;
    profilePicture: string;
    comment: string;
    createdAt?: Date;
    userTo?: string | ObjectID;
}

export interface ICommentJob {
    postId: string;
    userTo: string;
    userFrom: string;
    username: string;
    comment: ICommentDocument;
}

export interface ICommentNameList {
    count: number;
    names: string[];
}

export interface IQueryComment {
    _id?: string | ObjectID;
    postId?: string | ObjectID;
}

export interface IQuerySort {
    createdAt?: number;
}
