import { ObjectID } from 'mongodb';
import { Document } from 'mongoose';

export interface IReactionDocument extends Document {
  _id?: string | ObjectID;
  username: string;
  avataColor: string;
  type: string;
  postId: string;
  profilePicture: string;
  createdAt?: Date;
  userTo?: string | ObjectID;
  comment?: string;
}

export interface IFormattedReaction {
  type: string;
  value: number;
}

export interface IReactions {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}

export interface IReactionJob {
  postId: string;
  username: string;
  previousReaction: string;
  userTo?: string;
  userFrom?: string;
  type?: string;
  reactionObject?: IReactionDocument;
}

export interface IQueryReaction {
  _id?: string | ObjectID;
  postId?: string | ObjectID;
}
