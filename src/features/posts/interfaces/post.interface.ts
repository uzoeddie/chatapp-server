import { IReactions } from '@reaction/interfaces/reaction.interface';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export interface IPostDocument extends Document {
  _id?: string | ObjectId;
  userId: string;
  username: string;
  email: string;
  avatarColor: string;
  profilePicture: string;
  post: string;
  bgColor: string;
  commentsCount: number;
  imgVersion?: string;
  imgId?: string;
  feelings?: string;
  gifUrl?: string;
  privacy?: string;
  reactions?: IReactions;
  createdAt?: Date;
}

// add every interface below to the downloadable file for the lecture
export type PostPrivacyType = 'Public' | 'Followers' | 'Private';

// export interface IFeeling {
//     name: string;
//     file: string;
// }

// export interface IPostPrivacy {
//     type: PostPrivacyType;
//     iconName: string;
// }

export interface ICreatePost {
  id: ObjectId | string;
  userId?: string;
  email?: string;
  username?: string;
  avatarColor?: string;
  profilePicture: string;
  post?: string;
  image?: string;
  bgColor?: string;
  feelings?: string;
  privacy?: string;
  gifUrl?: string;
  imgId?: string;
  imgVersion?: string;
  createdAt?: Date;
}

export interface IGetPostsQuery {
  _id?: ObjectId | string;
  username?: string;
  imgId?: string;
  gifUrl?: string;
}

export interface ISavePostToCache {
  key: ObjectId | string;
  currentUserId: string;
  uId: string;
  createdPost: IPostDocument;
}

export interface IPostJobData {
  key?: string;
  value?: IPostDocument;
  keyOne?: string;
  keyTwo?: string;
}

export interface IQueryComplete {
  ok?: number;
  n?: number;
}

export interface IQueryDeleted {
  deletedCount?: number;
}
