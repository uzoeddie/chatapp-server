/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';
import { IJwt } from './auth.mock';
import { unflatten } from 'flat';
import mongoose from 'mongoose';
import { AuthPayload } from '@user/interfaces/user.interface';
import { IChatMessage, IChatRedisData, IChatUser, ISearchUser } from '@chat/interfaces/chat.interface';

export const chatMockRequest = (sessionData: IJwt, body: IMessage, currentUser?: AuthPayload | null, params?: IChatParams) => ({
  session: sessionData,
  body,
  params,
  currentUser
});

export const chatMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IChatParams {
  receiverId?: string;
  conversationId?: string;
  query?: string;
}

export interface IMessage {
  conversationId?: string | null;
  receiverId?: IChatUser | string;
  receiverName?: string;
  body?: string;
  gifUrl?: string;
  isRead?: boolean;
  selectedImages?: string[];
  profilePicture?: string;
  createdAt?: Date;
  userId?: string | mongoose.Types.ObjectId;
  image?: string;
}

export const chatMessage: IMessage = {
  body: 'how are you?',
  conversationId: '602854c81c9ca7939aaeba43',
  gifUrl: '',
  isRead: false,
  profilePicture: '',
  receiverId: {
    avatarColor: '#9c27b0',
    email: 'manny@me.com',
    profilePicture: '',
    username: 'Manny',
    _id: '60263f14648fed5246e322d9'
  },
  receiverName: 'Danny',
  selectedImages: [] as any
};

export const chatUser: IChatUser = {
  _id: '602854d61c9ca7939aaeba48',
  body: 'sup man',
  conversationId: '602854c81c9ca7939aaeba43',
  createdAt: new Date(),
  gifUrl: '',
  images: [],
  isRead: false,
  senderName: 'Danny',
  receiverId: '60263f14648fed5246e322d9',
  receiverName: 'Manny',
  senderId: '602740b43eaf201998cd9297'
};

export const cachedList: string[] = [
  JSON.stringify({
    _id: '606479f0091bf02b6a710684',
    conversationId: '6064799e091bf02b6a71067f',
    'senderId._id': '60647959091bf02b6a71067d',
    'senderId.username': 'Danny',
    'senderId.avatarColor': '#009688',
    'senderId.email': 'dan@me.com',
    'senderId.profilePicture': 'https://res.cloudinary.com/ratingapp/image/upload/60647959091bf02b6a71067d',
    'receiverId._id': '6064793b091bf02b6a71067a',
    'receiverId.username': 'Manny',
    'receiverId.avatarColor': '#9c27b0',
    'receiverId.email': 'manny@me.com',
    'receiverId.profilePicture': 'https://res.cloudinary.com/ratingapp/image/upload/60647959091bf02b6a71067d',
    body: 'sup',
    isRead: false,
    gifUrl: '',
    senderName: 'Danny',
    receiverName: 'Manny',
    createdAt: '2021-03-31T13:32:32.946Z',
    images: []
  })
];

export const flattenedChatList: IChatMessage[] = [
  {
    _id: '606479f0091bf02b6a710684',
    conversationId: '6064799e091bf02b6a71067f',
    senderId: {
      _id: '60647959091bf02b6a71067d',
      username: 'Danny',
      avatarColor: '#009688',
      email: 'dan@me.com',
      profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/60647959091bf02b6a71067d'
    },
    receiverId: {
      _id: '6064793b091bf02b6a71067a',
      username: 'Manny',
      avatarColor: '#9c27b0',
      email: 'manny@me.com',
      profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/60647959091bf02b6a71067d'
    },
    body: 'sup',
    isRead: false,
    gifUrl: '',
    senderName: 'Danny',
    receiverName: 'Manny',
    createdAt: unflatten(JSON.parse(JSON.stringify('2021-03-31T13:32:32.946Z'))),
    images: []
  }
];

export const cachedMessage: string[] = [
  JSON.stringify({
    _id: '6064799e091bf02b6a710680',
    conversationId: '6064799e091bf02b6a71067f',
    'senderId._id': '6064793b091bf02b6a71067a',
    'senderId.username': 'Manny',
    'senderId.avatarColor': '#9c27b0',
    'senderId.email': 'manny@me.com',
    'senderId.profilePicture': 'https://res.cloudinary.com/ratingapp/image/upload/6064793b091bf02b6a71067a',
    'receiverId._id': '60647959091bf02b6a71067d',
    'receiverId.username': 'Danny',
    'receiverId.avatarColor': '#009688',
    'receiverId.email': 'dan@me.com',
    'receiverId.profilePicture': 'https://res.cloudinary.com/ratingapp/image/upload/6064793b091bf02b6a71067a',
    body: 'hello man',
    isRead: true,
    gifUrl: '',
    senderName: 'Manny',
    receiverName: 'Danny',
    createdAt: '2021-03-31T13:31:10.441Z',
    images: []
  })
];

export const parsedChatMessage: IChatMessage[] = [
  {
    _id: '6064799e091bf02b6a710680',
    conversationId: '6064799e091bf02b6a71067f',
    senderId: {
      _id: '6064793b091bf02b6a71067a',
      username: 'Manny',
      avatarColor: '#9c27b0',
      email: 'manny@me.com',
      profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/6064793b091bf02b6a71067a'
    },
    receiverId: {
      _id: '60647959091bf02b6a71067d',
      username: 'Danny',
      avatarColor: '#009688',
      email: 'dan@me.com',
      profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/6064793b091bf02b6a71067a'
    },
    body: 'hello man',
    isRead: true,
    gifUrl: '',
    senderName: 'Manny',
    receiverName: 'Danny',
    createdAt: unflatten(JSON.parse(JSON.stringify('2021-03-31T13:31:10.441Z'))),
    images: []
  }
];

export const redisChatData: IChatRedisData = {
  _id: '6064799e091bf02b6a710680',
  conversationId: '6064799e091bf02b6a71067f',
  'senderId._id': '6064793b091bf02b6a71067a',
  'senderId.username': 'Manny',
  'senderId.avatarColor': '#9c27b0',
  'senderId.email': 'manny@me.com',
  'senderId.profilePicture': 'https://res.cloudinary.com/ratingapp/image/upload/6064793b091bf02b6a71067a',
  'receiverId._id': '60647959091bf02b6a71067d',
  'receiverId.username': 'Danny',
  'receiverId.avatarColor': '#009688',
  'receiverId.email': 'dan@me.com',
  'receiverId.profilePicture': 'https://res.cloudinary.com/ratingapp/image/upload/6064793b091bf02b6a71067a',
  body: 'hello man',
  isRead: false,
  gifUrl: '',
  senderName: 'Manny',
  receiverName: 'Danny',
  createdAt: new Date(),
  images: []
};

export const conversationParticipants: any[] = [
  {
    _id: mongoose.Types.ObjectId('6064861bc25eaa5a5d2f9cf5'),
    participants: [
      {
        sender: mongoose.Types.ObjectId('6064793b091bf02b6a71067a'),
        receiver: mongoose.Types.ObjectId('6064858fc25eaa5a5d2f9cf3')
      }
    ]
  }
];

export const searchResult: ISearchUser[] = [
  {
    _id: '6064858fc25eaa5a5d2f9cf3',
    profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/6064858fc25eaa5a5d2f9cf3',
    username: 'Sunny',
    email: 'sunny@me.com',
    avatarColor: '#f44336'
  }
];
