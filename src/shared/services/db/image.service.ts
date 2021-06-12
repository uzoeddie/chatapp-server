import mongoose from 'mongoose';
import { ImageModel } from '@image/models/image.schema';
import { UserModel } from '@user/models/user.schema';

class Image {
    public async addImageToDB(userId: string, url: string): Promise<void> {
        await UserModel.updateOne({ _id: userId }, { $set: { profilePicture: url } }).exec();
    }

    public async addBackgroundImageToDB(userId: string, imgId: string, imgVersion: string): Promise<void> {
        const images = ImageModel.updateOne(
            { userId },
            {
                $set: { bgImageVersion: imgVersion, bgImageId: imgId },
                $push: {
                    images: { imgId, imgVersion }
                }
            },
            { upsert: true }
        );

        const backgroundImage = UserModel.updateOne(
            { _id: userId },
            {
                $set: { bgImageVersion: imgVersion, bgImageId: imgId }
            }
        );
        await Promise.all([images, backgroundImage]);
    }

    public async removeImageFromDB(userId: string, imageId: string): Promise<void> {
        await ImageModel.updateOne(
            { userId },
            {
                $pull: {
                    images: {
                        _id: mongoose.Types.ObjectId(imageId)
                    }
                }
            }
        ).exec();
    }
}

export const imageService: Image = new Image();
