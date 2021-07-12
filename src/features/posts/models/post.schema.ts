import mongoose, { model, Model, Schema } from 'mongoose';
import { IPostDocument } from '@post/interfaces/post.interface';
import { Helpers } from '@global/helpers/helpers';

const postSchema: Schema = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
        username: { type: String },
        email: { type: String },
        avataColor: { type: String },
        profilePicture: { type: String },
        post: { type: String, default: '' },
        bgColor: { type: String, default: '' },
        imgVersion: { type: String, default: '' },
        imgId: { type: String, default: '' },
        feelings: { type: Object, default: {} },
        gifUrl: { type: String, default: '' },
        privacy: { type: Object },
        commentsCount: { type: Number, default: 0 },
        reactions: {
            like: { type: Number, default: 0 },
            love: { type: Number, default: 0 },
            haha: { type: Number, default: 0 },
            wow: { type: Number, default: 0 },
            sad: { type: Number, default: 0 },
            angry: { type: Number, default: 0 }
        },
        createdAt: { type: Date, default: Date.now, index: true }
    },
    {
        toJSON: {
            transform(_doc, ret) {
                ret.reactions = Helpers.formattedReactions(ret.reactions);
                return ret;
            }
        }
    }
);

const PostModel: Model<IPostDocument> = model<IPostDocument>('Post', postSchema, 'Post');

export { PostModel };