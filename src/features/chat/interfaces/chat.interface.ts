import mongoose, { Document } from 'mongoose';

export interface IMessageDocument extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  senderUsername: string;
  senderAvatarColor: string;
  senderProfilePicture: string;
  receiverUsername: string;
  receiverAvatarColor: string;
  receiverProfilePicture: string;
  body: string;
  gifUrl: string;
  isRead: boolean;
  selectedImage: string;
  reaction: [];
  createdAt: Date;
}

export interface ITyping {
  sender: string;
  receiver: string;
}

export interface IChatPage {
  name: string;
  url: string;
  type?: string;
}

export interface IChatUser {
  _id?: string;
  username?: string;
  email?: string;
  profilePicture?: string;
  avatarColor?: string;
  senderName?: string;
  conversationId?: string;
  body?: string;
  createdAt?: Date;
  isRead?: boolean;
  receiverId?: string;
  senderId?: string;
  receiverName?: string;
  images?: Array<string>;
  gifUrl?: string;
}

export interface IChatMessage {
  body: string;
  isRead: boolean;
  images: string[];
  conversationId: string;
  senderName: string;
  receiverName?: string;
  gifUrl: string;
  createdAt: Date;
  senderId: IChatUser;
  receiverId: IChatUser;
  _id?: string;
}

export interface IChatJobData {
  value?: IMessageDocument;
  senderId?: mongoose.Types.ObjectId | string;
  receiverId?: mongoose.Types.ObjectId | string;
  messageId?: mongoose.Types.ObjectId | string;
  senderName?: string;
  reaction?: string;
  type?: string;
}

export interface IChatRedisData {
  _id: string;
  conversationId: string;
  'senderId._id': string;
  'senderId.username': string;
  'senderId.avatarColor': string;
  'senderId.email': string;
  'senderId.profilePicture': string;
  'receiverId._id': string;
  'receiverId.username': string;
  'receiverId.avatarColor': string;
  'receiverId.email': string;
  'receiverId.profilePicture': string;
  body: string;
  isRead: boolean;
  gifUrl: string;
  senderName: string;
  receiverName: string;
  createdAt: Date;
  images: string[];
}

export interface IChatConversationId {
  _id: string;
  conversationId: string;
  createdAt: Date;
}

export interface ISearchUser {
  _id: string;
  profilePicture: string;
  username: string;
  email: string;
  avatarColor: string;
}

export interface ISenderReceiver {
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
}

export interface IChatListItemIndex {
  item: IChatMessage;
  index: number;
}

export interface IQueryMessage {
  conversationId?: mongoose.Types.ObjectId;
  $or?: ISenderReceiverQuery[];
}

interface ISenderReceiverQuery {
  senderId?: mongoose.Types.ObjectId;
  receiverId?: mongoose.Types.ObjectId;
}
