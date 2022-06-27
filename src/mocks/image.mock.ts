import { Response } from 'express';
import { IFileImageDocument } from '@image/interface/image.interface';
import { IMessage } from '@root/mocks/chat.mock';
import { AuthPayload } from '@user/interfaces/user.interface';
import { IJwt } from './auth.mock';

export const imagesMockRequest = (sessionData: IJwt, body: IMessage, currentUser?: AuthPayload | null, params?: IParams) => ({
  session: sessionData,
  body,
  params,
  currentUser
});

export const imagesMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IParams {
  followerId?: string;
  userId?: string;
  imageId?: string;
}

export const fileDocument: IFileImageDocument = {
  userId: '60263f14648fed5246e322d9',
  bgImageVersion: '',
  bgImageId: '',
  profilePicture: '',
  images: [
    {
      imgVersion: '',
      imgId: '',
      createdAt: new Date(),
      _id: '60263f14642ded5246e322d9'
    }
  ]
} as IFileImageDocument;
