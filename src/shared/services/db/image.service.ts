import mongoose from 'mongoose';
import { ImageModel } from '@image/models/image.schema';
import { UserModel } from '@user/models/user.schema';
import { IFileImageDocument } from '@image/interface/image.interface';

class Image {
  public async addUserProfileImageToDB(userId: string, url: string, imgId: string, imgVersion: string): Promise<void> {
    const updateUserProfile = UserModel.updateOne({ _id: userId }, { $set: { profilePicture: url } });
    const image: Promise<void> = this.addImage(userId, imgId, imgVersion, 'profile');
    await Promise.all([updateUserProfile, image]);
  }

  public async addBackgroundImageToDB(userId: string, imgId: string, imgVersion: string): Promise<void> {
    const image: Promise<void> = this.addImage(userId, imgId, imgVersion, 'background');
    const backgroundImage = UserModel.updateOne(
      { _id: userId },
      {
        $set: { bgImageVersion: imgVersion, bgImageId: imgId }
      }
    );
    await Promise.all([image, backgroundImage]);
  }

  public async addImage(userId: string, imgId: string, imgVersion: string, type: string): Promise<void> {
    await ImageModel.create({
      userId,
      bgImageVersion: type === 'background' ? imgVersion : '',
      bgImageId: type === 'background' ? imgId : '',
      imgId,
      imgVersion
    });
  }

  public async removeImageFromDB(imageId: string): Promise<void> {
    const imgId = new mongoose.Types.ObjectId(imageId);
    await ImageModel.deleteOne({ _id: imgId }).exec();
  }

  public async getImageByBackgroundId(bgImageId: string): Promise<IFileImageDocument> {
    const image: IFileImageDocument = await ImageModel.findOne({ bgImageId }).exec() as IFileImageDocument;
    return image;
  }
}

export const imageService: Image = new Image();
