import { UserModel } from '@user/models/user.schema';
import mongoose from 'mongoose';

class Block {
    public async blockUser(userId: string, followerId: string): Promise<void> {
        UserModel.bulkWrite([
            {
                updateOne: {
                    filter: { _id: userId, blocked: { $ne: mongoose.Types.ObjectId(followerId) } },
                    update: {
                        $push: {
                            blocked: mongoose.Types.ObjectId(followerId)
                        }
                    }
                }
            },
            {
                updateOne: {
                    filter: { _id: followerId, blockedBy: { $ne: mongoose.Types.ObjectId(userId) } },
                    update: {
                        $push: {
                            blockedBy: mongoose.Types.ObjectId(userId)
                        }
                    }
                }
            }
        ]);
    }

    public async unblockUser(userId: string, followerId: string): Promise<void> {
        UserModel.bulkWrite([
            {
                updateOne: {
                    filter: { _id: userId },
                    update: {
                        $pull: {
                            blocked: mongoose.Types.ObjectId(followerId)
                        }
                    }
                }
            },
            {
                updateOne: {
                    filter: { _id: followerId },
                    update: {
                        $pull: {
                            blockedBy: mongoose.Types.ObjectId(userId)
                        }
                    }
                }
            }
        ]);
    }
}

export const blockUserService: Block = new Block();
