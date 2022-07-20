/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthPayload } from '@user/interfaces/user.interface';
import { Response } from 'express';

const PASSWORD = 'manny1';

export const authMockRequest = (sessionData: IJwt, body: IAuthMock, currentUser?: AuthPayload | null, params?: any) => ({
  session: sessionData,
  body,
  params,
  currentUser
});

export const authMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IAuthMock {
  _id?: string;
  username?: string;
  password?: string;
  cpassword?: string;
  email?: string;
  quote?: string;
  work?: string;
  school?: string;
  location?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  messages?: boolean;
  reactions?: boolean;
  comments?: boolean;
  follows?: boolean;
  avatarColor?: string;
  avatarImage?: string;
}

export interface IJwt {
  jwt?: string;
}

export const authUserPayload: AuthPayload = {
  userId: '60263f14648fed5246e322d9',
  uId: '1621613119252066',
  username: 'Manny',
  email: 'manny@me.com',
  avatarColor: '#9c27b0',
  iat: 12345
};

export const signUpMockData = {
  _id: '605727cd646eb50e668a4e13',
  uId: '92241616324557172',
  username: 'Manny',
  email: 'manny@test.com',
  avatarColor: '#ff9800',
  password: PASSWORD,
  birthDay: { month: '', day: '' },
  postCount: 0,
  gender: '',
  quotes: '',
  about: '',
  relationship: '',
  blocked: [],
  blockedBy: [],
  bgImageVersion: '',
  bgImageId: '',
  work: [],
  school: [],
  placesLived: [],
  createdAt: new Date(),
  followersCount: 0,
  followingCount: 0,
  notifications: { messages: true, reactions: true, comments: true, follows: true },
  profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/605727cd646eb50e668a4e13'
};
