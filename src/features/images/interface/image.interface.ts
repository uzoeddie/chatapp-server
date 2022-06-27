import mongoose from 'mongoose';

interface Images {
    imgVersion: string;
    imgId: string;
    createdAt?: Date;
    _id?: mongoose.Types.ObjectId | string;
}

export interface Image {
    image: string;
    type?: 'image' | 'profile';
}

export interface IFileImageDocument extends mongoose.Document {
    userId: mongoose.Types.ObjectId | string;
    bgImageVersion: string;
    bgImageId: string;
    imgId: string;
    imgVersion: string;
    createdAt: Date;
}

export interface IFileImageJobData {
    key?: string;
    value?: string;
    imgId?: string;
    imgVersion?: string;
    userId?: string;
    imageId?: string;
}
