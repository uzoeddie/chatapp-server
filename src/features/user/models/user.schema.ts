import { IUserDocument } from '@user/interfaces/user.interface';
import mongoose, { model, Model, Schema } from 'mongoose';
import { hash, compare } from 'bcryptjs';

const SALT_ROUND = 10;

const userSchema: Schema = new Schema(
    {
        username: { type: String, index: true },
        uId: { type: String },
        email: { type: String },
        password: { type: String },
        avatarColor: { type: String },
        profilePicture: { type: String, default: '' },
        postsCount: { type: Number, default: 0 },
        followersCount: { type: Number, default: 0 },
        followingCount: { type: Number, default: 0 },
        passwordResetToken: { type: String, default: '' },
        passwordResetExpires: { type: Number },
        birthDay: {
            month: { type: String, default: '' },
            day: { type: String, default: '' }
        },
        blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        notifications: {
            messages: { type: Boolean, default: true },
            reactions: { type: Boolean, default: true },
            comments: { type: Boolean, default: true },
            follows: { type: Boolean, default: true }
        },
        work: [
            {
                company: { type: String, default: '' },
                position: { type: String, default: '' },
                city: { type: String, default: '' },
                description: { type: String, default: '' },
                from: { type: String, default: '' },
                to: { type: String, default: 'Present' }
            }
        ],
        school: [
            {
                name: { type: String, default: '' },
                course: { type: String, default: '' },
                degree: { type: String, default: '' },
                from: { type: String, default: '' },
                to: { type: String, default: 'Present' }
            }
        ],
        placesLived: [
            {
                city: { type: String, default: '' },
                country: { type: String, default: '' },
                year: { type: String, default: '' },
                month: { type: String, default: '' }
            }
        ],
        gender: { type: String, default: '' },
        quotes: { type: String, default: '' },
        about: { type: String, default: '' },
        relationship: { type: String, default: '' },
        bgImageVersion: { type: String, default: '' },
        bgImageId: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now, index: true }
    },
    {
        toJSON: {
            transform(_doc, ret) {
                delete ret.password;
                return ret;
            }
        }
    }
);

userSchema.pre('save', async function (this: IUserDocument, next: () => void) {
    const hashedPassword: string = await hash(this.password as string, SALT_ROUND);
    this.password = hashedPassword;
    next();
});

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    const hashedPassword: string = ((this as unknown) as IUserDocument).password!;
    return compare(password, hashedPassword);
};

userSchema.methods.hashPassword = async function (password: string): Promise<string> {
    return hash(password, SALT_ROUND);
};

const UserModel: Model<IUserDocument> = model<IUserDocument>('User', userSchema, 'User');
export { UserModel };
